/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "@/lib/pusher";
import { useAuthStore } from "@/stores/useAuthStore";
import { IFriend } from "@/types/friend";
import { toast } from "sonner";
import { useConversationStore } from "@/stores/useConversationStore";

export const useFriendPusher = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const channelName = `user-friend-actions.${user.id}`;
    const channel = pusherClient.subscribe(channelName);

    // ==========================================
    // 💡 1. LẮNG NGHE CÓ LỜI MỜI KẾT BẠN MỚI
    // ==========================================
    const handleFriendRequest = (data: any) => {
      console.log("🎁 Nhận được sự kiện friend-request real-time:", data);

      queryClient.setQueryData<IFriend[]>(["friendRequests"], (old = []) => {
        if (old.some((r) => Number(r.id) === Number(data.sender_id)))
          return old;

        const mockSender: any = {
          id: data.sender_id,
          full_name: data.sender_name || "Người dùng mới",
          username: "loading...",
          avatar: null,
        };
        return [mockSender, ...old];
      });

      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      toast.info("Bạn có lời mời kết bạn mới!");
    };

    // ==========================================
    // 💡 2. LẤNG NGHE ĐỐI PHƯƠNG ĐÃ ĐỒNG Ý KẾT BẠN
    // ==========================================
    const handleFriendAccepted = (data: {
      friend_id: number;
      friend_data: IFriend;
    }) => {
      const newFriend = data.friend_data;
      queryClient.setQueryData<IFriend[]>(["friends"], (old = []) => {
        if (old.some((f) => f.id === newFriend.id)) return old;
        return [...old, newFriend];
      });

      const currentSelect = useConversationStore.getState().selectConversation;
      const isPrivateChat = currentSelect?.type === "private";
      const isPartner = currentSelect?.participants?.some(
        (p: any) => Number(p.id) === Number(data.friend_id),
      );

      if (isPrivateChat && isPartner) {
        useConversationStore.getState().setSelectConversation({
          ...currentSelect,
          is_read_only: false,
        });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }

      toast.success(
        `${newFriend.first_name || "Ai đó"} đã chấp nhận lời mời kết bạn!`,
      );
    };

    // ==========================================
    // 💡 3. LẤNG NGHE ĐỐI PHƯƠNG HỦY KẾT BẠN (Unfriend)
    // ==========================================
    const handleFriendshipDeleted = (data: { unfriended_by: number }) => {
      console.log(
        "🔒 [Pusher ngầm] Phát hiện đối phương đã hủy kết bạn:",
        data,
      );
      const exFriendId = data.unfriended_by;

      queryClient.setQueryData<IFriend[]>(["friends"], (old = []) =>
        old.filter((f) => Number(f.id) !== Number(exFriendId)),
      );

      queryClient.setQueryData<any[]>(["conversations"], (old = []) =>
        old.map((conv) => {
          const isPrivate = conv.type === "private";
          const hasPartner = conv.participants?.some(
            (p: any) => Number(p.id) === Number(exFriendId),
          );
          if (isPrivate && hasPartner) {
            return { ...conv, is_read_only: true };
          }
          return conv;
        }),
      );

      const currentSelect = useConversationStore.getState().selectConversation;
      const isPrivateChat = currentSelect?.type === "private";
      const hasPartnerInCurrentRoom = currentSelect?.participants?.some(
        (p: any) => Number(p.id) === Number(exFriendId),
      );

      if (isPrivateChat && hasPartnerInCurrentRoom) {
        useConversationStore.getState().setSelectConversation({
          ...currentSelect,
          is_read_only: true,
        });
      }
    };

    // ==========================================
    // 💡 4. LẤNG NGHE ĐỐI PHƯƠNG CHẶN (Block)
    // ==========================================
    const handleFriendshipBlocked = (data: {
      unfriended_by: number;
      action_type: string;
    }) => {
      const blockerId = data.unfriended_by;

      // 1. Ép RAM xóa ngay lập tức danh bạ
      queryClient.setQueryData<IFriend[]>(["friends"], (old = []) =>
        old.filter((f) => Number(f.id) !== Number(blockerId)),
      );

      // 2. Cập nhật nóng Zustand Store khóa khung chat
      const currentSelect = useConversationStore.getState().selectConversation;
      const isPrivateChat = currentSelect?.type === "private";
      const hasBlockerInCurrentRoom = currentSelect?.participants?.some(
        (p: any) => Number(p.id) === Number(blockerId),
      );

      if (isPrivateChat && hasBlockerInCurrentRoom) {
        useConversationStore.getState().setSelectConversation({
          ...currentSelect,
          is_read_only: true,
        });
      }

      // 🚀 ĐÒN QUYẾT ĐỊNH: Bắt ép Sidebar và Khung Chat tải lại dữ liệu mới từ API
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      if (currentSelect?.id) {
        queryClient.invalidateQueries({
          queryKey: ["messages", currentSelect.id],
        });
      }
    };

    // ==========================================
    // 💡 5. LẤNG NGHE ĐỐI PHƯƠNG BỎ CHẶN (Unblock)
    // ==========================================
    const handleFriendshipUnblocked = (data: { unblocked_by: number }) => {
      const unblockedById = data.unblocked_by;

      const currentSelect = useConversationStore.getState().selectConversation;
      const isPrivateChat = currentSelect?.type === "private";
      const hasUnblockerInCurrentRoom = currentSelect?.participants?.some(
        (p: any) => Number(p.id) === Number(unblockedById),
      );

      if (isPrivateChat && hasUnblockerInCurrentRoom) {
        useConversationStore.getState().setSelectConversation({
          ...currentSelect,
          is_read_only: false,
        });
      }

      // 🚀 Làm tươi toàn diện khi được thả xích
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      if (currentSelect?.id) {
        queryClient.invalidateQueries({
          queryKey: ["messages", currentSelect.id],
        });
      }
    };

    //  ========================================================
    //  ĐĂNG KÝ SỰ KIỆN PUSHER
    //  ========================================================
    channel.bind("friend-request", handleFriendRequest);
    channel.bind("friend-accepted", handleFriendAccepted);
    channel.bind("friendship-deleted", handleFriendshipDeleted);
    channel.bind("friendship-blocked", handleFriendshipBlocked);
    channel.bind("friendship-unblocked", handleFriendshipUnblocked);

    //  =========================================================
    //  HỦY ĐĂNG KÝ SỰ KIỆN PUSHER
    //  =========================================================
    return () => {
      console.log("🔌 Rời kênh an toàn:", channelName);
      channel.unbind("friend-request", handleFriendRequest);
      channel.unbind("friend-accepted", handleFriendAccepted);
      channel.unbind("friendship-deleted", handleFriendshipDeleted);
      channel.unbind("friendship-blocked", handleFriendshipBlocked); // 💡 THÊM DÒNG NÀY ĐỂ GIẢI PHÓNG TRÁNH LEAK MEMORY
      channel.unbind("friendship-unblocked", handleFriendshipUnblocked); // 💡 THÊM DÒNG NÀY ĐỂ GIẢI PHÓNG TRÁNH LEAK MEMORY
      pusherClient.unsubscribe(channelName);
    };
  }, [user?.id, queryClient]);
};
