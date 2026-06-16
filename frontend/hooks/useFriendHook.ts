"use client";

import { extractErrorMessage } from "@/lib/errorHandler";
import { useFriendStore } from "@/stores/useFriendStore";
import { IFriend } from "@/types/friend";
import { toast } from "sonner";

export const useFriendHook = () => {
  const store = useFriendStore();

  const handleAddFriend = async (friendId: number) => {
    try {
      await store.addFriend(friendId);
      toast.success("Đã gửi lời mời kết bạn!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Thêm bạn thất bại. Thử lại nhé!");
      throw error;
    }
  };

  // 🚀 OPTIMISTIC UI: CHẤP NHẬN KẾT BẠN TRONG 0ms
  const handleAcceptFriendRequest = async (friendId: number) => {
    // 1. BACKUP DATA CŨ LẠI ĐỂ PHÒNG HỜ GỌI API LỖI THÌ ROLLBACK
    const currentRequests = store.friendRequests;
    const currentFriends = store.friends;

    // 2. TÌM THẰNG BẠN ĐANG NẰM TRONG DANH SÁCH CHỜ
    const targetRequest = currentRequests.find((req) => req.id === friendId);

    if (targetRequest) {
      const optimisticFriend: IFriend = {
        ...targetRequest,
        full_name: `${targetRequest.first_name} ${targetRequest.last_name}`,
        friendship_status: 1, // Đã thành bạn bè
        status: "offline", // Tạm thời để offline chờ server sync
        last_message: null, // Vừa kết bạn làm gì đã có tin nhắn
      };

      useFriendStore.setState({
        friendRequests: currentRequests.filter((req) => req.id !== friendId),
        friends: [...currentFriends, optimisticFriend],
      });
    }

    try {
      // 4. ÂM THẦM GỌI API Ở DƯỚI GẦM GIƯỜNG
      await store.acceptFriendRequest(friendId);
      // Gọi ngầm lấy danh sách chuẩn xịn từ Server về đè lại một lần nữa cho chắc cốp
      store.getFriends().catch(() => {});
      toast.success("Chúc mừng 2 người đã trở thành bạn!");
    } catch (error) {
      // 5. LỖI MẠNG? ROLLBACK LẠI NHƯ CHƯA HỀ CÓ CUỘC CHIA LY!
      useFriendStore.setState({
        friendRequests: currentRequests,
        friends: currentFriends,
      });
      toast.error("Chấp nhận bạn bè thất bại. Thử lại nhé!");
      throw error;
    }
  };

  // 🚀 OPTIMISTIC UI: TỪ CHỐI KẾT BẠN TRONG 0ms
  const handleRejectFriendRequest = async (friendId: number) => {
    const currentRequests = store.friendRequests;

    // Ẩn ngay lập tức khỏi màn hình (0ms)
    useFriendStore.setState({
      friendRequests: currentRequests.filter((req) => req.id !== friendId),
    });

    try {
      await store.rejectFriendRequest(friendId);
    } catch (error) {
      // Lỗi thì ói nó ra lại màn hình
      useFriendStore.setState({ friendRequests: currentRequests });
      toast.error("Từ chối bạn bè thất bại. Thử lại nhé!");
      throw error;
    }
  };

  const handleAddAvatar = async (avtUrl: string) => {
    try {
      const data = await store.addAvatar(avtUrl);
      return data;
    } catch (error) {
      const message = extractErrorMessage(error, "Lỗi cập nhật avatar rồi!");
      toast.error(message);
    }
  };

  return {
    ...store,
    handleAddFriend,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleAddAvatar,
  };
};
