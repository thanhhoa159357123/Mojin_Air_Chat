<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FriendRequestResource extends JsonResource
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
            'status'     => $this->pivot->status, // Trả về status từ bảng pivot để FE biết đang ở trạng thái nào (pending, accepted, etc.)
        ];
    }
}
