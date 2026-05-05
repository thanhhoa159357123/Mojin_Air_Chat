<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('friends', function (Blueprint $table) {
            $table->id();

            // Người gửi lời mời
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Người được mời
            $table->foreignId('friend_id')->constrained('users')->onDelete('cascade');

            // Trạng thái: 0: Pending, 1: Accepted, 2: Blocked
            $table->tinyInteger('status')->default(0)->index();

            $table->timestamps();

            // Index tổ hợp để load danh sách bạn bè cực nhanh
            $table->unique(['user_id', 'friend_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('friends');
    }
};
