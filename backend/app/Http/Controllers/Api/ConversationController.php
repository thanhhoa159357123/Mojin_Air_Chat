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
     * KỊCH BẢN: TẠO NHÓM CHAT MỚI (GROUP)
     * 1. Validate đảm bảo có ít nhất 2 thành viên được mời (không tính người tạo).
     * 2. Chạy DB Transaction: Tạo vỏ nhóm -> Gom ID độc nhất -> Sync bảng trung gian kèm Role.
     * 3. Bắn tin nhắn hệ thống thông báo tạo nhóm & Broadcast real-time cập nhật UI cho mọi người.
     * TODO: Viết function xóa bạn và block bạn
     */
    public function createConversations(Request $request)
    {
        // * Kiểm tra dữ liệu đầu vào, đảm bảo có ít nhất 2 người tham gia (không bao gồm cả người tạo)
        $validated = $request->validate([
            'label' => 'nullable|string|max:255',
            'participant_ids' => 'required|array|min:2',
            'participant_ids.*' => 'exists:users,id'
        ]);

        $type = 'group';
        try {
            // * Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu, tránh trường hợp tạo conversation thành công nhưng lỗi khi sync participants
            return DB::transaction(function () use ($type, $validated, $request) {
                // * 1: Khởi tạo vỏ cuộc hội thoại nhóm
                $conversation = Conversation::create([
                    'type' => $type,
                    'label' => $validated['label'] ?? 'Những kẻ mộng mơ', // Default như bác muốn
                    'avatar' => null,
                ]);

                // * 2: Gom ID người mời và ép thêm ID người tạo vào mảng độc nhất
                $allParticipantIds = collect($validated['participant_ids'])
                    ->push($request->user()->id)
                    ->unique();

                /**
                 * * Tạo mảng sync
                 * * Duyệt qua tất cả ID để gán role, nếu ID nào trùng với user hiện tại (là người tạo group ) thì gán 'creator', còn lại là 'member'
                 */
                $syncData = [];
                foreach ($allParticipantIds as $id) {
                    $syncData[$id] = ['role' => ($id === $request->user()->id) ? 'creator' : 'member'];
                }
                $conversation->participants()->sync($syncData);

                // * 3. Tạo tin nhắn hệ thống thông báo nhóm mới được tạo
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
            // ! CẢNH BÁO: Log lỗi hệ thống hoặc ẩn đi khi đem lên Production
            return response()->json([
                'message' => 'Lỗi tạo nhóm chat, vui lòng thử lại!', // Nên trả về lỗi chung cho user, giấu lỗi thật đi
                'error' => $e->getMessage() // Chỉ hiện lúc đang dev
            ], 500);
        }
    }

    /**
     * 💡 KỊCH BẢN: THÊM THÀNH VIÊN VÀO NHÓM CHAT (GROUP)
     * 1. Validate linh hoạt: Chấp nhận cả 1 ID lẻ hoặc 1 mảng ID thành viên mới.
     * 2. Gạn lọc dữ liệu: Loại bỏ những ID đã có mặt sẵn trong nhóm chat.
     * 3. Sync không xóa cũ (syncWithoutDetaching) để thêm người mới vào nhóm.
     * 4. Tạo tin nhắn hệ thống thông báo danh sách tên người được thêm & Broadcast real-time.
     */
    private function addParticipant(Request $request, $conversationId)
    {
        // * Validate đầu vào: Hỗ trợ linh hoạt cả user_id (số ít) lẫn user_ids (số nhiều/mảng)
        $request->validate([
            'user_id' => 'required_without:user_ids|exists:users,id',
            'user_ids' => 'required_without:user_id|array|min:1',
            'user_ids.*' => 'exists:users,id'
        ]);

        // * Mò tìm cuộc trò chuyện nhóm, đéo thấy thì quăng lỗi 404
        $conversation = Conversation::where('id', $conversationId)
            ->where('type', 'group')
            ->firstOrFail();

        // * Ép toàn bộ dữ liệu ID đầu vào về một dạng Mảng (Array) để dễ xử lý chung ở dưới
        $memberIdsInput = $request->input('user_ids');
        if (!$memberIdsInput && $request->filled('user_id')) {
            $memberIdsInput = [$request->input('user_id')];
        }

        // * Gạn lọc dữ liệu đầu vào: Ép kiểu số nguyên, xóa ID trùng lặp, lôi ID hiện tại trong DB lên RAM
        $memberIdsInput = array_values(array_unique(array_map('intval', $memberIdsInput ?? [])));
        $memberIds = $conversation->participants()->pluck('users.id')->toArray();

        // * So găng 2 mảng: Tìm ra ID mới tinh. Nếu không có ai mới thì chặn đứng trả lỗi 400
        $newMemberIds = array_values(array_diff($memberIdsInput, $memberIds));
        if (count($newMemberIds) === 0) {
            return response()->json(['message' => 'Người dùng đã là thành viên của nhóm'], 400);
        }

        // * Đồng bộ nạp thành viên mới vào bảng trung gian mà đéo làm ảnh hưởng đến người cũ
        $conversation->participants()->syncWithoutDetaching($newMemberIds);

        // * BƯỚC 4: Tạo tin nhắn hệ thống (System Message) và kích nổ Broadcast Real-time
        // 4.1 Cào Họ Tên sạch sẽ của mớ User mới lên RAM để chuẩn bị nối chuỗi
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

        // 4.2 Bẫy logic: Tự động render nội dung thông báo theo Tên cụ thể hoặc theo Số lượng
        $actorName = $request->user()->full_name;
        $memberCount = count($newMemberIds);
        $systemContent = $newMembersString !== ''
            ? "{$actorName} đã thêm {$newMembersString} vào nhóm"
            : "{$actorName} đã thêm {$memberCount} thành viên vào nhóm";

        // 4.3 Khởi tạo bản ghi tin nhắn hệ thống vào DB
        Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $request->user()->id,
            'content' => $systemContent,
            'type' => 'system'
        ]);

        // 4.4 Phát tín hiệu real-time qua Pusher để Front-End NextJS tự động húp dữ liệu cập nhật Sidebar
        $participantIds = $conversation->participants()->pluck('users.id')->toArray();
        broadcast(new GroupCreated($conversation, $participantIds));

        return response()->json([
            'status' => 'success',
            'data' => $conversation->load('participants')
        ]);
    }

    public function addParticipants(Request $request, $conversationId)
    {
        // * Hàm này chỉ là wrapper để gọi hàm addParticipant chính, tách riêng ra để dễ bảo trì và có thể thêm logic kiểm tra quyền hạn sau này
        return $this->addParticipant($request, $conversationId);
    }

    /**
     * 💡 KỊCH BẢN: LẤY DANH SÁCH THÀNH VIÊN TRONG NHÓM CHAT
     * 1. Tìm kiếm phòng chat nhóm, nếu đéo tồn tại thì quăng lỗi 404.
     * 2. Check Security: Kiểm tra user hiện tại có nằm trong phòng không, né trường hợp hack API.
     * 3. Trả về list thành viên kèm các trường dữ liệu tối giản (tránh lộ password, email...).
     */
    public function getParticipants(Request $request, $conversationId)
    {
        $userId = $request->user()->id;

        // * Bước 1: Mò tìm cuộc trò chuyện, ép đúng loại là 'group' mới chịu
        $conversation = Conversation::where('id', $conversationId)
            ->where('type', 'group')
            ->firstOrFail();

        // * Bước 2: Check xem user đang gọi API có thực sự nằm trong phòng này không (Chống xem trộm)
        $isParticipant = DB::table('participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->exists();

        // * Bẫy bảo mật: Đéo có tên trong phòng thì tiễn khách bằng lỗi 403 
        if (!$isParticipant) {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập phòng chat này.'
            ], 403);
        }

        // * Bước 3: Hốt danh sách thành viên ra, chỉ select các trường an toàn phục vụ render UI
        $participants = $conversation->participants()
            ->select(['users.id', 'first_name', 'last_name', 'username', 'avatar', 'users.status'])
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $participants
        ]);
    }

    /**
     * KỊCH BẢN: XÓA THÀNH VIÊN KHỎI NHÓM CHAT (Kick Member)
     * 1. Validate linh hoạt: Chấp nhận cả 1 ID lẻ hoặc 1 mảng ID thành viên cần xóa.
     * 2. Kiểm tra quyền hạn: Chỉ trưởng nhóm (creator) mới có quyền kick người khác, nhưng ai cũng có quyền tự rời nhóm.
     * 3. Sync bảng trung gian để xóa thành viên khỏi nhóm, đồng thời tạo tin nhắn hệ thống thông báo ai đã bị kick hoặc ai đã tự rời nhóm.
     * 4. Broadcast real-time cập nhật UI cho những người còn lại trong nhóm.   
     */
    public function removeParticipants(Request $request, $conversationId)
    {
        /** Validate đầu vào: Hỗ trợ linh hoạt cả user_id (số ít) lẫn user_ids (số nhiều/mảng)
         *  Lưu ý: Nếu chỉ có 1 ID và ID đó trùng với người gọi API thì xem như là hành động tự rời nhóm, không cần phải có quyền creator
         */
        $request->validate([
            'user_id' => 'required_without:user_ids|exists:users,id',
            'user_ids' => 'required_without:user_id|array|min:1',
            'user_ids.*' => 'exists:users,id'
        ]);

        // * Lấy thông tin cuộc trò chuyện, đảm bảo là loại 'group' và tồn tại, nếu không sẽ trả về lỗi 404
        $conversation = Conversation::where('id', $conversationId)
            ->where('type', 'group')
            ->firstOrFail();

        $actorId = $request->user()->id;

        // * Lấy danh sách thành viên hiện tại của nhóm từ DB để kiểm tra quyền hạn
        $actorRecord = DB::table('participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $actorId)
            ->first();
        if (!$actorRecord) {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập phòng chat này.'
            ], 403);
        }
        
        // TODO: Cần kiểm tra kĩ lại luồng logic 
        /**
         * * Ép toàn bộ dữ liệu ID đầu vào về một dạng Mảng (Array) để dễ xử lý chung ở dưới
         * * Loại bỏ những ID trùng lặp, ép kiểu số nguyên và gom lại thành mảng duy nhất
         */
        $targetIdsInput = $request->input('user_ids');
        if (!$targetIdsInput && $request->filled('user_id')) {
            $targetIdsInput = [$request->input('user_id')];
        }
        $targetIdsInput = array_values(array_unique(array_map('intval', $targetIdsInput ?? [])));

        $isSelfLeaving = count($targetIdsInput) === 1 && $targetIdsInput[0] === $actorId;

        if (!$isSelfLeaving) {
            if ($actorRecord->role !== 'creator') {
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
