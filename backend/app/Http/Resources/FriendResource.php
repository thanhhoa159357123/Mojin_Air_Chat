<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class FriendResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'first_name' => $this->first_name,
            'last_name'  => $this->last_name,
            'full_name'  => $this->full_name, // Thuộc tính ảo đã được gộp sẵn trong User Model
            'username'   => $this->username,
            'avatar'     => $this->avatar,
            'status'     => $this->status, // Thuộc tính users.status từ select

            // Xử lý logic cấu trúc last_message ngay tại Resource
            'last_message' => $this->formatLastMessage(),

            // Các trường thông tin khác nếu cần trả về NextJS
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Logic bóc tách và định dạng tin nhắn cuối cùng (Đã nắn dòng mixed)
     */
    protected function formatLastMessage(): ?array
    {
        // Kiểm tra xem subquery có tìm thấy tin nhắn nào không
        if (!$this->last_msg_created_at) {
            return null;
        }

        $createdAt = Carbon::parse($this->last_msg_created_at);
        $content = $this->last_msg_content;

        // 💡 BẪY ĐẬP TAN CHUỖI JSON: Xử lý riêng cho kiểu hỗn hợp mới
        if ($this->last_msg_type === 'mixed') {
            // Giải mã chuỗi JSON thô từ DB thành mảng PHP
            $data = is_string($content) ? json_decode($content, true) : $content;

            if (is_array($data)) {
                if (!empty($data['text'])) {
                    // Nếu gửi kèm chữ -> Hiện chữ làm preview
                    $content = $data['text'];
                } elseif (!empty($data['images']) && count($data['images']) > 0) {
                    // Chỉ gửi mảng ảnh -> Hiện chữ đại diện sạch sẽ
                    $content = 'Đã gửi hình ảnh mới';
                } elseif (!empty($data['files']) && count($data['files']) > 0) {
                    // Chỉ gửi mảng file -> Hiện chữ đại diện sạch sẽ
                    $content = 'Đã gửi tệp tin mới';
                } else {
                    $content = '[Tin nhắn hỗn hợp]';
                }
            }
        }
        // Giữ nguyên logic map loại tin nhắn kiểu cũ cũ của bác
        elseif ($this->last_msg_type === 'image') {
            $content = 'Đã gửi hình ảnh mới';
        } elseif ($this->last_msg_type === 'file') {
            $content = 'Đã gửi tệp tin mới';
        }

        return [
            'content'    => $content, // Trả ra chữ sạch tinh tươm, bái biệt [object Object]
            'user_id'    => $this->last_msg_user_id,
            'time'       => $createdAt->diffForHumans(),
            'created_at' => $createdAt->toIso8601String(),
        ];
    }
}
