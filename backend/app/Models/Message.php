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
        'edit_count',
        'type',
        'deleted_by_ids', // Add thêm cái này
        'is_unsend'       // Add thêm cái này
    ];

    protected $casts = [
        'deleted_by_ids' => 'array', // Laravel sẽ tự JSON encode/decode cho bác
        'is_unsend' => 'boolean'
    ];

    /**
     * 💡 BẢN NÂNG CẤP HOÀN HẢO: Dựa trên Request URL để không bao giờ sợ lệch tầng hàm private
     */
    public function getContentAttribute($value)
    {
        // Kiểm tra xem có phải đang gọi API lấy tin nhắn trong khung chat hay không
        $isChatScene = request()->is('api/messages*');

        if ($isChatScene) {
            // Khung chat cần chuỗi gốc từ DB (Dù là text thường hay chuỗi JSON thô) để Frontend tự parse
            return $value;
        }

        // 🚀 NGỮ CẢNH 2: Gọt chữ preview cho Sidebar / Danh sách bạn bè
        if ($this->type === 'mixed') {
            // Tự parse nội bộ trong hàm để kiểm tra cấu trúc
            $data = is_string($value) ? json_decode($value, true) : $value;

            if (is_array($data)) {
                if (!empty($data['text'])) {
                    return $data['text'];
                }
                if (!empty($data['images']) && count($data['images']) > 0) {
                    return 'Đã gửi một hình ảnh mới';
                }
                if (!empty($data['files']) && count($data['files']) > 0) {
                    return 'Đã gửi một tệp tin mới';
                }
                return '[Tin nhắn hỗn hợp]';
            }
        }

        if ($this->type === 'image') return 'Đã gửi một hình ảnh mới';
        if ($this->type === 'file') return 'Đã gửi một tệp tin mới';

        return $value;
    }

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
