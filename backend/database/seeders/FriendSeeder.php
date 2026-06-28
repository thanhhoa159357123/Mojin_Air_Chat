<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FriendSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mainUserId = 1; // ID chính chủ của bác
        $friendIds = [2, 3, 4, 5, 6, 7, 8, 9, 10]; // Toàn bộ 9 user còn lại
        $now = Carbon::now();

        $friendsData = [];

        foreach ($friendIds as $friendId) {
            // Chiều thuận: User 1 là bạn của Friend
            $friendsData[] = [
                'user_id' => $mainUserId,
                'friend_id' => $friendId,
                'status' => 1, // Trạng thái đã kết bạn theo ảnh image_1a1a66.png
                'created_at' => $now,
                'updated_at' => $now,
            ];

            // Chiều nghịch: Friend cũng là bạn của User 1 (Đồng bộ đối xứng như image_1a1a66.png)
            $friendsData[] = [
                'user_id' => $friendId,
                'friend_id' => $mainUserId,
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Dùng Query Builder insert hàng loạt để tối ưu hóa hiệu năng
        DB::table('friends')->insert($friendsData);
    }
}
