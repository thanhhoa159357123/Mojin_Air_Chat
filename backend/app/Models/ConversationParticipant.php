<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConversationParticipant extends Model
{
    // Báo cho Laravel biết chính xác tên bảng, đề phòng nó đoán sai
    protected $table = 'conversation_participants';

    // Cho phép thêm dữ liệu vào các cột này (Cực kỳ quan trọng để sau này dùng hàm create)
    protected $fillable = [
        'conversation_id',
        'user_id',
        'joined_at'
    ];

    // Tắt tự động quản lý timestamps nếu bảng của bác không có created_at/updated_at
    // (Nhưng ở file migration bác có dùng $table->timestamps() nên ta cứ để nguyên, không cần tắt)

    /**
     * Định nghĩa ngược lại: Bản ghi này là của User nào
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Bản ghi này thuộc về Cuộc trò chuyện nào
     */
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }
}
