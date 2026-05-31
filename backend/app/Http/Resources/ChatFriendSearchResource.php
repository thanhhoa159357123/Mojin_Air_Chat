<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatFriendSearchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'first_name' => $this->first_name,
            'last_name'  => $this->last_name,
            'full_name'  => $this->full_name,
            'username'   => $this->username,
            'avatar'     => $this->avatar,
            // Ở đây sạch sẽ hoàn toàn, không có last_message, cũng không lo logic thừa!
        ];
    }
}
