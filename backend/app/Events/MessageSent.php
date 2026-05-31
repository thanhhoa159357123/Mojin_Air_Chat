<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// NHỚ DÙNG ShouldBroadcastNow để tin nhắn bắn đi NGAY LẬP TỨC (không bị delay vào Queue)
class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct($message)
    {
        $this->message = $message;
    }

    /**
     * Tên các Kênh (Channels) sẽ được phát sóng
     */
    public function broadcastOn()
    {
        // 1. Kênh 1: Bắn vào phòng chat chung để cập nhật Khung Chat
        $channels = [
            new Channel('chat-room.' . $this->message->conversation_id)
        ];

        // 2. Kênh 2: Quét toàn bộ thành viên trong phòng (trừ thằng gửi)
        // để bắn thẳng vào Sidebar của tụi nó
        if (isset($this->message->conversation->participants)) {
            foreach ($this->message->conversation->participants as $participant) {
                // Không bắn lại cho chính thằng gửi (để tránh tự đẩy noti cho mình)
                if ($participant->id !== $this->message->user_id) {
                    $channels[] = new Channel('user-sidebar.' . $participant->id);
                }
            }
        }

        return $channels;
    }

    /**
     * ĐỔI TÊN EVENT: Ép nó khớp 100% với chữ "new-message" ở Frontend
     */
    public function broadcastAs()
    {
        return 'new-message';
    }
}
