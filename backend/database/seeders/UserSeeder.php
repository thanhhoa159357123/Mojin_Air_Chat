<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tài khoản 1: Chính chủ của ông
        User::create([
            'first_name' => 'Hòa',
            'last_name' => 'Lê Đỗ Thanh',
            'username' => 'Hoa_Cho_Dien',
            'email' => 'thanhhoa159357123@gmail.com',
            'password' => Hash::make('111111'), // Đảm bảo từ 6 ký tự trở lên theo validate

        ]);

        // Tài khoản 2: Thằng bạn thứ nhất để test Chat/Kết bạn
        User::create([
            'first_name' => 'Hiển',
            'last_name' => 'Dương Thế',
            'username' => 'Hien_Ngu',
            'email' => 'thien123@gmail.com',
            'password' => Hash::make('111111'),
        ]);

        // Tài khoản 3: Thằng bạn thứ hai
        User::create([
            'first_name' => 'Thuần',
            'last_name' => 'Bùi Huy',
            'username' => 'Thuan_Bui',
            'email' => 'hthuan123@gmail.com',
            'password' => Hash::make('111111'),
        ]);
    }
}
