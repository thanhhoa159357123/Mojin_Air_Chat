<?php

namespace App\Http\Controllers\Api;

use App\Events\FriendBlocked;
use App\Events\FriendRequestAccepted;
use App\Events\FriendRequestSent;
use App\Events\FriendshipDeleted;
use App\Events\FriendUnblocked;
use App\Http\Controllers\Controller;
use App\Http\Resources\FriendRequestResource;
use App\Http\Resources\FriendResource;
use App\Http\Resources\UserSearchResource;
use App\Models\User;
use App\Models\Friend;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FriendController extends Controller
{
    const STATUS_PENDING = 0;
    const STATUS_ACCEPTED = 1;
    const STATUS_BLOCKED = 2;

    public function getFriends(Request $request)
    {
        $friends = $request->user()->friends()
            ->wherePivot('status', self::STATUS_ACCEPTED)
            ->select(['users.id', 'first_name', 'last_name', 'username', 'avatar', 'users.status'])
            ->get();
        return FriendResource::collection($friends);
    }

    /**
     * Thêm bạn mới (Gửi lời mời kết bạn)
     */
    public function addFriend(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'friend_id' => 'required|exists:users,id'
        ]);

        $friendId = $request->friend_id;

        if ($user->id == $friendId) {
            return response()->json(['message' => 'Bạn không thể kết bạn với chính mình.'], 400);
        }

        // Kiểm tra nếu đã có mối quan hệ (dù là bạn bè hay lời mời) thì báo lỗi
        $friendship = DB::table('friends')
            ->where(function ($q) use ($user, $friendId) {
                $q->where('user_id', $user->id)
                    ->where('friend_id', $friendId);
            })->orWhere(function ($q) use ($user, $friendId) {
                $q->where('user_id', $friendId)
                    ->where('friend_id', $user->id);
            })->first();


        if ($friendship) {
            // Trường hợp 1: Đã là bạn bè thật sự rồi
            if ($friendship->status == self::STATUS_ACCEPTED) {
                return response()->json(['message' => 'Hai bạn đã là bạn bè của nhau rồi.'], 400);
            }

            // Trường hợp 2: Đang trong trạng thái chờ (Pending)
            if ($friendship->status == self::STATUS_PENDING) {
                if ($friendship->user_id == $user->id) {
                    return response()->json(['message' => 'Bạn đã gửi lời mời trước đó, vui lòng chờ phản hồi.'], 400);
                } else {
                    return response()->json(['message' => 'Người này đã gửi lời mời cho bạn rồi, vui lòng kiểm tra hộp thư chờ.'], 400);
                }
            }

            // Trường hợp 3: Blocked
            if ($friendship->status == self::STATUS_BLOCKED) {
                return response()->json(['message' => 'Không thể gửi lời mời kết bạn.'], 400);
            }
        }

        $user->friends()->syncWithoutDetaching([$friendId]);

        broadcast(new FriendRequestSent($user, $friendId));

        return response()->json([
            'status' => 'success',
            'message' => 'Kết bạn thành công! Hãy bắt đầu cuộc trò chuyện ngay bây giờ.',
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

        return FriendRequestResource::collection($requests);
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
            ->where('status', '!=', self::STATUS_ACCEPTED)
            ->update(['status' => self::STATUS_ACCEPTED]);

        // 2. Chốt chặn an toàn: Báo lỗi nếu không có lời mời hoặc đã accept rồi
        if (!$updated) {
            return response()->json([
                'message' => 'Lời mời không tồn tại hoặc bạn đã chấp nhận lời mời này!'
            ], 404);
        }

        $user->friends()->syncWithoutDetaching([
            $friendId => ['status' => self::STATUS_ACCEPTED]
        ]);

        // 💡 ĐÓNG GÓI DATA CHUẨN ĐỂ BẮN QUA PUSHER
        // Định dạng giống hệt với output của getFriends()
        $accepterData = [
            'id'                  => $user->id,
            'first_name'          => $user->first_name,
            'last_name'           => $user->last_name,
            'username'            => $user->username,
            'avatar'              => $user->avatar,
            'status'              => self::STATUS_ACCEPTED,
            'last_msg_content'    => null,
            'last_msg_type'       => null,
            'last_msg_user_id'    => null,
            'last_msg_created_at' => null,
        ];

        // 🚀 Bắn qua Pusher với 3 tham số
        broadcast(new FriendRequestAccepted($user->id, $friendId, $accepterData));

        return response()->json([
            'status' => 'success',
            'message' => 'Bạn đã chấp nhận lời mời kết bạn! Giờ hai người đã là bằng hữu.',
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

        $deleted = DB::table('friends')
            ->where('user_id', $friendId)
            ->where('friend_id', $user->id)
            ->where('status', self::STATUS_PENDING)
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Lời mời này không còn tồn tại hoặc đã được xử lý rồi.'], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Xin lỗi tôi không quen biết bạn!',
            'data' => ['friend_id' => $friendId]
        ]);
    }

    public function searchFriends(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1'
        ]);

        $user = $request->user();
        $searchTerm = $request->input('query');

        $results = User::query()
            // 1. Chỉ lấy những trường cần thiết của bảng users ngay từ đầu
            ->select(['id', 'first_name', 'last_name', 'username', 'avatar'])

            // 2. Loại chính mình ra khỏi danh sách người lạ
            ->where('id', '!=', $user->id)

            // 3. Tìm kiếm theo tên hoặc username
            ->where(function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', "%{$searchTerm}%")
                    ->orWhere('last_name', 'like', "%{$searchTerm}%");
            })

            ->whereNotExists(function ($query) use ($user) {
                $query->select(DB::raw(1))
                    ->from('friends')
                    ->where('status', self::STATUS_BLOCKED)
                    ->where(function ($q) use ($user) {
                        $q->where(function ($sub) use ($user) {
                            $sub->where('user_id', $user->id)->whereColumn('friend_id', 'users.id');
                        })->orWhere(function ($sub) use ($user) {
                            $sub->where('friend_id', $user->id)->whereColumn('user_id', 'users.id');
                        });
                    });
            })

            // 4. Sửa lại Subquery chuẩn: Bọc group logic orWhere lại cho chuẩn SQL
            ->addSelect([
                'pivot_status' => DB::table('friends')
                    ->select('status')
                    ->where(function ($q) use ($user) {
                        // Phải bọc đống logic 2 chiều này vào trong 1 cái group functions
                        $q->where(function ($sub) use ($user) {
                            $sub->where('user_id', $user->id)
                                ->whereColumn('friend_id', 'users.id');
                        })->orWhere(function ($sub) use ($user) {
                            $sub->where('friend_id', $user->id)
                                ->whereColumn('user_id', 'users.id');
                        });
                    })
                    ->limit(1)
            ])
            ->simplePaginate(15);

        return response()->json([
            'status'  => 'success',
            'data'    => UserSearchResource::collection($results->items()),
            'hasMore' => $results->hasMorePages(),
        ]);
    }

    // Thêm tính năng xóa bạn bè
    public function unFriend(int $friendId): JsonResponse
    {
        $userId = Auth::id();

        // Tiến hành xóa liên kết 2 chiều
        DB::table('friends')->where(function ($query) use ($userId, $friendId) {
            $query->where(function ($q) use ($userId, $friendId) {
                $q->where('user_id', $userId)->where('friend_id', $friendId);
            })->orWhere(function ($q) use ($userId, $friendId) {
                $q->where('user_id', $friendId)->where('friend_id', $userId);
            });
        })->delete();

        // 💡 BỎ CÁI IF CHECK REPSONSE 404 ĐI BÁC. 
        // Cứ xóa xong (hoặc bảng đã sạch sẵn) là coi như thành công, bắn event real-time luôn!
        event(new FriendshipDeleted($userId, $friendId));

        return response()->json([
            'success' => true,
            'message' => 'Đã hủy kết bạn thành công.'
        ]);
    }

    // Thêm tính năng block người dùng
    public function blockFriend(int $friendId): JsonResponse
    {
        $userId = Auth::id();

        if ($userId == $friendId) {
            return response()->json(['message' => 'Bạn không thể chặn chính mình.'], 400);
        }

        DB::table('friends')->where(function ($query) use ($userId, $friendId) {
            $query->where(function ($q) use ($userId, $friendId) {
                $q->where('user_id', $userId)->where('friend_id', $friendId);
            })->orWhere(function ($q) use ($userId, $friendId) {
                $q->where('user_id', $friendId)->where('friend_id', $userId);
            });
        })->delete();

        // Cập nhật trạng thái block trong bảng friends
        DB::table('friends')->insert([
            'user_id' => $userId,
            'friend_id' => $friendId,
            'status' => self::STATUS_BLOCKED,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        broadcast(new FriendBlocked($userId, $friendId));

        return response()->json([
            'success' => true,
            'message' => 'Người dùng đã bị chặn thành công.'
        ]);
    }

    // Hủy block người dùng
    public function unBlockFriend(int $friendId): JsonResponse
    {
        $userId = Auth::id();

        $deleted = DB::table('friends')
            ->where('user_id', $userId)
            ->where('friend_id', $friendId)
            ->where('status', self::STATUS_BLOCKED)
            ->delete();

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không chặn người dùng này hoặc bản ghi không tồn tại.'
            ], 404);
        }

        broadcast(new FriendUnblocked($userId, $friendId));

        return response()->json([
            'success' => true,
            'message' => 'Người dùng đã được bỏ chặn thành công.'
        ]);
    }

    // Lấy danh sách người dùng bị chặn
    public function getBlockedFriends(): JsonResponse
    {
        $userId = Auth::id();

        // 💡 CHỈ LẤY những người nằm ở cột `friend_id` mà do chính `$userId` chặn
        $blockedUsers = DB::table('friends')
            ->join('users', 'friends.friend_id', '=', 'users.id') // Join trực tiếp, loại bỏ hoàn toàn orOn lỗi
            ->where('friends.user_id', $userId)
            ->where('friends.status', self::STATUS_BLOCKED)
            ->select('users.id', 'users.first_name', 'users.last_name', 'users.username', 'users.avatar')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $blockedUsers
        ]);
    }

    // Lấy chi tiết người dùng
    public function getUserDetail(int $friendId): JsonResponse
    {
        $userId = Auth::id();

        $friendship = DB::table('friends')
            ->where(function ($query) use ($userId, $friendId) {
                $query->where(function ($q) use ($userId, $friendId) {
                    $q->where('user_id', $userId)->where('friend_id', $friendId);
                })->orWhere(function ($q) use ($userId, $friendId) {
                    $q->where('user_id', $friendId)->where('friend_id', $userId);
                });
            })
            ->first();

        if (!$friendship) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại hoặc không phải bạn bè.'
            ], 404);
        }

        $user = User::find($friendId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }
}
