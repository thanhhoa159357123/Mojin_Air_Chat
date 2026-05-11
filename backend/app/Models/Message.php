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
}
