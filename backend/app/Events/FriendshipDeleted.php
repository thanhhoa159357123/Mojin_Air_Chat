<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel; // 💡 Dùng Private để bảo mật tin nhắn
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FriendshipDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $friendId;

    /**
     * Khởi tạo Event với thông tin 2 người liên quan
     */
    public function __construct(int $userId, int $friendId)
    {
        $this->userId = $userId;
        $this->friendId = $friendId;
    }

    /**
     * Đăng ký kênh để bắn tín hiệu về
     * Bắn thẳng vào kênh cá nhân của thằng bạn để máy nó tự cập nhật
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user-friend-actions.' . $this->friendId),
        ];
    }

    /**
     * Tên của sự kiện khi Next.js bind nhận data
     */
    public function broadcastAs(): string
    {
        return 'friendship-deleted';
    }

    /**
     * Dữ liệu trả về cho Frontend húp
     */
    public function broadcastWith(): array
    {
        return [
            'unfriended_by' => $this->userId,
        ];
    }
}
