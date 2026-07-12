<?php

namespace App\Events;

use App\Models\Conversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupAddParticipants implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conversation;
    public $notifyUserIds; // Toàn bộ thành viên (cũ + mới) để ai cũng nhận được thông báo Pusher
    public $newMemberIds;  // Danh sách riêng những anh em mới được add vào để FE dễ phân luồng
    public $systemMessage;

    /**
     * Create a new event instance.
     */
    public function __construct(Conversation $conversation, array $notifyUserIds, array $newMemberIds = [], $systemMessage = null)
    {
        // Load sẵn danh sách participants mới nhất để Front-End khỏi phải gọi API fetch lại
        $this->conversation = $conversation->load('participants');
        $this->notifyUserIds = $notifyUserIds;
        $this->newMemberIds = $newMemberIds;
        $this->systemMessage = $systemMessage;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = [];

        // Bắn tín hiệu vào kênh Private của từng khứa để bảo mật tuyệt đối
        foreach ($this->notifyUserIds as $userId) {
            $channels[] = new Channel('user.' . $userId);
        }

        return $channels;
    }

    /**
     * Tên sự kiện để Front-End NextJS vểnh tai lên nghe
     */
    public function broadcastAs(): string
    {
        return 'group.add_participants';
    }
}
