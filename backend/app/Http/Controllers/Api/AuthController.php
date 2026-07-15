<?php

namespace App\Http\Controllers\Api;

use App\Events\UserStatusChanged;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    // ❌ ĐÃ XÓA HÀM getRefreshTokenCookie() VÌ ĐÉO DÙNG COOKIE NỮA

    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'username' => 'nullable|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create($validated);

        $accessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['*'], now()->addDays(7))->plainTextToken;

        DB::table('users')->where('id', $user->id)->update([
            'status' => 'online',
            'last_active_at' => now()
        ]);

        broadcast(new UserStatusChanged($user->id, 'online', $user->last_active_at));

        return response()->json([
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken, // Trả thẳng qua JSON
            'token_type' => 'Bearer',
            'message' => 'Đăng ký thành công! Mời bạn vào phòng chat để kết nối với mọi người.',
            'user' => User::find($user->id),
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['login'])->orWhere('phone', $validated['login'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Mật khẩu không chính xác.'], 401);
        }

        $user->tokens()->where('name', 'refresh_token')->delete();

        $accessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['*'], now()->addDays(7))->plainTextToken;

        $now = now();
        DB::table('users')->where('id', $user->id)->update([
            'status' => 'online',
            'last_active_at' => $now
        ]);

        try {
            broadcast(new UserStatusChanged($user->id, 'online', $now));
        } catch (\Exception $e) {
            Log::error("Pusher/Reverb bị nghẽn đéo phát được tin status: " . $e->getMessage());
        }

        return response()->json([
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken, // Trả thẳng qua JSON
            'token_type' => 'Bearer',
            'message' => 'Đăng nhập thành công!',
            'user' => User::find($user->id),
        ], 200);
    }

    public function logout(Request $request)
    {
        $accessTokenRaw = $request->bearerToken();
        if ($accessTokenRaw) {
            $accessToken = PersonalAccessToken::findToken($accessTokenRaw);
            if ($accessToken) {
                $user = $accessToken->tokenable;
                if ($user) {
                    $now = now();
                    DB::table('users')->where('id', $user->id)->update([
                        'status' => 'offline',
                        'last_active_at' => $now
                    ]);
                    try {
                        broadcast(new UserStatusChanged($user->id, 'offline', $now));
                    } catch (\Exception $e) {
                        Log::error("Pusher bị gãy lúc logout: " . $e->getMessage());
                    }
                }
                $accessToken->delete();
            }
        }

        // Đọc từ Body JSON gửi lên
        $refreshTokenRaw = $request->input('refresh_token');
        if ($refreshTokenRaw) {
            $tokenInstance = PersonalAccessToken::findToken($refreshTokenRaw);
            if ($tokenInstance) {
                $tokenInstance->delete();
            }
        }

        return response()->json(['message' => 'Đăng xuất thành công!'], 200);
    }

    public function refresh(Request $request)
    {
        // Nhận từ Body JSON gửi lên
        $refreshTokenRaw = $request->input('refresh_token');

        if (!$refreshTokenRaw) {
            return response()->json(['message' => 'Không tìm thấy Refresh Token. Hãy đăng nhập lại.'], 401);
        }

        $tokenInstance = PersonalAccessToken::findToken($refreshTokenRaw);

        if (!$tokenInstance || $tokenInstance->name !== 'refresh_token' || $tokenInstance->expires_at->isPast()) {
            return response()->json(['message' => 'Token đã hết hạn hoặc không hợp lệ.'], 401);
        }

        $user = $tokenInstance->tokenable;
        $tokenInstance->delete();

        $newAccessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;
        $newRefreshToken = $user->createToken('refresh_token', ['*'], now()->addDays(7))->plainTextToken;

        DB::table('users')->where('id', $user->id)->update([
            'status' => 'online',
            'last_active_at' => now()
        ]);

        broadcast(new UserStatusChanged($user->id, 'online', $user->last_active_at));

        return response()->json([
            'access_token' => $newAccessToken,
            'refresh_token' => $newRefreshToken,
            'user' => User::find($user->id)
        ], 200);
    }

    public function updateInformation(Request $request)
    {
        $user = $request->user();
        $validatedData = $request->validate([
            'first_name' => 'sometimes|required|string|max:50',
            'last_name'  => 'sometimes|required|string|max:50',
            'username'   => 'sometimes|nullable|string|max:255|unique:users,username,' . $user->id,
            'email'      => 'sometimes|required|email|unique:users,email,' . $user->id,
            'phone'      => 'sometimes|nullable|string|max:20|unique:users,phone,' . $user->id,
            'bio'        => 'sometimes|nullable|string|max:500',
        ]);

        $user->update($validatedData);

        return response()->json([
            'message' => 'Cập nhật thông tin thành công!',
            'user'    => $user->fresh()
        ]);
    }

    public function addAvatar(Request $request)
    {
        $user = $request->user();
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Đường dẫn ảnh đại diện không hợp lệ!',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->avatar = $request->input('avatar');
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật avatar lên Cloudinary thành công!',
            'user' => $user->fresh()
        ], 200);
    }
}
