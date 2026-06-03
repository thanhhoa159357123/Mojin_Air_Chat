<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageEdited implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // 💡 Thuộc tính chứa cục dữ liệu tin nhắn mới tinh sau khi sửa
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct($message)
    {
        $this->message = $message;
    }

    /**
     * 🚀 ĐỊNH TUYẾN KÊNH PHÁT SÓNG: Bắn vào đúng phòng chat riêng tư
     * (Bác check xem cái Event MessageSent cũ bác đang set kênh là gì thì đổi tên cho giống nhé)
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];
    }

    /**
     * 💡 Tùy biến cái tên sự kiện trả về cho Frontend dễ bắt bài
     */
    public function broadcastAs(): string
    {
        return 'MessageEdited';
    }
}
