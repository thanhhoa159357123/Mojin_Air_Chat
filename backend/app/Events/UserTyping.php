<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserTyping implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conversationId;
    public $user; // Mình truyền info user (id, name, avatar) để UI dễ hiển thị

    public function __construct($conversationId, $user)
    {
        $this->conversationId = $conversationId;
        $this->user = $user;
    }

    public function broadcastOn()
    {
        // Bắn vào phòng chat chung để ai đang mở phòng này đều thấy
        return new Channel('chat-room.' . $this->conversationId);
    }

    public function broadcastAs()
    {
        return 'user-typing';
    }
}
