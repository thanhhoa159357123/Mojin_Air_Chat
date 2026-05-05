<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FriendController;

/*
|--------------------------------------------------------------------------
| Public Routes (Không cần Token)
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Bắt buộc phải có Bearer Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Lấy thông tin cục user hiện tại
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user/update', [AuthController::class, 'updateInformation']);

    // --- Chức năng kết bạn chiến hữu ---
    Route::prefix('friends')->group(function () {
        // Gửi lời mời kết bạn (Status mặc định là pending)
        Route::post('/add', [FriendController::class, 'addFriend']);

        // Đồng ý kết bạn (Update status = 1 và tạo quan hệ đối xứng)
        Route::post('/accept', [FriendController::class, 'acceptFriend']);

        // Lấy danh sách bạn bè gửi lời mời kết bạn (Pending Requests)
        Route::get('/requests', [FriendController::class, 'getFriendRequests']);

        // Lấy danh sách bạn bè đã được chấp nhận
        Route::get('/', [FriendController::class, 'getFriends']);

        // Từ chối lời mời kết bạn (Xóa quan hệ pending)
        Route::post('/reject', [FriendController::class, 'rejectFriend']);

        // Tìm kiếm người dùng để kết bạn (dựa trên tên hoặc username)
        Route::get('/search', [FriendController::class, 'searchFriends']);
    });
});
