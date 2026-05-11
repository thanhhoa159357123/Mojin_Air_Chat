<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;

class ConversationController extends Controller
{
    /**
     * Lấy danh sách các cuộc trò chuyện (Inbox) của user đang đăng nhập
     */
    public function getConversations(Request $request)
    {
        // Lấy thông tin user hiện tại từ token
        $user = $request->user();

        // Lấy các cuộc trò chuyện mà user có tham gia
        $conversations = Conversation::whereHas('participants', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->with([
                // Lấy thông tin tin nhắn cuối cùng để hiển thị đoạn preview kèm thời gian
                'lastMessage',
                // Load thông tin các người tham gia khác (không bao gồm mình)
                'participants' => function ($query) use ($user) {
                    $query->where('users.id', '!=', $user->id)
                        ->select(['users.id', 'first_name', 'last_name', 'avatar', 'users.status']);
                }
            ])
            ->orderByDesc('updated_at') // Cuộc trò chuyện nào có tin nhắn mới thì trồi lên đầu
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $conversations
        ]);
    }
}
