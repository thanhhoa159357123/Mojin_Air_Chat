<?php

namespace App\Events;

use App\Models\Conversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupRemoveParticipants implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conversation;
    public $notifyUserIds;   // Danh sách toàn bộ user liên quan (ở lại + bị kick) để bắn Pusher
    public $removedUserIds;  // Danh sách riêng những khứa vừa bị đá đít / tự rời đi
    public $systemMessage;

    /**
     * Create a new event instance.
     */
    public function __construct(Conversation $conversation, array $notifyUserIds, array $removedUserIds = [], $systemMessage = null)
    {
        // Load sẵn participants mới nhất để Front-End nhận được cấu trúc mới luôn
        $this->conversation = $conversation->load('participants');
        $this->notifyUserIds = $notifyUserIds;
        $this->removedUserIds = $removedUserIds;
        $this->systemMessage = $systemMessage;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = [];

        // Bắn vào kênh riêng tư của từng khứa để bảo mật dữ liệu chat
        foreach ($this->notifyUserIds as $userId) {
            $channels[] = new Channel('user.' . $userId);
        }

        return $channels;
    }

    /**
     * Tên sự kiện để Front-End lắng nghe cho gọn gàng
     */
    public function broadcastAs(): string
    {
        return 'group.remove_participants';
    }
}
