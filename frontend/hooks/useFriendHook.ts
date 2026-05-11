import { useFriendStore } from "@/stores/useFriendStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useFriendHook = () => {
  const {
    getFriends,
    searchFriends,
    addFriend,
    acceptFriendRequest,
    fetchFriendRequests,
    rejectFriendRequest,

    selectedFriend,
    setSelectedFriend,

    friends,
    searchResults,
    friendRequests,
    loading,
    loadingRequests,
    error,
    hasMore,
  } = useFriendStore();

  const [isPopUpAddFriendOpen, setIsPopUpAddFriendOpen] = useState(false);
  const [isPopUpNotiOpen, setIsPopUpNotiOpen] = useState(false);

  useEffect(() => {
    // 1. Gọi lần đầu khi load trang
    getFriends();

    // 2. Thiết lập chạy ngầm mỗi 5 giây để cập nhật tin nhắn cuối cùng (last_message)
    const intervalId = setInterval(() => {
      // Mình gọi thầm lặng thôi, không cần set loading: true làm gì cho cực
      getFriends();
    }, 3000); // 3 giây là đẹp cho sidebar

    return () => clearInterval(intervalId);
  }, []);

  const handleOpenAddFriendPopup = () => {
    setIsPopUpAddFriendOpen(true);
  };

  const handleCloseAddFriendPopup = () => {
    setIsPopUpAddFriendOpen(false);
  };

  const handleOpenNotiPopup = () => {
    setIsPopUpNotiOpen(true);
    fetchFriendRequests(); // Mỗi lần mở popup thông báo thì tự động fetch lại danh sách lời mời kết bạn
  };

  const handleCloseNotiPopup = () => {
    setIsPopUpNotiOpen(false);
  };

  // Hàm này sẽ gửi lời mời kết bạn
  const handleAddFriend = async (friendId: number) => {
    try {
      await addFriend(friendId);
      toast.success("Đã gửi lời mời kết bạn!");
    } catch (error) {
      toast.error("Thêm bạn thất bại. Thử lại nhé!");
      throw error;
    }
  };

  //   Hàm này sẽ chấp nhận lời mời kết bạn
  const handleAcceptFriendRequest = async (friendId: number) => {
    try {
      await acceptFriendRequest(friendId);
      toast.success("Chúc mừng 2 người đã trở thành bạn!");
    } catch (error) {
      toast.error("Chấp nhận bạn bè thất bại. Thử lại nhé!");
      throw error;
    }
  };

  // Hàm này sẽ từ chối lời mời kết bạn
  const handleRejectFriendRequest = async (friendId: number) => {
    try {
      await rejectFriendRequest(friendId);
    } catch (error) {
      toast.error("Từ chối bạn bè thất bại. Thử lại nhé!");
      throw error;
    }
  };

  return {
    handleAddFriend,
    isPopUpAddFriendOpen,
    handleOpenAddFriendPopup,
    handleCloseAddFriendPopup,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,

    isPopUpNotiOpen,
    handleOpenNotiPopup,
    handleCloseNotiPopup,

    selectedFriend,
    setSelectedFriend,

    searchFriends,
    friends,
    searchResults,
    friendRequests, // Xuất thêm cái này ra cho Component xài
    loading,
    loadingRequests, // Xuất thêm cái này để làm hiệu ứng xoay xoay
    error,
    hasMore,
  };
};
