<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $status;
    public $lastActiveAt;

    public function __construct($userId, $status, $lastActiveAt)
    {
        $this->userId = $userId;
        $this->status = $status;
        $this->lastActiveAt = $lastActiveAt;
    }

    public function broadcastOn()
    {
        // Bắn vào một kênh chung để TẤT CẢ mọi người cùng nghe được trạng thái của nhau
        // (Nếu hệ thống lớn thì phải bắn vào từng user-sidebar, nhưng app nhỏ làm kênh chung cho lẹ)
        return new Channel('mojin-global-presence');
    }

    public function broadcastAs()
    {
        return 'user-status-changed';
    }
}
