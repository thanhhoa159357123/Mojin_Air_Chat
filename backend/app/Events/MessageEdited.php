<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast; 
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// 💡 Đổi thành implements ShouldBroadcast
class MessageEdited implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // Thuộc tính chứa cục dữ liệu tin nhắn mới tinh sau khi sửa
    public $message;

    public function __construct($message)
    {
        $this->message = $message;
    }

    /**
     * ĐỊNH TUYẾN KÊNH PHÁT SÓNG
     */
    public function broadcastOn(): array
    {
        return [
            // 💡 Đổi PrivateChannel thành Channel cho khớp hệ thống
            new Channel('chat-room.' . $this->message->conversation_id),
        ];
    }

    /**
     * Tùy biến cái tên sự kiện trả về cho Frontend dễ bắt bài
     */
    public function broadcastAs(): string
    {
        return 'MessageEdited';
    }
}