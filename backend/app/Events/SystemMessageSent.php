<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SystemMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $notifyUserIds;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message, array $notifyUserIds)
    {
        $this->message = $message;
        $this->notifyUserIds = $notifyUserIds; // Danh sách những người cần nhận tin nhắn này
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = [];
        // Bắn vào kênh công khai user.id của từng khứa cho đồng bộ với FE
        foreach ($this->notifyUserIds as $userId) {
            $channels[] = new Channel('user.' . $userId);
        }
        return $channels;
    }

    /**
     * Tên sự kiện định danh riêng cho tin nhắn hệ thống
     */
    public function broadcastAs(): string
    {
        return 'system.message_sent';
    }
}
