<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserSearchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'first_name' => $this->first_name,
            'last_name'  => $this->last_name,
            'full_name'  => $this->full_name, // Getter gộp tên từ Model
            'username'   => $this->username,
            'avatar'     => $this->avatar,

            // Trả thêm trạng thái mối quan hệ để NextJS biết đường render Nút bấm
            // Ví dụ: 0 = Pending, 1 = Accepted, null = Chưa có gì
            'friendship_status' => $this->pivot_status ?? null,
        ];
    }
}
