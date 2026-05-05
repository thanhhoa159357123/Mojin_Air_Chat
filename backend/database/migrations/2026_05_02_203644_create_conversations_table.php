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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            // Để phân biệt sau này: 'private' cho 1-1, 'group' cho nhóm
            $table->string('type')->default('private');

            // Tên nhóm và ảnh nhóm ( nullable vì chat 1-1 không dùng đến )
            $table->string('label')->nullable();
            $table->string('avatar')->nullable();

            // Lưu ID tin nhắn cuối cùng để hiện ở danh sách bạn bè cho nhanh (không cần query message)
            $table->foreignId('last_message_id')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
