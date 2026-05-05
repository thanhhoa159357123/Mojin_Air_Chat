<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FriendController extends Controller
{

    public function getFriends(Request $request)
    {
        $user = $request->user();

        // Lấy danh sách bạn bè đã được chấp nhận (status = 1)
        $friends = $user->friends()
            ->wherePivot('status', 1)
            ->select(['users.id', 'first_name', 'last_name', 'username', 'avatar', 'users.status'])
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $friends
        ]);
    }

    /**
     * Thêm bạn mới (Gửi lời mời kết bạn)
     */
    public function addFriend(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id'
        ]);

        $user = $request->user();
        $friendId = $request->friend_id;

        if ($user->id == $friendId) {
            return response()->json(['message' => 'Bạn không thể kết bạn với chính mình.'], 400);
        }

        $user->friends()->syncWithoutDetaching([$friendId]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kết bạn thành công! Đợi nó lên sóng là chat phê luôn.',
            'data' => [
                'friend_id' => $friendId
            ]
        ]);
    }

    /**
     * Lấy danh sách lời mời kết bạn đang chờ (Pending Requests)
     */
    public function getFriendRequests(Request $request)
    {
        $user = $request->user();

        // Sử dụng quan hệ friendRequests đã được định nghĩa trong Model (status = 0)
        $requests = $user->friendRequests()
            ->select(['users.id', 'first_name', 'last_name', 'username', 'avatar'])
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $requests
        ]);
    }

    public function acceptFriend(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id'
        ]);

        $user = $request->user();
        $friendId = $request->friend_id;

        if ($user->id == $friendId) {
            return response()->json(['message' => 'Bạn không thể chấp nhận kết bạn với chính mình.'], 400);
        }

        // 1. Phập thẳng vào DB, nhưng nhớ lưu lại kết quả update
        // Thêm điều kiện status != 1 để chặn mấy khứa spam click accept nhiều lần
        $updated = DB::table('friends')
            ->where('user_id', $friendId)
            ->where('friend_id', $user->id)
            ->where('status', '!=', 1)
            ->update(['status' => 1]);

        // 2. Chốt chặn an toàn: Báo lỗi nếu không có lời mời hoặc đã accept rồi
        if (!$updated) {
            return response()->json([
                'message' => 'Kèo này toang! Lời mời không tồn tại hoặc bác đã accept khứa này rồi.'
            ], 404);
        }

        // 3. Tuyệt chiêu Architect (Đối xứng):
        // Phải add ngược lại thằng kia vào danh sách của mình, set luôn status = 1.
        // Như vậy lúc bác query danh sách bạn bè nó mới ra đủ cả 2 chiều, FE nó mới sướng.
        $user->friends()->syncWithoutDetaching([
            $friendId => ['status' => 1]
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Bạn đã chấp nhận lời mời kết bạn! Giờ thì vào chat thôi.',
            'data' => [
                'friend_id' => $friendId
            ]
        ]);
    }

    public function rejectFriend(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id'
        ]);

        $user = $request->user();
        $friendId = $request->friend_id;

        if ($user->id == $friendId) {
            return response()->json(['message' => 'Bạn không thể từ chối kết bạn với chính mình.'], 400);
        }

        // Xóa mối quan hệ bạn bè (dù là lời mời hay đã chấp nhận)
        $deleted = DB::table('friends')
            ->where('user_id', $friendId)
            ->where('friend_id', $user->id)
            ->where('status', 0) // Chỉ xóa nếu có lời mời hoặc đã là bạn bè
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Lời mời này không còn tồn tại hoặc đã được xử lý rồi.'], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Đã từ chối lời mời. Huynh đệ tương tàn!',
            'data' => ['friend_id' => $friendId]
        ]);
    }

    public function searchFriends(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1'
        ]);

        $user = $request->user();
        $searchTerm = $request->query('query');

        // Đổi ->get() thành ->simplePaginate()
        $results = User::query()
            ->where(function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', "%{$searchTerm}%")
                    ->orWhere('last_name', 'like', "%{$searchTerm}%")
                    ->orWhere('username', 'like', "%{$searchTerm}%");
            })
            ->where('id', '!=', $user->id)
            ->select(['id', 'first_name', 'last_name', 'username', 'avatar'])
            ->simplePaginate(15); // Lấy 15 người một trang cho nó vừa mâm

        return response()->json([
            'status' => 'success',
            'data' => $results->items(), // Giờ thì hàm items() chạy vi vu
            'hasMore' => $results->hasMorePages(), // FE cũng check được còn data để load không
        ]);
    }
}
