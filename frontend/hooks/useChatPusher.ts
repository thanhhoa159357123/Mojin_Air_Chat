"use client";

import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import { useChatStore } from "@/stores/useChatStore";
import { IMessage } from "@/types/message";
import { IConversation } from "@/types/conversation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConversationStore } from "@/stores/useConversationStore";

export const useChatPusher = (selectConversation: IConversation | null) => {
  useEffect(() => {
    if (!selectConversation?.id) return;
    if (
      selectConversation.type === "private" &&
      selectConversation.is_virtual
    ) {
      return;
    }

    const conversationId = selectConversation.id;

    const channelName = `chat-room.${conversationId}`;

    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-message", (data: { message: IMessage }) => {
      console.log(
        "🔥 [useChatPusher] Đã bắt được tin mới tại khung chat chính:",
        data.message,
      );

      useChatStore.setState((state) => {
        // 💡 Dùng callback (state) =>
        const incomingId = Number(data.message.id);
        if (state.messages.some((m) => Number(m.id) === incomingId)) {
          return state; // Không thay đổi gì cả
        }
        return { messages: [...state.messages, data.message] }; // State lấy từ callback là mới nhất
      });
    });

    channel.bind(
      "conversation-read",
      (data: {
        conversation_id: number;
        user_id: number;
        last_read_at: string;
        conversationId?: number;
        userId?: number;
        lastReadAt?: string;
      }) => {
        const conversationId = data.conversation_id ?? data.conversationId;
        const userId = data.user_id ?? data.userId;
        const lastReadAt = data.last_read_at ?? data.lastReadAt;

        if (!conversationId || !userId || !lastReadAt) {
          return;
        }

        useConversationStore.setState((state) => {
          const updateParticipant = (conv: IConversation) => {
            if (!conv.participants) return conv;

            return {
              ...conv,
              participants: conv.participants.map((p) =>
                p.id === userId
                  ? {
                      ...p,
                      pivot: {
                        ...(p.pivot || {}),
                        last_read_at: lastReadAt,
                      },
                    }
                  : p,
              ),
            };
          };

          const updatedSelect =
            state.selectConversation?.id === conversationId
              ? updateParticipant(state.selectConversation)
              : state.selectConversation;

          const updatedConversations = state.conversations.map((conv) =>
            conv.id === conversationId ? updateParticipant(conv) : conv,
          );

          return {
            conversations: updatedConversations,
            selectConversation: updatedSelect,
          };
        });
      },
    );

    // 🚀 CỔNG 2: NHẬN LỆNH XÓA TIN NHẮN TỪ ĐỐI PHƯƠNG
    channel.bind(
      "message-deleted",
      (data: { message_id: number; type: string }) => {
        // 💡 Sửa thành message_id
        console.log(
          "🗑️ [useChatPusher] Đối phương vừa tác động xóa tin nhắn:",
          data.message_id,
        );

        const chatStore = useChatStore.getState();
        const currentMessages = chatStore.messages;

        if (data.type === "unsend") {
          // 💡 Ép kiểu data.message_id về dạng Number để hàm !== hoạt động đúng
          const targetId = Number(data.message_id);

          const updatedMessages = currentMessages.filter(
            (msg) => msg.id !== targetId,
          );
          useChatStore.setState({ messages: updatedMessages });
        }
        // Note: Nếu data.type === 'delete_for_me' tức là đối phương bấm xóa tin của mình gửi (Tin số 3)
        // Thì bên máy mình kệ họ, không thèm filter, màn hình mình vẫn giữ nguyên tin đó!
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channel.bind("user-typing", (data: any) => {
      console.log("✍️ Đang gõ phím:", data);

      // Không tự báo cho chính mình
      if (data.user.id !== useAuthStore.getState().user?.id) {
        useChatStore.setState({ typingUser: data.user.full_name });

        // Sau 3 giây tự tắt chữ "đang gõ..."
        setTimeout(() => {
          useChatStore.setState({ typingUser: null });
        }, 3000);
      }
    });

    // 💡 BẢO BỐI GIẢI NGHIỆP: User chuyển phòng chat phát là dọn dẹp sạch sẽ
    return () => {
      channel.unbind_all();
      // channel.unsubscribe();
    };
  }, [selectConversation?.id]); // Lắng nghe theo sự thay đổi ID của phòng đang chọn
};
