<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageDeleted;
use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * HÀM BẢO BỐI 1: Tìm hoặc tạo phòng chat 1-1
     */
    private function getOrCreatePrivateConversation($myId, $friendId)
    {
        $conversation = Conversation::where('type', 'private')
            ->whereHas('participants', function ($q) use ($myId) {
                $q->where('users.id', $myId);
            })
            ->whereHas('participants', function ($q) use ($friendId) {
                $q->where('users.id', $friendId);
            })
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create(['type' => 'private']);
            $conversation->participants()->attach([$myId, $friendId]);
        }

        return $conversation;
    }

    private function isAcceptedFriend($myId, $friendId)
    {
        return DB::table('friends')
            ->where('status', 1)
            ->where(function ($q) use ($myId, $friendId) {
                $q->where(function ($q) use ($myId, $friendId) {
                    $q->where('user_id', $myId)
                        ->where('friend_id', $friendId);
                })->orWhere(function ($q) use ($myId, $friendId) {
                    $q->where('user_id', $friendId)
                        ->where('friend_id', $myId);
                });
            })
            ->exists();
    }

    /**
     * HÀM BẢO BỐI 2: Lấy tin nhắn (Xử lý lọc tin đã xóa và lịch sử đã dọn)
     */
    private function fetchMessages($conversationId, $myId)
    {
        $clearedAt = DB::table('participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $myId)
            ->value('cleared_at');

        $paginated = Message::where('conversation_id', $conversationId)
            ->when($clearedAt, function ($query) use ($clearedAt) {
                $query->where('created_at', '>', $clearedAt);
            })
            ->where(function ($query) use ($myId) {
                $query->whereJsonDoesntContain('deleted_by_ids', $myId)
                    ->orWhereNull('deleted_by_ids');
            })
            ->with([
                'sender:id,first_name,last_name,avatar',
                'parent.sender:id,first_name,last_name'
            ])
            // 💡 SỬA Ở ĐÂY: Phải lấy DESC để ưu tiên lấy 30 tin mới nhất!
            ->orderBy('created_at', 'desc')
            ->paginate(30);

        // 💡 BÍ THUẬT: Vì lấy DESC nên tin nhắn đang bị ngược (tin mới nhất nằm trên cùng).
        // Phải lật ngược mảng lại để Frontend render xuôi chiều từ trên xuống dưới.
        $paginated->setCollection($paginated->getCollection()->reverse()->values());

        return $paginated;
    }

    /**
     * HÀM BẢO BỐI 3: Cập nhật last_message_id tuyệt đối cho phòng chat
     */
    private function updateLastMessage(Conversation $conversation)
    {
        // Cập nhật lại last_message_id thành ID của tin nhắn mới nhất chưa bị thu hồi
        // (Bỏ qua việc lọc deleted_by_ids ở đây vì last_message_id là dùng chung cho CẢ PHÒNG)
        $newLastMessage = $conversation->messages()
            ->orderBy('created_at', 'desc')
            ->first();

        $conversation->update(['last_message_id' => $newLastMessage ? $newLastMessage->id : null]);
    }

    public function getMessages(Request $request, $id)
    {
        $myId = $request->user()->id;
        $type = $request->query('type', 'private');
        $byFriend = $request->query('by') === 'friend';

        if ($type === 'private') {
            if ($byFriend) {
                if (!User::where('id', $id)->exists()) {
                    return response()->json(['message' => 'Người dùng này không tồn tại hoặc đã bị xóa!'], 404);
                }

                if (!$this->isAcceptedFriend($myId, $id)) {
                    return response()->json(['message' => 'Bạn chưa kết bạn với người này.'], 403);
                }

                $conversation = Conversation::where('type', 'private')
                    ->whereHas('participants', fn($q) => $q->where('users.id', $myId))
                    ->whereHas('participants', fn($q) => $q->where('users.id', $id))
                    ->first();

                if (!$conversation) {
                    return response()->json([
                        'status' => 'success',
                        'data' => [],
                        'hasMore' => false
                    ]);
                }
            } else {
                // Trường hợp 1: $id truyền vào là ID của một Phòng Chat đã tồn tại
                $conversation = Conversation::where('id', $id)
                    ->where('type', 'private')
                    ->whereHas('participants', fn($q) => $q->where('users.id', $myId))
                    ->first();

                // Trường hợp 2: Nếu không tìm thấy phòng bằng $id đó, chứng tỏ $id này là Friend ID (User ID)
                if (!$conversation) {
                    if (!User::where('id', $id)->exists()) {
                        return response()->json(['message' => 'Người dùng này không tồn tại hoặc đã bị xóa!'], 404);
                    }

                    if (!$this->isAcceptedFriend($myId, $id)) {
                        return response()->json(['message' => 'Bạn chưa kết bạn với người này.'], 403);
                    }

                    // 💡 MÈO ĐEN LUỒNG NÀY: Thử tìm xem hai đứa đã có phòng ẩn dưới DB chưa
                    $conversation = Conversation::where('type', 'private')
                        ->whereHas('participants', fn($q) => $q->where('users.id', $myId))
                        ->whereHas('participants', fn($q) => $q->where('users.id', $id))
                        ->first();

                    // 🌟 CHỐT HẠ: Nếu thực sự chưa từng chat một câu nào (Không có phòng)
                    // Trả về mảng rỗng ngay lập tức, TUYỆT ĐỐI không tạo phòng rác trong DB!
                    if (!$conversation) {
                        return response()->json([
                            'status' => 'success',
                            'data' => [],
                            'hasMore' => false
                        ]);
                    }
                }
            }
        } else {
            // Group Chat giữ nguyên
            $conversation = Conversation::where('id', $id)
                ->whereHas('participants', fn($q) => $q->where('users.id', $myId))
                ->firstOrFail();
        }

        DB::table('participants')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $myId)
            ->update(['last_read_at' => now()]);

        // Nếu có phòng (phòng cũ hoặc vừa tìm được theo Friend ID), fetch tin nhắn như thường
        $paginatedMessages = $this->fetchMessages($conversation->id, $myId);

        return response()->json([
            'status' => 'success',
            'data' => $paginatedMessages->items(),
            'hasMore' => $paginatedMessages->hasMorePages()
        ]);
    }

    /**
     * API: Gửi tin nhắn (Cũng thông minh nốt)
     */
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'friend_id' => 'nullable|integer',
            'conversation_id' => 'nullable|integer',
            'content' => 'required|string',
            'type' => 'nullable|in:text,image,file,mixed',
            'parent_id' => 'nullable|exists:messages,id'
        ]);

        $myId = $request->user()->id;

        // 1. Xác định Conversation bằng logic "thông minh"
        if ($request->filled('friend_id')) {
            $targetId = $request->friend_id;

            // 💡 MÀNG LỌC 1: Đề phòng Frontend "ngáo", ném nhầm ID phòng chat vào trường friend_id
            $existingConvById = Conversation::where('id', $targetId)
                ->where('type', 'private')
                ->whereHas('participants', fn($q) => $q->where('users.id', $myId))
                ->first();

            if ($existingConvById) {
                // Nếu đúng là ID phòng chat thì bế ra xài luôn
                $conversation = $existingConvById;
            } else {
                // 💡 MÀNG LỌC 2: Nó thực sự là Friend ID. Tìm xem có phòng chat ẩn giữa 2 người chưa
                $conversation = Conversation::where('type', 'private')
                    ->whereHas('participants', fn($q) => $q->where('users.id', $myId))
                    ->whereHas('participants', fn($q) => $q->where('users.id', $targetId))
                    ->first();

                // 💡 MÀNG LỌC 3: Vẫn chưa có phòng? Tạo mới! (Lúc này mới check kết bạn)
                if (!$conversation) {
                    if (!$this->isAcceptedFriend($myId, $targetId)) {
                        return response()->json(['message' => 'Bạn chưa kết bạn với người này.'], 403);
                    }
                    // Khách bấm gửi tin nhắn đầu tiên -> Tạo phòng chính chủ!
                    $conversation = $this->getOrCreatePrivateConversation($myId, $targetId);
                }
            }
        } elseif ($request->filled('conversation_id')) {
            $conversation = Conversation::where('id', $request->conversation_id)
                ->whereHas('participants', fn($q) => $q->where('users.id', $myId))
                ->firstOrFail();
        } else {
            return response()->json(['message' => 'Thiếu thông tin người nhận hoặc nhóm.'], 400);
        }

        // 2. Lưu tin nhắn
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $myId,
            'content' => $validated['content'],
            'type' => $validated['type'] ?? 'text',
            'parent_id' => $validated['parent_id'] ?? null
        ]);

        // 3. Cập nhật meta cho phòng chat
        $this->updateLastMessage($conversation);

        $fullMessageData = $message->load([
            'sender:id,first_name,last_name,avatar',
            'parent.sender:id,first_name,last_name',
            'conversation.participants:id'
        ]);

        // 4. Phát sóng Real-time
        broadcast(new MessageSent($fullMessageData))->toOthers();

        return response()->json([
            'status' => 'success',
            'data' => $fullMessageData
        ]);
    }

    /**
     * API: Xóa tin nhắn đơn lẻ (Thu hồi hoặc ẩn phía tôi)
     */
    public function deleteMessage(Request $request, $conversationId, $messageId)
    {
        $myId = $request->user()->id;

        $isParticipant = DB::table('participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $myId)
            ->exists();

        if (!$isParticipant) {
            return response()->json(['message' => 'Bạn không có quyền truy cập phòng chat này.'], 403);
        }

        $message = Message::where('id', $messageId)
            ->where('conversation_id', $conversationId)
            ->firstOrFail();

        $conversation = $message->conversation; // 💡 Lưu lại phòng chat trước khi delete

        if ($message->user_id === $myId) {
            // Thu hồi vĩnh viễn tin nhắn của chính mình (Tin số 5)
            $message->delete();
            $type = 'unsend';
        } else {
            // Ẩn phía tôi bằng cách push ID vào JSON array (Tin số 3)
            $ids = $message->deleted_by_ids ?? [];
            if (!in_array($myId, $ids)) {
                $ids[] = $myId;
                $message->update(['deleted_by_ids' => array_unique($ids)]);
            }
            $type = 'delete_for_me';
        }

        // Cập nhật lại last_message_id sau khi dòng kia biến mất
        $this->updateLastMessage($conversation);

        // 🚀 BẮN TIN HIỆU REAL-TIME SANG CHO ĐỐI PHƯƠNG
        broadcast(new MessageDeleted($messageId, $conversationId, $type))->toOthers();

        return response()->json(['status' => 'success', 'message' => 'Tin nhắn đã được xóa.', 'type' => $type]);
    }

    /**
     * API: Dọn sạch lịch sử trò chuyện (Siêu tốc độ - Không foreach)
     */
    public function deleteAllMessages(Request $request, $conversationId)
    {
        $myId = $request->user()->id;

        // TỐI ƯU TUYỆT ĐỐI: Ghi nhận mốc thời gian xóa lịch sử vào thẳng bảng pivot của đúng user này
        $updated = DB::table('participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $myId)
            ->update(['cleared_at' => now()]);

        if (!$updated) {
            return response()->json(['message' => 'Phòng chat không tồn tại hoặc bạn không thuộc phòng này.'], 404);
        }

        return response()->json(['status' => 'success', 'message' => 'Đã dọn dẹp lịch sử trò chuyện thành công!']);
    }
}
