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
        // Nếu URL chứa cụm từ api/messages/{id} (Xem chi tiết tin nhắn trong khung chat)
        // Hoặc kiểm tra xem controller action có phải là getMessages hay không
        $isChatScene = request()->is('api/messages*');

        if ($isChatScene) {
            if ($this->type === 'mixed' || $this->type === 'image' || $this->type === 'file') {
                return is_string($value) ? json_decode($value, true) : $value;
            }
            return $value;
        }
        // 🚀 NGỮ CẢNH 2: Tự động gọt tỉa câu chữ preview cho Sidebar / Friendlist ngắn gọn
        // Đề phòng trường hợp dữ liệu truyền vào đã là mảng (do Laravel tự cast) hoặc chuỗi JSON thô
        $data = is_string($value) ? json_decode($value, true) : $value;

        if ($this->type === 'mixed' && is_array($data)) {
            // Nếu có chữ text đi kèm -> Ưu tiên hiện chữ làm preview
            if (!empty($data['text'])) {
                return $data['text'];
            }
            // Nếu chỉ có ảnh -> Hiện thông báo đại diện sạch sẽ
            if (!empty($data['images']) && count($data['images']) > 0) {
                return 'Đã gửi một hình ảnh mới';
            }
            // Nếu chỉ có file -> Hiện thông báo đại diện sạch sẽ
            if (!empty($data['files']) && count($data['files']) > 0) {
                return 'Đã gửi một tệp tin mới';
            }
            return '[Tin nhắn hỗn hợp]';
        }

        // Xử lý fallback preview cho các loại cũ của Sidebar
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
