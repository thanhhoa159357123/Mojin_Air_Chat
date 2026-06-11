<?php

namespace App\Http\Controllers\Api;

use App\Events\GroupCreated;
use App\Events\ConversationRead;
use App\Events\UserStatusChanged;
use App\Events\UserTyping;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ConversationController extends Controller
{
    /**
     * Lấy danh sách các cuộc trò chuyện (Inbox) của user đang đăng nhập
     */
    public function getConversations(Request $request)
    {
        // Lấy thông tin user hiện tại từ token
        $user = $request->user();

        // 💡 BƯỚC ĐỘT PHÁ 1: Lấy trước metadata (cleared_at, last_read_at) của User để chuẩn bị bẫy tin nhắn ma
        $participantMeta = DB::table('participants')
            ->where('user_id', $user->id)
            ->get(['conversation_id', 'last_read_at', 'cleared_at'])
            ->keyBy('conversation_id');

        // Lấy các cuộc trò chuyện mà user có tham gia
        $conversations = Conversation::whereHas('participants', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->with([
                // 💡 BƯỚC ĐỘT PHÁ 2: Nắn lại câu query lastMessage
                'lastMessage' => function ($query) use ($user, $participantMeta) {
                    $query->where(function ($q) use ($user) {
                        $q->whereJsonDoesntContain('deleted_by_ids', $user->id)
                            ->orWhereNull('deleted_by_ids');
                    });
                },
                // Load thông tin các người tham gia khác (không bao gồm mình)
                'participants' => function ($query) use ($user) {
                    $query->where('users.id', '!=', $user->id)
                        ->select(['users.id', 'first_name', 'last_name', 'username', 'avatar', 'users.status']);
                }
            ])
            ->orderByDesc('updated_at') // Cuộc trò chuyện nào có tin nhắn mới thì trồi lên đầu
            ->get();

        // 💡 FIX LỖI SỐ 4 (N+1 Query): Lấy toàn bộ tin nhắn chưa đọc của TẤT CẢ các phòng trong 1 Query
        $conversationIds = $conversations->pluck('id')->toArray();
        $allUnreadMessages = Message::whereIn('conversation_id', $conversationIds)
            ->where('user_id', '!=', $user->id)
            ->where(function ($query) use ($user) {
                $query->whereJsonDoesntContain('deleted_by_ids', $user->id)
                    ->orWhereNull('deleted_by_ids');
            })
            ->get(['id', 'conversation_id', 'created_at']);

        $unreadGrouped = $allUnreadMessages->groupBy('conversation_id');

        // Phân bổ và tính toán dữ liệu cho từng phòng
        $conversations->each(function ($conversation) use ($user, $participantMeta, $unreadGrouped) {
            $meta = $participantMeta->get($conversation->id);
            $lastReadAt = $meta?->last_read_at ? Carbon::parse($meta->last_read_at) : null;
            $clearedAt = $meta?->cleared_at ? Carbon::parse($meta->cleared_at) : null;

            $threshold = null;
            if ($lastReadAt && $clearedAt) {
                $threshold = $lastReadAt->greaterThan($clearedAt) ? $lastReadAt : $clearedAt;
            } else {
                $threshold = $lastReadAt ?? $clearedAt;
            }

            // BÍ THUẬT TRIỆT TIÊU MA: Ẩn tin nhắn cuối nếu đã bị dọn lịch sử
            if ($clearedAt && $conversation->lastMessage) {
                if (Carbon::parse($conversation->lastMessage->created_at)->lessThanOrEqualTo($clearedAt)) {
                    $conversation->setRelation('lastMessage', null);
                }
            }

            // 💡 Đếm tin nhắn từ RAM, không chọc SQL nữa!
            $unreadCount = 0;
            if ($unreadGrouped->has($conversation->id)) {
                $messagesInRoom = $unreadGrouped->get($conversation->id);
                if ($threshold) {
                    $unreadCount = $messagesInRoom->where('created_at', '>', $threshold)->count();
                } else {
                    $unreadCount = $messagesInRoom->count();
                }
            }

            $conversation->unread_count = $unreadCount;
        });

        return response()->json([
            'status' => 'success',
            'data' => $conversations
        ]);
    }

    /**
     * Tạo cuộc trò chuyện mới của nhóm
     */
    public function createConversations(Request $request)
    {
        $validated = $request->validate([
            'label' => 'nullable|string|max:255',
            'participant_ids' => 'required|array|min:2',
            'participant_ids.*' => 'exists:users,id'
        ]);
        Log::info("Dữ liệu", $validated);
        $type = 'group';
        try {
            return DB::transaction(function () use ($type, $validated, $request) {
                // 1. Tạo Conversation
                $conversation = Conversation::create([
                    'type' => $type,
                    'label' => $validated['label'] ?? 'Những kẻ mộng mơ', // Default như bác muốn
                    'avatar' => null,
                ]);

                Log::info("Đã tạo cuộc trò chuyện mới với ID: {$conversation->id}");

                // 2. Gom ID (Unique để tránh trường hợp user mời chính mình vào mảng)
                $allParticipantIds = collect($validated['participant_ids'])
                    ->push($request->user()->id)
                    ->unique();

                // 3. Sync vào bảng trung gian
                $syncData = [];
                foreach ($allParticipantIds as $id) {
                    $syncData[$id] = ['role' => ($id === $request->user()->id) ? 'creator' : 'member'];
                }
                $conversation->participants()->sync($syncData);

                Message::create([
                    'conversation_id' => $conversation->id,
                    'user_id' => $request->user()->id,
                    'content' => "{$request->user()->full_name} đã tạo nhóm",
                    'type' => 'system'
                ]);

                broadcast(new GroupCreated($conversation, $allParticipantIds->toArray()));

                return $conversation->load('participants');
            });
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            Log::error("File: " . $e->getFile() . " Line: " . $e->getLine());
            return response()->json([
                'message' => 'Lỗi tạo nhóm chat, vui lòng thử lại!', // Nên trả về lỗi chung cho user, giấu lỗi thật đi
                'error' => $e->getMessage() // Chỉ hiện lúc đang dev
            ], 500);
        }
    }

    /**
     * Thêm thành viên vào nhóm
     */
    public function addParticipant(Request $request, $conversationId)
    {
        $request->validate([
            'user_id' => 'required_without:user_ids|exists:users,id',
            'user_ids' => 'required_without:user_id|array|min:1',
            'user_ids.*' => 'exists:users,id'
        ]);

        $conversation = Conversation::where('id', $conversationId)
            ->where('type', 'group')
            ->firstOrFail();

        $memberIdsInput = $request->input('user_ids');
        if (!$memberIdsInput && $request->filled('user_id')) {
            $memberIdsInput = [$request->input('user_id')];
        }

        $memberIdsInput = array_values(array_unique(array_map('intval', $memberIdsInput ?? [])));
        $memberIds = $conversation->participants()->pluck('users.id')->toArray();

        $newMemberIds = array_values(array_diff($memberIdsInput, $memberIds));

        if (count($newMemberIds) === 0) {
            return response()->json(['message' => 'Người dùng đã là thành viên của nhóm'], 400);
        }

        $conversation->participants()->syncWithoutDetaching($newMemberIds);

        $newMembers = User::whereIn('id', $newMemberIds)
            ->get(['id', 'first_name', 'last_name']);

        $newMemberNames = $newMembers
            ->map(fn($u) => trim($u->full_name))
            ->filter()
            ->values()
            ->all();

        $newMembersString = '';
        if (count($newMemberNames) > 0) {
            $newMembersString = implode(', ', $newMemberNames);
        }

        $actorName = $request->user()->full_name;
        $memberCount = count($newMemberIds);
        $systemContent = $newMembersString !== ''
            ? "{$actorName} đã thêm {$newMembersString} vào nhóm"
            : "{$actorName} đã thêm {$memberCount} thành viên vào nhóm";

        Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $request->user()->id,
            'content' => $systemContent,
            'type' => 'system'
        ]);

        $participantIds = $conversation->participants()->pluck('users.id')->toArray();
        broadcast(new GroupCreated($conversation, $participantIds));

        return response()->json([
            'status' => 'success',
            'data' => $conversation->load('participants')
        ]);
    }

    public function addParticipants(Request $request, $conversationId)
    {
        return $this->addParticipant($request, $conversationId);
    }

    /**
     * Lấy danh sách thành viên trong nhóm
     */
    public function getParticipants(Request $request, $conversationId)
    {
        $userId = $request->user()->id;

        $conversation = Conversation::where('id', $conversationId)
            ->where('type', 'group')
            ->firstOrFail();

        $isParticipant = DB::table('participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->exists();

        if (!$isParticipant) {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập phòng chat này.'
            ], 403);
        }

        $participants = $conversation->participants()
            ->select(['users.id', 'first_name', 'last_name', 'username', 'avatar', 'users.status'])
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $participants
        ]);
    }

    /**
     * Kick thành viên khỏi nhóm
     */
    public function removeParticipants(Request $request, $conversationId)
    {
        $request->validate([
            'user_id' => 'required_without:user_ids|exists:users,id',
            'user_ids' => 'required_without:user_id|array|min:1',
            'user_ids.*' => 'exists:users,id'
        ]);

        $conversation = Conversation::where('id', $conversationId)
            ->where('type', 'group')
            ->firstOrFail();

        $actorId = $request->user()->id;

        $actorRecord = DB::table('participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $actorId)
            ->first();

        if (!$actorRecord) {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập phòng chat này.'
            ], 403);
        }

        $targetIdsInput = $request->input('user_ids');
        if (!$targetIdsInput && $request->filled('user_id')) {
            $targetIdsInput = [$request->input('user_id')];
        }

        $targetIdsInput = array_values(array_unique(array_map('intval', $targetIdsInput ?? [])));
        
        // 💡 FIX LỖI SỐ 3: Tách biệt logic Tự rời nhóm và Kick người khác
        $isSelfLeaving = count($targetIdsInput) === 1 && $targetIdsInput[0] === $actorId;

        if (!$isSelfLeaving) {
            if ($actorRecord->role !== 'creator' && $actorRecord->role !== 'admin') {
                return response()->json(['message' => 'Chỉ trưởng nhóm mới có quyền xóa thành viên!'], 403);
            }
            // Không được tự kick chính mình trong lệnh kick số đông
            $targetIdsInput = array_values(array_diff($targetIdsInput, [$actorId]));
            if (count($targetIdsInput) === 0) {
                return response()->json(['message' => 'Vui lòng chọn thành viên hợp lệ để xóa.'], 400);
            }
        }

        if (count($targetIdsInput) === 0) {
            return response()->json(['message' => 'Không thể tự xoá chính mình khỏi nhóm.'], 400);
        }

        $memberIds = $conversation->participants()->pluck('users.id')->toArray();
        $removeIds = array_values(array_intersect($targetIdsInput, $memberIds));

        if (count($removeIds) === 0) {
            return response()->json(['message' => 'Người dùng không nằm trong nhóm.'], 400);
        }

        $conversation->participants()->detach($removeIds);

        $actorName = $request->user()->full_name;

        if ($isSelfLeaving) {
            $systemContent = "{$actorName} đã rời khỏi nhóm";
        } else {
            $removedUsers = User::whereIn('id', $removeIds)->get(['id', 'first_name', 'last_name']);
            $removedNames = $removedUsers->map(fn($u) => trim($u->full_name))->filter()->values()->all();
            
            $removedString = count($removedNames) > 0 ? implode(', ', $removedNames) : '';
            $removedCount = count($removeIds);
            
            $systemContent = $removedString !== ''
                ? "{$actorName} đã mời {$removedString} rời nhóm"
                : "{$actorName} đã mời {$removedCount} thành viên rời nhóm";
        }

        Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $actorId,
            'content' => $systemContent,
            'type' => 'system'
        ]);

        $participantIds = $conversation->participants()->pluck('users.id')->toArray();
        broadcast(new GroupCreated($conversation, $participantIds));

        return response()->json([
            'status' => 'success',
            'data' => $conversation->load('participants')
        ]);
    }

    // 1. Hàm nhận tín hiệu Typing từ Frontend
    public function typing(Request $request, $conversationId)
    {
        // Lấy thông tin người đang gõ phím
        $user = [
            'id' => $request->user()->id,
            'full_name' => $request->user()->full_name ?? 'User',
            'avatar' => $request->user()->avatar
        ];

        // Bắn Event đi (sẽ bay vào 'chat-room.id' với tên 'user-typing')
        broadcast(new UserTyping($conversationId, $user));

        return response()->json(['success' => true]);
    }

    // 3. Đánh dấu đã đọc tin nhắn trong cuộc trò chuyện
    public function markConversationRead(Request $request, $conversationId)
    {
        $userId = $request->user()->id;

        $isParticipant = DB::table('participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->exists();

        if (!$isParticipant) {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập phòng chat này.'
            ], 403);
        }

        $readAt = now();

        DB::table('participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->update(['last_read_at' => $readAt]);

        broadcast(new ConversationRead($conversationId, $userId, $readAt->toIso8601String()))->toOthers();

        return response()->json(['success' => true]);
    }

    // 2. Hàm cập nhật trạng thái On/Off
    // (Bác có thể gọi hàm này lúc User Login xong, hoặc lúc User đóng tab trình duyệt)
    public function updateStatus(Request $request)
    {
        $request->validate([
            'status' => 'required|in:online,offline'
        ]);

        $user = $request->user();

        // Lưu vào DB (cột status và last_active_at bác đã thiết kế cực chuẩn)
        $user->update([
            'status' => $request->status,
            'last_active_at' => now(),
        ]);

        // Bắn Event cho toàn Server biết (bay vào 'mojin-global-presence')
        broadcast(new UserStatusChanged($user->id, $user->status, $user->last_active_at));

        return response()->json(['success' => true]);
    }
}
