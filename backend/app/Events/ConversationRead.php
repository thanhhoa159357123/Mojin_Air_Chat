<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $conversationId;
    public int $userId;
    public string $lastReadAt;

    public function __construct(int $conversationId, int $userId, string $lastReadAt)
    {
        $this->conversationId = $conversationId;
        $this->userId = $userId;
        $this->lastReadAt = $lastReadAt;
    }

    public function broadcastOn()
    {
        return [new Channel('chat-room.' . $this->conversationId)];
    }

    public function broadcastAs()
    {
        return 'conversation-read';
    }
}
