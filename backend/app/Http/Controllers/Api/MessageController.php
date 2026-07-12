<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageDeleted;
use App\Events\MessageEdited;
use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
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
                    $q->where('user_id', $myId)->where('friend_id', $friendId);
                })->orWhere(function ($q) use ($myId, $friendId) {
                    $q->where('user_id', $friendId)->where('friend_id', $myId);
                });
            })
            ->exists();
    }

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
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $paginated->setCollection($paginated->getCollection()->reverse()->values());

        return $paginated;
    }

    private function updateLastMessage(Conversation $conversation)
    {
        $newLastMessage = $conversation->messages()
            ->orderBy('created_at', 'desc')
            ->first();

        // Lệnh này vừa cập nhật ID tin cuối, vừa tự động gõ đầu trường `updated_at` của conversation tăng lên (Cực quan trọng để làm Dấu Chấm Xanh)
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
                $conversation = Conversation::where('id', $id)
                    ->where('type', 'private')
                    ->whereHas('participants', fn($q) => $q->where('users.id', $myId))
                    ->first();

                if (!$conversation) {
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
                }
            }
        } else {
            $conversation = Conversation::where('id', $id)
                ->whereHas('participants', fn($q) => $q->where('users.id', $myId))
                ->firstOrFail();
        }

        // Đánh dấu đã đọc luồng trực tiếp khi vừa mở phòng chat
        DB::table('participants')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $myId)
            ->update(['last_read_at' => now()]);

        $paginatedMessages = $this->fetchMessages($conversation->id, $myId);

        return response()->json([
            'status' => 'success',
            'data' => $paginatedMessages->items(),
            'hasMore' => $paginatedMessages->hasMorePages()
        ]);
    }

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

        if ($request->filled('friend_id')) {
            $targetId = $request->friend_id;

            $existingConvById = Conversation::where('id', $targetId)
                ->where('type', 'private')
                ->whereHas('participants', fn($q) => $q->where('users.id', $myId))
                ->first();

            if ($existingConvById) {
                $conversation = $existingConvById;
            } else {
                $conversation = Conversation::where('type', 'private')
                    ->whereHas('participants', fn($q) => $q->where('users.id', $myId))
                    ->whereHas('participants', fn($q) => $q->where('users.id', $targetId))
                    ->first();

                if (!$conversation) {
                    if (!$this->isAcceptedFriend($myId, $targetId)) {
                        return response()->json(['message' => 'Bạn chưa kết bạn với người này.'], 403);
                    }
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

        if ($conversation->type === 'private') {
            $partnerId = DB::table('participants')
                ->where('conversation_id', $conversation->id)
                ->where('user_id', '!=', $myId)
                ->value('user_id');

            if ($partnerId) {
                if (!$this->isAcceptedFriend($myId, $partnerId)) {
                    return response()->json([
                        'message' => 'Bạn không thể gửi tin nhắn do hai người hiện không còn là bạn bè.'
                    ], 403);
                }
            }
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $myId,
            'content' => $validated['content'],
            'type' => $validated['type'] ?? 'text',
            'parent_id' => $validated['parent_id'] ?? null
        ]);

        // 🌟 BÍ THUẬT 1: Cập nhật luôn ngày đọc của người nhắn bằng thời gian hiện tại
        // Đảm bảo last_read_at đồng bộ tuyệt đối với updated_at sắp tăng ở hàm updateLastMessage bên dưới
        DB::table('participants')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $myId)
            ->update(['last_read_at' => now()]);

        $this->updateLastMessage($conversation);

        $fullMessageData = $message->load([
            'sender:id,first_name,last_name,avatar',
            'parent.sender:id,first_name,last_name',
            'conversation.participants:id'
        ]);

        broadcast(new MessageSent($fullMessageData))->toOthers();

        return response()->json([
            'status' => 'success',
            'data' => $fullMessageData
        ]);
    }

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

        $conversation = $message->conversation;

        if ($message->user_id === $myId) {
            $message->delete();
            $type = 'delete_for_all';
        } else {
            $ids = $message->deleted_by_ids ?? [];
            if (!in_array($myId, $ids)) {
                $ids[] = $myId;
                $message->update(['deleted_by_ids' => array_values(array_unique($ids))]);
            }
            $type = 'delete_for_me';
        }

        // 🌟 BÍ THUẬT 2: Đồng bộ mốc đọc cuối của người xóa khi phòng chat bị thay đổi update_at
        DB::table('participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $myId)
            ->update(['last_read_at' => now()]);

        $this->updateLastMessage($conversation);

        if ($type === 'delete_for_all') {
            broadcast(new MessageDeleted($messageId, $conversationId, $type))->toOthers();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Đã xóa tin nhắn thành công.',
            'type' => $type
        ]);
    }

    public function deleteAllMessages(Request $request, $conversationId)
    {
        $myId = $request->user()->id;

        // 🌟 BÍ THUẬT 3: Khi dọn sạch lịch sử, vừa cắm mốc cleared_at vừa update luôn last_read_at cho đồng bộ khít kịt
        $updated = DB::table('participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $myId)
            ->update([
                'cleared_at' => now(),
                'last_read_at' => now()
            ]);

        if (!$updated) {
            return response()->json(['message' => 'Phòng chat không tồn tại hoặc bạn không thuộc phòng này.'], 404);
        }

        broadcast(new MessageDeleted(0, $conversationId, 'clear_history'))->toOthers();

        return response()->json(['status' => 'success', 'message' => 'Đã dọn dẹp lịch sử trò chuyện thành công!']);
    }

    public function editMessage(Request $request, $conversationId, $messageId)
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

        if ($message->user_id !== $myId) {
            return response()->json(['message' => 'Bạn không có quyền chỉnh sửa tin nhắn của người khác.'], 403);
        }

        $validated = $request->validate(['content' => 'required|string']);

        $message->content = $validated['content'];
        $message->edit_count += 1;
        $message->save();

        // 🌟 BÍ THUẬT 4: Người sửa tin nhắn thành công mặc định là đã cập nhật mốc đọc mới nhất trùng với mốc updated_at của phòng
        DB::table('participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $myId)
            ->update(['last_read_at' => now()]);

        $this->updateLastMessage($message->conversation);

        $fullMessageData = $message->load([
            'sender:id,first_name,last_name,avatar',
            'parent.sender:id,first_name,last_name',
            'conversation.participants:id'
        ]);

        broadcast(new MessageEdited($fullMessageData))->toOthers();

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật tin nhắn thành công!',
            'data' => $fullMessageData
        ]);
    }
}
