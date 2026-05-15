<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Support\Facades\Log;

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

    /**
     * HÀM BẢO BỐI 2: Lấy tin nhắn (Xử lý lọc tin đã xóa)
     */
    private function fetchMessages($conversationId, $myId)
    {
        return Message::where('conversation_id', $conversationId)
            ->where(function ($query) use ($myId) {
                $query->whereJsonDoesntContain('deleted_by_ids', $myId)
                    ->orWhereNull('deleted_by_ids');
            })
            ->with([
                'sender:id,first_name,last_name,avatar',
                'parent.sender:id,first_name,last_name'
            ])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * HÀM BẢO BỐI 3: Cập nhật last_message_id sau khi xóa/gửi
     */
    private function updateLastMessage(Conversation $conversation, $myId)
    {
        $newLastMessage = $conversation->messages()
            ->where(function ($query) use ($myId) {
                $query->whereJsonDoesntContain('deleted_by_ids', $myId)
                    ->orWhereNull('deleted_by_ids');
            })
            ->latest()
            ->first();

        $conversation->update(['last_message_id' => $newLastMessage?->id]);
    }

    /**
     * API: Lấy tin nhắn (Tự động nhận diện Friend hoặc Group)
     */
    public function getMessages(Request $request, $id)
    {
        $myId = $request->user()->id;
        $type = $request->query('type', 'private'); // FE truyền lên type để biết đường tìm

        if ($type === 'private') {
            $conversation = $this->getOrCreatePrivateConversation($myId, $id);
        } else {

            $conversation = Conversation::where('id', $id)
                ->whereHas('participants', fn($q) => $q->where('users.id', $myId))
                ->firstOrFail();
        }

        return response()->json([
            'status' => 'success',
            'data' => $this->fetchMessages($conversation->id, $myId)
        ]);
    }

    /**
     * API: Gửi tin nhắn (Vạn năng cho cả 2 loại)
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'friend_id' => 'required_without:conversation_id|exists:users,id',
            // 'conversation_id' => 'required_without:friend_id|exists:conversations,id',
            'content' => 'required|string',
            // 'type' => 'nullable|in:text,image,file'
        ]);

        $myId = $request->user()->id;

        // 1. Xác định Conversation
        if ($request->filled('friend_id')) {
            $conversation = $this->getOrCreatePrivateConversation($myId, $request->friend_id);
        } else {
            $conversation = Conversation::where('id', $request->conversation_id)
                ->whereHas('participants', fn($q) => $q->where('users.id', $myId))
                ->firstOrFail();
        }

        // 2. Lưu tin nhắn
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $myId,
            'content' => $request->input('content'),
            'type' => $request->input('type') ?? 'text',
            'parent_id' => $request->input('parent_id')
        ]);

        // 3. Cập nhật meta cho phòng chat
        $conversation->update(['last_message_id' => $message->id]);
        $conversation->touch();

        return response()->json([
            'status' => 'success',
            'data' => $message->load('sender:id,first_name,last_name,avatar', 'parent.sender:id,first_name,last_name')
        ]);
    }

    /**
     * API: Xóa tin nhắn (Dùng ID phòng cho chuẩn)
     */
    public function deleteMessage(Request $request, $conversationId, $messageId)
    {
        $myId = $request->user()->id;
        $message = Message::where('id', $messageId)
            ->where('conversation_id', $conversationId)
            ->firstOrFail();

        if ($message->user_id === $myId) {
            // Thu hồi (Xóa vĩnh viễn hoặc bác có thể dùng SoftDelete)
            $message->delete();
            $type = 'unsend';
        } else {
            // Ẩn phía tôi
            $ids = $message->deleted_by_ids ?? [];
            if (!in_array($myId, $ids)) {
                $ids[] = $myId;
                $message->update(['deleted_by_ids' => array_unique($ids)]);
            }
            $type = 'delete_for_me';
        }

        $this->updateLastMessage($message->conversation, $myId);

        return response()->json(['status' => 'success', 'type' => $type]);
    }

    /**
     * API: Dọn sạch lịch sử trò chuyện
     */
    public function deleteAllMessages(Request $request, $conversationId)
    {
        $myId = $request->user()->id;
        $conversation = Conversation::where('id', $conversationId)
            ->whereHas('participants', fn($q) => $q->where('users.id', $myId))
            ->firstOrFail();

        // Tối ưu: Dùng Query Builder để update hàng loạt (Không dùng foreach)
        // Lưu ý: Tùy vào DB, cách update JSON có thể khác. Đây là cách an toàn:
        $messages = $conversation->messages()->get();
        foreach ($messages as $message) {
            $ids = $message->deleted_by_ids ?? [];
            if (!in_array($myId, $ids)) {
                $ids[] = $myId;
                $message->update(['deleted_by_ids' => $ids]);
            }
        }

        $this->updateLastMessage($conversation, $myId);

        return response()->json(['status' => 'success', 'message' => 'Đã dọn dẹp lịch sử.']);
    }
}
