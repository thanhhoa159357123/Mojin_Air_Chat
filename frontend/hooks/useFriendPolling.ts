"use client";

import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import { useConversationStore } from "@/stores/useConversationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { IMessage } from "@/types/message";
import { useFriendStore } from "@/stores/useFriendStore";
import { IFriend } from "@/types/friend";
import { toast } from "sonner";

export const useFriendPolling = () => {
  const { fetchConversations, markConversationRead } = useConversationStore();
  const { getFriends, fetchFriendRequests } = useFriendStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user?.id) return;

    // 1. Load danh sách phòng chat cũ từ DB lên trong lần đầu vào trang
    fetchConversations();
    getFriends();
    fetchFriendRequests();

    // 💡 KHÔNG TẠO MỚI PUSHER NỮA, DÙNG pusherClient
    const channelName = `user-sidebar.${user.id}`;
    const channel = pusherClient.subscribe(channelName);

    // 3. Bắt sự kiện tin nhắn mới đổ về đa kênh
    channel.bind("new-message", (data: { message: IMessage }) => {
      const msg = data.message;
      console.log("🛰️ [useFriendPolling] Bắt được tín hiệu:", msg);

      const conversationStore = useConversationStore.getState();
      const currentConversations = conversationStore.conversations;
      const selectConversation = conversationStore.selectConversation;

      // 🔥 PHẦN 1: KIỂM TRA XEM SIDEBAR ĐÃ CÓ PHÒNG CHAT NÀY CHƯA?
      const roomExists = currentConversations.some(
        (c) => c.id === msg.conversation_id,
      );

      const isRealRoom = selectConversation?.id === msg.conversation_id;
      const isFakeRoom =
        selectConversation?.type === "private" &&
        selectConversation.id === msg.user_id;
      const isViewing = isRealRoom || isFakeRoom;

      if (!roomExists) {
        if (isViewing) {
          markConversationRead(msg.conversation_id).catch(() => {});
        }

        // NHẬN TIN NHẮN LẦN ĐẦU TỪ NGƯỜI LẠ: Bắt buộc load lại API để lấy Sidebar mới
        conversationStore.fetchConversations().then(() => {
          // 💡 Nếu mình tình cờ đang bấm xem "phòng ảo" của họ, nâng cấp lên phòng thật
          if (
            selectConversation?.type === "private" &&
            selectConversation.id === msg.user_id
          ) {
            const freshConversations =
              useConversationStore.getState().conversations;
            const realRoom = freshConversations.find(
              (c) => c.id === msg.conversation_id,
            );
            if (realRoom) {
              conversationStore.setSelectConversation(realRoom);
            }
          }
        });
      } else {
        // Sidebar đã có phòng, chỉ cần đẩy tin nhắn cuối lên Top
        const updatedConversations = currentConversations.map((c) => {
          if (c.id === msg.conversation_id) {
            return {
              ...c,
              last_message: msg,
              updated_at: msg.created_at,
              unread_count: isViewing ? 0 : (c.unread_count || 0) + 1,
            };
          }
          return c;
        });
        useConversationStore.setState({ conversations: updatedConversations });

        if (isViewing) {
          markConversationRead(msg.conversation_id).catch(() => {});
        }
      }

      // 🔥 PHẦN 2: CẬP NHẬT GIAO DIỆN KHUNG CHAT (NẾU ĐANG MỞ ĐÚNG NGƯỜI ĐÓ)
      if (selectConversation && isViewing) {
        useChatStore.setState((state) => {
          if (state.messages.some((m) => m.id === msg.id)) {
            return state;
          }

          return {
            messages: [...state.messages, msg],
          };
        });
      }
    });

    channel.bind("friend-request", () => {
      fetchFriendRequests();
    });

    channel.bind(
      "friend-accepted",
      (data: { friend_id: number; friend_data: IFriend }) => {
        console.log("🔔 Có bạn mới (Không gọi API):", data.friend_data);

        const friendStore = useFriendStore.getState();
        const currentFriends = friendStore.friends;

        // Chống trùng lặp (nếu Pusher bị nháy đúp)
        if (!currentFriends.some((f) => f.id === data.friend_data.id)) {
          // Ép data trực tiếp vào Store, Server vẫn thở phào nhẹ nhõm!
          useFriendStore.setState({
            friends: [...currentFriends, data.friend_data],
          });
        }

        toast.success(
          `${data.friend_data.first_name || "Ai đó"} đã chấp nhận lời mời kết bạn!`,
        );
      },
    );

    // 💡 GIẢI NGHIỆP: Tắt kết nối khi đóng ứng dụng
    return () => {
      channel.unbind_all();
      // channel.unsubscribe();
    };
  }, [
    fetchConversations,
    getFriends,
    fetchFriendRequests,
    markConversationRead,
    user?.id,
  ]);
};
