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
        $defaultPassword = Hash::make('111111');

        // Tài khoản 1: Chính chủ của ông
        User::create([
            'first_name' => 'Hòa',
            'last_name' => 'Lê Đỗ Thanh',
            'username' => 'hoa_cho_dien',
            'email' => 'thanhhoa159357123@gmail.com',
            'password' => $defaultPassword,
        ]);

        // Tài khoản 2: Thằng bạn thứ nhất để test Chat/Kết bạn
        User::create([
            'first_name' => 'Hiển',
            'last_name' => 'Dương Thế',
            'username' => 'hien_ngu',
            'email' => 'thien123@gmail.com',
            'password' => $defaultPassword,
        ]);

        // Tài khoản 3: Thằng bạn thứ hai
        User::create([
            'first_name' => 'Thuần',
            'last_name' => 'Bùi Huy',
            'username' => 'thuan_bui',
            'email' => 'hthuan123@gmail.com',
            'password' => $defaultPassword,
        ]);

        // =======================================================
        // ĐỘ SQUAD 7 CAO THỦ PHƯƠNG ĐÔNG (MỚI THÊM THEO YÊU CẦU)
        // =======================================================

        // Tài khoản 4: Trang Bất Phàm
        User::create([
            'first_name' => 'Phàm',
            'last_name' => 'Trang Bất',
            'username' => 'trang_bat_pham',
            'email' => 'bpham123@gmail.com',
            'password' => $defaultPassword,
        ]);

        // Tài khoản 5: Liễu Như Yên
        User::create([
            'first_name' => 'Yên',
            'last_name' => 'Liễu Như',
            'username' => 'lieu_nhu_yen',
            'email' => 'nyen123@gmail.com',
            'password' => $defaultPassword,
        ]);

        // Tài khoản 6: Bạch Ngưng Băng
        User::create([
            'first_name' => 'Băng',
            'last_name' => 'Bạch Ngưng',
            'username' => 'bach_ngung_bang',
            'email' => 'nbang123@gmail.com',
            'password' => $defaultPassword,
        ]);

        // Tài khoản 7: Vương Kiến Quốc
        User::create([
            'first_name' => 'Quốc',
            'last_name' => 'Vương Kiến',
            'username' => 'vuong_kien_quoc',
            'email' => 'kquoc123@gmail.com',
            'password' => $defaultPassword,
        ]);

        // Tài khoản 8: Hạ Vi Vi
        User::create([
            'first_name' => 'Vi',
            'last_name' => 'Hạ Vi',
            'username' => 'ha_vi_vi',
            'email' => 'vvi123@gmail.com',
            'password' => $defaultPassword,
        ]);

        // Tài khoản 9: Kỷ Bá Đạt
        User::create([
            'first_name' => 'Đạt',
            'last_name' => 'Kỷ Bá',
            'username' => 'ky_ba_dat',
            'email' => 'bdat123@gmail.com',
            'password' => $defaultPassword,
        ]);

        // Tài khoản 10: Tôn Hạ Vi
        User::create([
            'first_name' => 'Vi',
            'last_name' => 'Tôn Hạ',
            'username' => 'ton_ha_vi',
            'email' => 'hvi123@gmail.com',
            'password' => $defaultPassword,
        ]);
    }
}
