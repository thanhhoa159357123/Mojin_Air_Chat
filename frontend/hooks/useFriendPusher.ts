"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "@/lib/pusher";
import { useAuthStore } from "@/stores/useAuthStore";
import { IFriend } from "@/types/friend";
import { toast } from "sonner";

export const useFriendPusher = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const channelName = `user-sidebar.${user.id}`;
    const channel = pusherClient.subscribe(channelName);

    // 1. LẮNG NGHE CÓ LỜI MỜI KẾT BẠN MỚI
    channel.bind("friend-request", () => {
      // Ép ổ cache ["friendRequests"] tự động gọi API tải lại danh sách mới
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    });

    // 2. LẮNG NGHE ĐỐI PHƯƠNG ĐÃ ĐỒNG Ý KẾT BẠN
    channel.bind("friend-accepted", (data: { friend_id: number; friend_data: IFriend }) => {
      const newFriend = data.friend_data;

      // Hành động 1: Nhét ngay ông bạn mới này vào ổ cache ["friends"] của mình (0ms)
      queryClient.setQueryData<IFriend[]>(["friends"], (old = []) => {
        if (old.some((f) => f.id === newFriend.id)) return old;
        return [...old, newFriend];
      });

      // 🔥 ĐIỂM CHÍ SÁT DÍNH TỚI CONVERSATION:
      // Vì đồng ý kết bạn xong, Backend thường sẽ tự tạo 1 phòng chat 1-1 dưới DB.
      // Do đó, anh em mình ra lệnh làm tươi (invalidate) ổ cache ["conversations"] 
      // để Sidebar tự động load lại và lòi ra phòng chat với ông bạn mới này ngay lập tức!
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      toast.success(`${newFriend.full_name || "Ai đó"} đã chấp nhận lời mời kết bạn!`);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [user?.id, queryClient]);
};