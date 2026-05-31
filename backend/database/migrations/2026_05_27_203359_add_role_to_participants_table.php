<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('participants', function (Blueprint $table) {
            // Thêm cột role, mặc định là 'member'
            $table->string('role')->default('member')->after('user_id');
        });
    }

    public function down()
    {
        Schema::table('participants', function (Blueprint $table) {
            // Nếu cần rollback thì xóa cột này
            $table->dropColumn('role');
        });
    }
};
