<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FriendController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\MessageController;

/*
|--------------------------------------------------------------------------
| Public Routes (Không cần Token)
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/auth/refresh', [AuthController::class, 'refresh']);
Route::post('/logout', [AuthController::class, 'logout']);
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

    // Route cập nhật trạng thái On/Off
    Route::post('/user/status', [ConversationController::class, 'updateStatus']);

    Route::put('/user/update', [AuthController::class, 'updateInformation']);
    Route::post('/add-avatar', [AuthController::class, 'addAvatar']);

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

    // --- Chức năng Nhắn tin (Chat) ---
    // Lấy danh sách các cuộc trò chuyện (Hộp thư đến)
    Route::prefix('conversations')->group(function () {
        // Lấy danh sách cuộc hội thoại
        Route::get('/', [ConversationController::class, 'getConversations']);

        // Tạo nhóm trò chuyện mới
        Route::post('/', [ConversationController::class, 'createConversations']);

        Route::post('/{id}/typing', [ConversationController::class, 'typing']);

        Route::post('/{id}/read', [ConversationController::class, 'markConversationRead']);

        // Thêm thành viên vào nhóm trò chuyện
        Route::post('/{id}/add-participants', [ConversationController::class, 'addParticipants']);

        // Lấy danh sách thành viên trong nhóm
        Route::get('/{id}/participants', [ConversationController::class, 'getParticipants']);

        // Kick thành viên khỏi nhóm
        Route::post('/{id}/remove-participants', [ConversationController::class, 'removeParticipants']);
    });


    Route::prefix('messages')->group(function () {
        // Lấy danh sách tin nhắn với 1 người bạn cụ thể (nhập ID của bạn bè)
        Route::get('/{friendId}', [MessageController::class, 'getMessages']);

        // Gửi tin nhắn mới
        Route::post('/', [MessageController::class, 'sendMessage']);

        // Sửa tin nhắn
        Route::put('/{conversationId}/{messageId}', [MessageController::class, 'editMessage']);

        // Thu hồi tin nhắn (cả 2 người đều mất)
        Route::delete('/{conversationId}/{messageId}', [MessageController::class, 'deleteMessage']);

        // Xóa tin nhắn (chỉ ẩn với người xóa, không xóa thật)
        Route::delete('/{conversationId}', [MessageController::class, 'deleteAllMessages']);
    });
});
