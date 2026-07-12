<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FriendBlocked implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $userId;      // Người chặn (Thằng A)
    public int $blockedId;   // Người bị chặn (Thằng B)

    public function __construct(int $userId, int $blockedId)
    {
        $this->userId = $userId;
        $this->blockedId = $blockedId;
    }

    public function broadcastOn(): array
    {
        // Bắn vào kênh của thằng bị chặn để máy nó tự động khóa UI
        return [
            new Channel('user-friend-actions.' . $this->blockedId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'friendship-blocked'; // Dùng lại tên event cũ ở FE để đỡ phải sửa hàm bind!
    }

    public function broadcastWith(): array
    {
        return [
            'unfriended_by' => $this->userId, // Khớp key ở FE để đưa box chat về read-only
            'action_type' => 'block'
        ];
    }
}
