<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FriendRequestAccepted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $accepterId;
    public $requesterId;
    public $accepterData; // 💡 Thêm khoang chứa data người chấp nhận

    // 💡 Sửa Constructor để nhận thêm data
    public function __construct(int $accepterId, int $requesterId, $accepterData)
    {
        $this->accepterId = $accepterId;
        $this->requesterId = $requesterId;
        $this->accepterData = $accepterData;
    }

    public function broadcastOn()
    {
        return new Channel('user-sidebar.' . $this->requesterId);
    }

    public function broadcastAs()
    {
        return 'friend-accepted';
    }

    public function broadcastWith()
    {
        // 💡 Bắn đầy đủ data sang Frontend theo đúng định dạng
        return [
            'friend_id'   => $this->accepterId,
            'friend_data' => $this->accepterData,
        ];
    }
}
