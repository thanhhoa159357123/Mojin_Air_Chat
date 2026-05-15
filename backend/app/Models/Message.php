<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;
    protected $fillable = [
        'conversation_id',
        'user_id',
        'parent_id',
        'content',
        'type',
        'deleted_by_ids', // Add thêm cái này
        'is_unsend'       // Add thêm cái này
    ];

    protected $casts = [
        'deleted_by_ids' => 'array', // Laravel sẽ tự JSON encode/decode cho bác
        'is_unsend' => 'boolean'
    ];

    // Tin nhắn này thuộc về ai gửi
    public function sender()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Tin nhắn này thuộc về cuộc hội thoại nào
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    // Tin nhắn gốc mà tin nhắn hiện tại đang trả lời
    public function parent()
    {
        return $this->belongsTo(Message::class, 'parent_id');
    }

    // Danh sách các tin nhắn đang trả lời tin nhắn này (nếu cần dùng)
    public function replies()
    {
        return $this->hasMany(Message::class, 'parent_id');
    }
}
