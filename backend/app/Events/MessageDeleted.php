<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $messageId;
    public $conversationId;
    public $type;

    public function __construct($messageId, $conversationId, $type)
    {
        $this->messageId = $messageId;
        $this->conversationId = $conversationId;
        $this->type = $type;
    }

    public function broadcastOn()
    {
        return new Channel('chat-room.' . $this->conversationId);
    }

    public function broadcastAs()
    {
        return 'message-deleted';
    }

    // 💡 THÊM HÀM NÀY ĐỂ ÉP PAYLOAD CHUẨN ĐÉT KHÔNG LO LỆCH KEY CHỮ HOA CHỮ THƯỜNG
    public function broadcastWith()
    {
        return [
            'message_id'      => (int) $this->messageId,
            'conversation_id' => (int) $this->conversationId,
            'type'            => $this->type,
        ];
    }
}
