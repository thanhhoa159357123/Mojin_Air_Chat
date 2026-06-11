<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['type', 'label', 'avatar', 'last_message_id'];

    // Một cuộc hội thoại có nhiều người tham gia
    public function participants()
    {
        return $this->belongsToMany(User::class, 'participants')
            ->withPivot(['last_read_at', 'cleared_at', 'role'])
            ->withTimestamps();
    }

    // Một cuộc hội thoại có nhiều tin nhắn
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    // Liên kết với tin nhắn mới nhất để hiển thị ra danh sách
    public function lastMessage()
    {
        return $this->belongsTo(Message::class, 'last_message_id');
    }
}
