<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FriendUnblocked implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $userId;        // Người bỏ chặn (Thằng A)
    public int $unblockedId;   // Người được bỏ chặn (Thằng B)

    public function __construct(int $userId, int $unblockedId)
    {
        $this->userId = $userId;
        $this->unblockedId = $unblockedId;
    }

    public function broadcastOn(): array
    {
        // Bắn vào kênh của thằng được bỏ chặn
        return [
            new Channel('user-friend-actions.' . $this->unblockedId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'friendship-unblocked';
    }

    public function broadcastWith(): array
    {
        return [
            'unblocked_by' => $this->userId,
            'action_type' => 'unblock'
        ];
    }
}
