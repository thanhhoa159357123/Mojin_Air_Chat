<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Thêm cái này để dùng Token sau này

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Những thuộc tính có thể điền (Mass assignable)
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'username',
        'email',
        'phone',
        'password',
        'avatar',
        'bio',
        'status',
        'last_active_at',
    ];

    /**
     * Những thuộc tính nên ẩn đi khi xuất API (đảm bảo bảo mật)
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Ép kiểu dữ liệu (Casting)
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_active_at' => 'datetime', // Ép kiểu về datetime để dùng Carbon cho sướng
            'password' => 'hashed',
        ];
    }

    /**
     * Tuyệt chiêu Architect: Tự động gộp Full Name cho Frontend
     * Giúp bác ở FE chỉ cần gọi user.full_name là xong
     */
    protected $appends = ['full_name'];

    public function getFullNameAttribute()
    {
        return "{$this->last_name} {$this->first_name}";
    }

    public function friends()
    {
        return $this->belongsToMany(User::class, 'friends', 'user_id', 'friend_id')
            ->withPivot('status') // Phím thêm cột này để check status bác nhé
            ->withTimestamps();
    }

    public function friendRequests()
    {
        return $this->belongsToMany(User::class, 'friends', 'friend_id', 'user_id')
            ->withPivot('status')
            ->wherePivot('status', 0);
    }

    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'participants')->withTimestamps();
    }
}
