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
        Schema::table('messages', function (Blueprint $table) {
            // Thêm cột edit_count kiểu Integer không âm, mặc định bằng 0, nằm sau cột content
            $table->unsignedInteger('edit_count')->default(0)->after('content');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Khút này để rollback lại cấu trúc bảng nếu cần thiết
            $table->dropColumn('edit_count');
        });
    }
};
