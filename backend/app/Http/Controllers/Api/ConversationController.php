<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
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
                $conversation->participants()->sync($allParticipantIds);

                // 4. (Optional) Tạo một tin nhắn hệ thống đầu tiên
                Message::create([
                    'conversation_id' => $conversation->id,
                    'user_id' => $request->user()->id,
                    'content' => "{$request->user()->full_name} đã tạo nhóm",
                    'type' => 'system'
                ]);

                return $conversation->load('participants');
            });
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            Log::error("File: " . $e->getFile() . " Line: " . $e->getLine());
            return response()->json([
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}
