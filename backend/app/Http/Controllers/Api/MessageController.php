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
     * HÀM BẢO BỐI: Tìm hoặc tạo phòng chat 1-1
     */
    private function searchAndaddConversationWithFriend($myId, $friendId)
    {
        // Tìm phòng chat giữa 2 người
        // Điều kiện là loại phòng private kèm theo cả 2 người tham gia là tôi và người bạn cụ thể
        $conversation = Conversation::query()->where('type', 'private')
            ->whereHas('participants', function ($q) use ($myId) {
                $q->where('users.id', $myId);
            })
            ->whereHas('participants', function ($q) use ($friendId) {
                $q->where('users.id', $friendId);
            })
            ->first();

        // Nếu chưa có thì tạo mới
        if (!$conversation) {
            $conversation = Conversation::create(['type' => 'private']);
            $conversation->participants()->attach([$myId, $friendId]);
        }

        return $conversation;
    }

    /**
     * API: Lấy danh sách tin nhắn với 1 người bạn
     */
    public function getMessageWithFriend(Request $request, $friendId)
    {
        // Kiểm tra xem friendId có phải là bạn bè của mình không, nếu không phải thì trả về lỗi
        $myId = $request->user()->id;
        // Gọi hàm bảo bối để lấy phòng chat
        $conversation = $this->searchAndaddConversationWithFriend($myId, $friendId);

        // Lấy tin nhắn từ phòng chat có id của mình và bạn bè đấy
        $messages = Message::query()->where('conversation_id', $conversation->id)
            ->where(function ($query) use ($myId) {
                $query->whereJsonDoesntContain('deleted_by_ids', $myId)
                    ->orWhereNull('deleted_by_ids');
            })
            ->with('sender:id,first_name,last_name,avatar') // Lấy kèm avatar người gửi
            // Sắp xếp theo thời gian tạo tin nhắn để hiển thị đúng thứ tự
            ->orderBy('created_at', 'asc')
            ->get();
        return response()->json([
            'status' => 'success',
            'data' => $messages
        ]);
    }

    /**
     * API: Gửi tin nhắn mới
     */
    public function sendMessage(Request $request)
    {
        // Kiểm tra dữ liệu đầu vào rằng có phải người bạn đấy có phải là bạn bè của mình không, nếu không phải thì trả về lỗi
        $request->validate([
            'friend_id' => 'required|exists:users,id',
            'content' => 'required|string'
        ]);
        Log::info("Người dùng " . $request->user()->id . " đang cố gắng gửi tin nhắn đến người bạn " . $request->input('friend_id'));

        // Lấy ID của người gửi (chính là user đang đăng nhập)
        $myId = $request->user()->id;
        Log::info("Người dùng $myId đang cố gắng gửi tin nhắn đến người bạn " . $request->input('friend_id'));

        // Gọi hàm bảo bối để lấy phòng chat
        $conversation = $this->searchAndaddConversationWithFriend($myId, $request->input('friend_id'));
        Log::info("Đã tìm thấy hoặc tạo phòng chat với ID: " . $conversation->id);

        // Lưu tin nhắn vào DB
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $myId,
            'content' => $request->input('content'),
            'type' => 'text'
        ]);
        Log::info("Đã lưu tin nhắn mới với ID: " . $message->id);

        // Cập nhật lại thời gian phòng chat
        $conversation->update(['last_message_id' => $message->id]);
        $conversation->touch();

        // Load thông tin người gửi để Frontend có avatar và tên in ra luôn không cần query lại
        $message->load('sender:id,first_name,last_name,avatar');

        return response()->json([
            'status' => 'success',
            'data' => $message
        ]);
    }

    /**
     * Xoá tin nhắn (Theo dòng chat)
     */
    public function deleteMessage(Request $request, $friendId, $messageId)
    {
        $myId = (int)$request->user()->id;
        $conversation = $this->searchAndaddConversationWithFriend($myId, $friendId);
        Log::info("User $myId đang cố gắng xóa tin nhắn $messageId trong conversation " . $conversation->id);


        $message = Message::query()->where('id', $messageId)
            ->where('conversation_id', $conversation->id)
            ->first();

        Log::info("User $myId đang cố gắng xóa tin nhắn $messageId trong conversation " . $conversation->id);

        if (!$message) {
            return response()->json(['status' => 'error', 'message' => 'Không tìm thấy tin nhắn'], 404);
        }

        // --- LOGIC MỚI Ở ĐÂY ---
        if ($message->user_id === $myId) {
            // TRƯỜNG HỢP 1: TIN NHẮN CỦA MÌNH -> BAY MÀU VĨNH VIỄN
            // Xóa sạch bản ghi khỏi DB, cả 2 bên đều không thấy gì nữa
            $message->forceDelete();

            Log::info("User $myId đã thu hồi tin nhắn $messageId, tin nhắn đã bị xóa vĩnh viễn");
            return response()->json([
                'status' => 'success',
                'type' => 'unsend', // Trả về type để FE biết là tin nhắn này đã "bốc hơi"
                'message' => 'Đã thu hồi tin nhắn vĩnh viễn.'
            ]);
        } else {
            // TRƯỜNG HỢP 2: TIN NHẮN CỦA BẠN -> CHỈ ẨN PHÍA MÌNH
            $ids = $message->deleted_by_ids ?? [];
            if (!in_array($myId, $ids)) {
                $ids[] = $myId;
                $message->deleted_by_ids = array_unique($ids);
                $message->save();
            }

            Log::info("User $myId đã xóa tin nhắn $messageId, tin nhắn vẫn tồn tại nhưng đã được ẩn ở phía người dùng");
            return response()->json([
                'status' => 'success',
                'type' => 'delete_for_me',
                'message' => 'Đã ẩn tin nhắn ở phía bạn.'
            ]);
        }
    }

    /**
     * Xoá toàn bộ tin nhắn (Người bạn kia thì vẫn thấy tin nhắn, còn mình thì không thấy nữa)
     */
    public function deleteAllMessages(Request $request, $friendId)
    {
        $myId = (int)$request->user()->id; // Ép kiểu để so sánh cho chuẩn
        Log::info("User $myId đang dọn dẹp hệ thống chat với $friendId");

        // Lấy conversation
        $conversation = $this->searchAndaddConversationWithFriend($myId, $friendId);

        // Lấy tất cả tin nhắn trong phòng mà mình CHƯA xóa (để tối ưu)
        $messages = $conversation->messages()
            ->where(function ($query) use ($myId) {
                $query->whereJsonDoesntContain('deleted_by_ids', $myId)
                    ->orWhereNull('deleted_by_ids');
            })->get();

        foreach ($messages as $message) {
            $ids = $message->deleted_by_ids ?? [];
            if (!in_array($myId, $ids)) {
                $ids[] = $myId;
                // Gán lại mảng mới đã có ID của mình
                $message->deleted_by_ids = array_unique($ids);
                $message->save();
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Đã ẩn toàn bộ tin nhắn phía bạn. Đối phương vẫn xem được bình thường.'
        ]);
    }
}
