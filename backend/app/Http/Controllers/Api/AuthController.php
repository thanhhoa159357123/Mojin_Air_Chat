<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{

    // 💡 Hàm Helper nội bộ: Dùng để gói Cookie cho đỡ phải viết đi viết lại
    private function getRefreshTokenCookie($refreshToken)
    {
        return cookie(
            'mojin_refresh_token', // Tên bánh quy
            $refreshToken,         // Giá trị
            7 * 24 * 60,           // Thời gian sống: 7 ngày (Tính bằng phút)
            '/',                   // Path
            null,                  // Domain
            config('app.env') === 'production', // Secure: true nếu đang chạy HTTPS
            true,                  // HttpOnly: TRUE -> Khoá chết JS Frontend, cấm ăn cắp!
            false,                 // Raw
            'Lax'                  // SameSite
        );
    }

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

        // Tạo user mới
        $user = User::create($validated);

        $accessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['*'], now()->addDays(7))->plainTextToken;


        // Trả về response
        return response()->json([
            'access_token' => $accessToken,
            'token_type' => 'Bearer',
            'message' => 'Đăng ký thành công! Mời bạn vào phòng chat để kết nối với mọi người.',
            'user' => $user,
        ], 201)->withCookie($this->getRefreshTokenCookie($refreshToken));
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

        // 💡 Xoá hết RefreshToken cũ đi cho an toàn (Tránh đẻ quá nhiều rác trong DB)
        $user->tokens()->where('name', 'refresh_token')->delete();

        // 💡 Đẻ sinh đôi Token
        $accessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['*'], now()->addDays(7))->plainTextToken;

        // Trả về response
        return response()->json([
            'access_token' => $accessToken,
            'token_type' => 'Bearer',
            'message' => 'Đăng nhập thành công!',
            'user' => $user,
        ], 200)->withCookie($this->getRefreshTokenCookie($refreshToken));
    }

    // 🚀 HÀM NÀY LÀ TUYỆT CHIÊU CUỐI: SILENT REFRESH (Xoay tua Token)
    public function refresh(Request $request)
    {
        // 1. Móc cái bánh quy ở dưới đáy request lên
        $refreshTokenRaw = $request->cookie('mojin_refresh_token');

        if (!$refreshTokenRaw) {
            return response()->json(['message' => 'Không tìm thấy Refresh Token. Hãy đăng nhập lại.'], 401);
        }

        // 2. Tìm trong CSDL xem token này có thật không, hay là đồ fake
        $tokenInstance = PersonalAccessToken::findToken($refreshTokenRaw);

        // 3. Nếu token fake, hoặc sai tên, hoặc đã hết hạn 7 ngày -> Đá văng!
        if (!$tokenInstance || $tokenInstance->name !== 'refresh_token' || $tokenInstance->expires_at->isPast()) {
            return response()->json(['message' => 'Token đã hết hạn hoặc không hợp lệ.'], 401);
        }

        $user = $tokenInstance->tokenable;

        // 4. XOAY TUA: Huỷ mẹ cái RefreshToken cũ đi (Chống hacker trộm token xài lại)
        $tokenInstance->delete();

        // 5. Cấp lại một cặp vé mới tinh (Tịnh tiến thời gian lên tương lai)
        $newAccessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;
        $newRefreshToken = $user->createToken('refresh_token', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'access_token' => $newAccessToken,
            'user' => $user // Trả kèm user để Frontend cập nhật luôn nếu lỡ bị mất State
        ], 200)->withCookie($this->getRefreshTokenCookie($newRefreshToken));
    }

    public function logout(Request $request)
    {
        // 1. Huỷ Access Token hiện tại (Vé ngắn hạn)
        // Móc thẳng Bearer Token từ Header gửi lên để chém, đéo cần qua $user nữa
        $accessTokenRaw = $request->bearerToken();
        if ($accessTokenRaw) {
            $accessToken = PersonalAccessToken::findToken($accessTokenRaw);
            if ($accessToken) {
                $accessToken->delete();
            }
        }

        // 2. Huỷ cái Refresh Token (Vé dài hạn) trong DB
        $refreshTokenRaw = $request->cookie('mojin_refresh_token');
        if ($refreshTokenRaw) {
            $tokenInstance = PersonalAccessToken::findToken($refreshTokenRaw);
            if ($tokenInstance) {
                $tokenInstance->delete();
            }
        }

        // 3. CHIÊU CUỐI: Ép trình duyệt xóa Cookie bằng cách đẻ ra 1 cái cookie âm thời gian!
        $cookie = cookie(
            'mojin_refresh_token',
            '',   // Value rỗng
            -1,   // 💡 Âm thời gian để chết ngay lập tức
            '/',
            null,
            config('app.env') === 'production',
            true, // HttpOnly
            false,
            'Lax'
        );

        return response()->json(['message' => 'Đăng xuất thành công!'], 200)->withCookie($cookie);
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

    public function addAvatar(Request $request)
    {
        // 1. Lấy thông tin user đang gửi request (đã được middleware xác thực qua Token)
        $user = $request->user();

        // 2. Validate dữ liệu đầu vào (chỉ chấp nhận file ảnh)
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

        // 4. Trả kết quả về cho Front-end (Zustand) để cập nhật lại State
        return response()->json([
            'success' => true,
            'message' => 'Cập nhật avatar lên Cloudinary thành công!',
            'user' => $user // Trả nguyên con User mới cập nhật về để Zustand húp phát ăn ngay
        ], 200);
    }
}
