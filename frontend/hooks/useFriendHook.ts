import { useFriendStore } from "@/stores/useFriendStore";
import { useEffect } from "react";
import { toast } from "sonner";

export const useFriendHook = () => {
  const store = useFriendStore();

  // Hàm này sẽ gửi lời mời kết bạn
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

  //   Hàm này sẽ chấp nhận lời mời kết bạn
  const handleAcceptFriendRequest = async (friendId: number) => {
    try {
      await store.acceptFriendRequest(friendId);
      toast.success("Chúc mừng 2 người đã trở thành bạn!");
    } catch (error) {
      toast.error("Chấp nhận bạn bè thất bại. Thử lại nhé!");
      throw error;
    }
  };

  // Hàm này sẽ từ chối lời mời kết bạn
  const handleRejectFriendRequest = async (friendId: number) => {
    try {
      await store.rejectFriendRequest(friendId);
    } catch (error) {
      toast.error("Từ chối bạn bè thất bại. Thử lại nhé!");
      throw error;
    }
  };

  return {
    ...store,
    handleAddFriend,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
  };
};
