<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Validate dữ liệu đầu vào
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'username' => 'nullable|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6|confirmed',
        ]);

        Log::info("Dữ liệu đăng ký đã được xác thực: ", $validated);

        // Tạo user mới
        $user = User::create($validated);

        Log::info("User mới đã được tạo: ", ['user_id' => $user->id, 'email' => $user->email]);

        $token = $user->createToken('auth_token')->plainTextToken;

        Log::info("Token đã được tạo cho user: ", ['user_id' => $user->id, 'token' => $token]);

        // Trả về response
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'message' => 'Đăng ký thành công! Mời bạn vào phòng chat để kết nối với mọi người.',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        // Validate dữ liệu đầu vào
        $validated = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        // Tìm user theo email
        $user = User::where('email', $validated['login'])->orWhere('phone', $validated['login'])->first();

        // Kiểm tra mật khẩu
        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Mật khẩu không chính xác.'], 401);
        }

        // Tạo token mới cho user
        $token = $user->createToken('auth_token')->plainTextToken;

        // Trả về response
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'message' => 'Đăng nhập thành công!',
            'user' => $user,
        ], 200);
    }

    public function logout(Request $request)
    {
        // Xóa token hiện tại của user
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Đăng xuất thành công! Hẹn gặp lại bạn trong phòng chat!'], 200);
    }

    public function updateInformation(Request $request)
    {
        // 1. Lấy thông tin user đang gửi request (đã được middleware xác thực qua Token)
        $user = $request->user();

        // 2. Ép kiểu và kiểm duyệt dữ liệu (Tránh user gửi data rác hoặc cố tình hack field 'role')
        $validatedData = $request->validate([
            'first_name' => 'sometimes|required|string|max:50',
            'last_name'  => 'sometimes|required|string|max:50',
            'username'   => 'sometimes|nullable|string|max:255|unique:users,username,' . $user->id, // Unique nhưng cho phép giữ username cũ
            'email'      => 'sometimes|required|email|unique:users,email,' . $user->id, // Unique nhưng cho phép giữ email cũ
            'phone'      => 'sometimes|nullable|string|max:20|unique:users,phone,' . $user->id, // Unique nhưng cho phép giữ phone cũ
            'avatar'     => 'sometimes|nullable|string|max:255',
            'bio'        => 'sometimes|nullable|string|max:500',
        ]);

        // 3. Cập nhật vào DB
        $user->update($validatedData);

        // 4. Trả về cục user mới tinh để Front-end (Zustand) nạp lại vào State
        return response()->json([
            'message' => 'Cập nhật thông tin thành công!',
            'user'    => $user
        ]);
    }
    // Đã gửi bức ảnh mới
}
