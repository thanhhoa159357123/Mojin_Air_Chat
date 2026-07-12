<?php

namespace App\Http\Controllers\Api;

use App\Events\GroupCreated;
use App\Events\ConversationRead;
use App\Events\GroupRemoveParticipants;
use App\Events\UserStatusChanged;
use App\Events\UserTyping;
use App\Events\GroupAddParticipants;
use App\Events\MessageSent;
use App\Events\SystemMessageSent;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    /**
     * Lấy danh sách các cuộc trò chuyện (Inbox) - PHIÊN BẢN SIÊU TỐC ĐỘ (DẤU CHẤM XANH)
     */
    public function getConversations(Request $request)
    {
        $user = $request->user();

        // 1. LẤY TRƯỚC TOÀN BỘ ID BẠN BÈ ĐỂ CHỐNG N+1 QUERY (Chỉ tốn đúng 1 Query)
        $myFriendIds = DB::table('friends')
            ->where('user_id', $user->id)
            ->pluck('friend_id')
            ->merge(DB::table('friends')->where('friend_id', $user->id)->pluck('user_id'))
            ->unique()
            ->toArray();

        // 2. LẤY METADATA ĐỂ BẪY TIN NHẮN MA VÀ LẤY LỊCH SỬ ĐỌC
        $participantMeta = DB::table('participants')
            ->where('user_id', $user->id)
            ->get(['conversation_id', 'last_read_at', 'cleared_at'])
            ->keyBy('conversation_id');

        // 3. QUERY LẤY PHÒNG CHAT VÀ TIN NHẮN CUỐI
        $conversations = Conversation::whereHas('participants', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->with([
                'lastMessage' => function ($query) use ($user) {
                    $query->where(function ($q) use ($user) {
                        $q->whereJsonDoesntContain('deleted_by_ids', $user->id)
                            ->orWhereNull('deleted_by_ids');
                    });
                },
                'participants' => function ($query) use ($user) {
                    $query->where('users.id', '!=', $user->id)
                        ->select(['users.id', 'first_name', 'last_name', 'username', 'avatar', 'users.status']);
                }
            ])
            ->orderByDesc('updated_at') // Đẩy phòng có hoạt động mới nhất lên đầu Sidebar
            ->get();

        if ($conversations->isEmpty()) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        // 4. MAP DỮ LIỆU TRÊN RAM (0ms - KHÔNG CÒN QUERY ĐẾM TIN NHẮN)
        $conversations->each(function ($conversation) use ($participantMeta, $myFriendIds) {
            $meta = $participantMeta->get($conversation->id);
            $clearedAt = $meta?->cleared_at ? Carbon::parse($meta->cleared_at) : null;

            // Bẫy ẩn tin nhắn ma nếu thời gian tạo tin nhắn nhỏ hơn thời gian user bấm "Xóa lịch sử"
            if ($clearedAt && $conversation->lastMessage) {
                if (Carbon::parse($conversation->lastMessage->created_at)->lessThanOrEqualTo($clearedAt)) {
                    $conversation->setRelation('lastMessage', null);
                }
            }

            // BẪY TRẠNG THÁI READ-ONLY CHỐNG N+1
            $conversation->is_read_only = false;
            if ($conversation->type === 'private') {
                $partner = $conversation->participants->first();
                if ($partner) {
                    if (!in_array($partner->id, $myFriendIds)) {
                        $conversation->is_read_only = true;
                    }
                }
            }

            // 🌟 CHÌA KHÓA: Nhét thời gian đọc cuối vào để FE tự so sánh với updated_at vẽ Dấu Chấm Xanh
            $conversation->my_last_read_at = $meta?->last_read_at;
        });

        return response()->json([
            'status' => 'success',
            'data' => $conversations
        ]);
    }

    public function createConversations(Request $request)
    {
        $validated = $request->validate([
            'label' => 'nullable|string|max:255',
            'participant_ids' => 'required|array|min:2',
            'participant_ids.*' => 'exists:users,id'
        ]);

        $type = 'group';
        try {
            return DB::transaction(function () use ($type, $validated, $request) {
                $conversation = Conversation::create([
                    'type' => $type,
                    'label' => $validated['label'] ?? 'Những kẻ mộng mơ',
                    'avatar' => null,
                ]);

                $allParticipantIds = collect($validated['participant_ids'])
                    ->push($request->user()->id)
                    ->unique();

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
            return response()->json([
                'message' => 'Lỗi tạo nhóm chat, vui lòng thử lại!',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function addParticipant(Request $request, $conversationId)
    {
        $request->validate([
            'user_id' => 'required_without:user_ids|exists:users,id',
            'user_ids' => 'required_without:user_id|array|min:1',
            'user_ids.*' => 'exists:users,id'
        ]);

        $conversation = Conversation::where('id', $conversationId)
            ->where('type', 'group')
            ->with('participants')
            ->firstOrFail();

        $actorId = $request->user()->id;
        $currentParticipants = $conversation->participants;

        if (!$currentParticipants->contains('id', $actorId)) {
            return response()->json(['message' => 'Bạn không có quyền thao tác trong nhóm chat này.'], 403);
        }

        $memberIdsInput = $request->input('user_ids', []);
        if (empty($memberIdsInput) && $request->filled('user_id')) {
            $memberIdsInput = [$request->input('user_id')];
        }
        $memberIdsInput = array_values(array_unique(array_map('intval', $memberIdsInput)));

        $existingMemberIds = $currentParticipants->pluck('id')->toArray();
        $newMemberIds = array_values(array_diff($memberIdsInput, $existingMemberIds));

        if (count($newMemberIds) === 0) {
            return response()->json(['message' => 'Những người này đã là thành viên của nhóm.'], 400);
        }

        $conversation->participants()->syncWithoutDetaching($newMemberIds);

        $newMembers = User::whereIn('id', $newMemberIds)->get(['id', 'first_name', 'last_name']);
        $newMemberNames = $newMembers->map(fn($u) => trim($u->full_name))->filter()->values()->all();

        $newMembersString = implode(', ', $newMemberNames);
        $actorName = $request->user()->full_name;

        $systemContent = $newMembersString !== ''
            ? "{$actorName} đã thêm {$newMembersString} vào nhóm"
            : "{$actorName} đã thêm " . count($newMemberIds) . " thành viên vào nhóm";

        $systemMessage = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $actorId,
            'content' => $systemContent,
            'type' => 'system'
        ]);

        $allParticipantIds = array_values(array_unique(array_merge($existingMemberIds, $newMemberIds)));
        broadcast(new GroupAddParticipants($conversation, $allParticipantIds, $newMemberIds));
        broadcast(new SystemMessageSent($systemMessage, $allParticipantIds));

        return response()->json([
            'status' => 'success',
            'data' => $conversation->load('participants')
        ]);
    }

    public function addParticipants(Request $request, $conversationId)
    {
        return $this->addParticipant($request, $conversationId);
    }

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
            return response()->json(['message' => 'Bạn không có quyền truy cập phòng chat này.'], 403);
        }

        $participants = $conversation->participants()
            ->select(['users.id', 'users.username', 'users.avatar', 'users.first_name', 'users.last_name'])
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $participants
        ]);
    }

    public function removeParticipants(Request $request, $conversationId)
    {
        $request->validate([
            'user_id' => 'required_without:user_ids|exists:users,id',
            'user_ids' => 'required_without:user_id|array|min:1',
            'user_ids.*' => 'exists:users,id'
        ]);

        $conversation = Conversation::where('id', $conversationId)
            ->where('type', 'group')
            ->with('participants')
            ->firstOrFail();

        $actorId = $request->user()->id;
        $currentParticipants = $conversation->participants;

        $actorRecord = $currentParticipants->firstWhere('id', $actorId);
        if (!$actorRecord) {
            return response()->json(['message' => 'Bạn không có quyền truy cập phòng chat này.'], 403);
        }

        $targetIdsInput = $request->input('user_ids');
        if (!$targetIdsInput && $request->filled('user_id')) {
            $targetIdsInput = [$request->input('user_id')];
        }
        $targetIdsInput = array_values(array_unique(array_map('intval', $targetIdsInput ?? [])));

        $isSelfLeaving = count($targetIdsInput) === 1 && $targetIdsInput[0] === $actorId;

        if (!$isSelfLeaving) {
            if ($actorRecord->pivot->role !== 'creator') {
                return response()->json(['message' => 'Chỉ trưởng nhóm mới có quyền xóa thành viên!'], 403);
            }
            $targetIdsInput = array_values(array_diff($targetIdsInput, [$actorId]));
        }

        $existingMemberIds = $currentParticipants->pluck('id')->toArray();
        $removeIds = array_values(array_intersect($targetIdsInput, $existingMemberIds));

        if (count($removeIds) === 0) {
            return response()->json(['message' => 'Người dùng không nằm trong nhóm.'], 400);
        }

        $newCreatorId = null;
        $newCreatorName = '';

        if ($isSelfLeaving && $actorRecord->pivot->role === 'creator') {
            $candidates = $currentParticipants->where('id', '!=', $actorId);
            if ($candidates->isNotEmpty()) {
                $nextCreator = $candidates->first();
                $newCreatorId = $nextCreator->id;
                $newCreatorName = $nextCreator->full_name;
            }
        }

        $conversation->participants()->detach($removeIds);

        if ($newCreatorId) {
            DB::table('participants')
                ->where('conversation_id', $conversation->id)
                ->where('user_id', $newCreatorId)
                ->update(['role' => 'creator']);
        }

        $actorName = $request->user()->full_name;
        $systemContent = "";

        if ($isSelfLeaving) {
            $systemContent = "{$actorName} đã rời khỏi nhóm";
            if ($newCreatorId) {
                $systemContent .= ". {$newCreatorName} đã trở thành trưởng nhóm mới";
            }
        } else {
            $removedUsers = User::whereIn('id', $removeIds)->get(['id', 'first_name', 'last_name']);
            $removedNames = $removedUsers->map(fn($u) => trim($u->full_name))->filter()->values()->all();
            $removedString = implode(', ', $removedNames);

            $systemContent = $removedString !== ''
                ? "{$actorName} đã mời {$removedString} rời nhóm"
                : "{$actorName} đã mời " . count($removeIds) . " thành viên rời nhóm";
        }

        $systemMessage = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $actorId,
            'content' => $systemContent,
            'type' => 'system'
        ]);

        $allImpactedUserIds = $existingMemberIds;
        broadcast(new GroupRemoveParticipants($conversation, $allImpactedUserIds, $removeIds));
        broadcast(new SystemMessageSent($systemMessage, $allImpactedUserIds));

        return response()->json([
            'status' => 'success',
            'data' => $conversation->load('participants')
        ]);
    }

    public function typing(Request $request, $conversationId)
    {
        $user = [
            'id' => $request->user()->id,
            'full_name' => $request->user()->full_name ?? 'User',
            'avatar' => $request->user()->avatar
        ];
        broadcast(new UserTyping($conversationId, $user));
        return response()->json(['success' => true]);
    }

    public function markConversationRead(Request $request, $conversationId)
    {
        $userId = $request->user()->id;

        $isParticipant = DB::table('participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->exists();

        if (!$isParticipant) {
            return response()->json(['message' => 'Bạn không có quyền truy cập phòng chat này.'], 403);
        }

        $readAt = now();

        DB::table('participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->update(['last_read_at' => $readAt]);

        broadcast(new ConversationRead($conversationId, $userId, $readAt->toIso8601String()))->toOthers();

        return response()->json(['success' => true]);
    }

    public function updateStatus(Request $request)
    {
        $request->validate(['status' => 'required|in:online,offline']);
        $user = $request->user();
        $user->update([
            'status' => $request->status,
            'last_active_at' => now(),
        ]);
        broadcast(new UserStatusChanged($user->id, $user->status, $user->last_active_at));
        return response()->json(['success' => true]);
    }
}
