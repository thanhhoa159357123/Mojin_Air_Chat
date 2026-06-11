<?php

namespace App\Events;

use App\Models\Conversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// Thêm cái "implements ShouldBroadcast" để nó bắn ngay lập tức không cần chờ Queue
class GroupCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conversation;
    public $participantIds;

    public function __construct(Conversation $conversation, array $participantIds)
    {
        $this->conversation = $conversation;
        $this->participantIds = $participantIds;
    }

    // 1. Khai báo nơi nhận (Bắn cho ai?)
    public function broadcastOn(): array
    {
        $channels = [];
        foreach ($this->participantIds as $userId) {
            // Đổi PrivateChannel thành Channel
            $channels[] = new Channel('user.' . $userId);
        }
        return $channels;
    }

    // 2. Data gửi đi (Bắn cái gì?)
    public function broadcastWith(): array
    {
        return [
            // Gửi toàn bộ cục data của nhóm mới tạo về cho Client
            'conversation' => $this->conversation->load('participants')->toArray()
        ];
    }

    // THÊM HÀM NÀY VÀO ĐỂ TÊN SỰ KIỆN ĐẸP NHƯ CŨ
    public function broadcastAs(): string
    {
        return 'new-group';
    }
}
