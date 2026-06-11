"use client";

import { useEffect, useRef } from "react";
import { pusherClient } from "@/lib/pusher";
import { useChatStore } from "@/stores/useChatStore";
import { IMessage } from "@/types/message";
import { IConversation } from "@/types/conversation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConversationStore } from "@/stores/useConversationStore";

export const useChatPusher = (selectConversation: IConversation | null) => {
  
  // 🚀 Ổ 2: KHÓA VAN DEBOUNCE BÁO ĐÃ XEM
  const readTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      useChatStore.setState((state) => {
        const incomingId = Number(data.message.id);
        if (state.messages.some((m) => Number(m.id) === incomingId)) {
          return state; 
        }
        return { messages: [...state.messages, data.message] }; 
      });

      // 💡 BÍ THUẬT DEBOUNCE: Gộp 100 tin nhắn thành 1 lệnh báo đã xem duy nhất!
      if (readTimeoutRef.current) {
        clearTimeout(readTimeoutRef.current);
      }
      // Đợi đúng 1.5 giây sau khi tin nhắn cuối cùng đáp xuống mới rón rén báo "Đã xem"
      readTimeoutRef.current = setTimeout(() => {
        useConversationStore.getState().markConversationRead(conversationId).catch(() => {});
      }, 1500); 
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

        if (!conversationId || !userId || !lastReadAt) return;

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

    channel.bind(
      "message-deleted",
      (data: { message_id: number; type: string; conversation_id: number }) => {
        const chatStore = useChatStore.getState();
        const currentMessages = chatStore.messages;

        if (data.type === "delete_for_all") {
          const targetId = Number(data.message_id);
          const updatedMessages = currentMessages.filter(
            (msg) => msg.id !== targetId,
          );
          useChatStore.setState({ messages: updatedMessages });
        } 
        else if (data.type === "clear_history") {
          useChatStore.setState({ messages: [] });
        }
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channel.bind("user-typing", (data: any) => {
      if (data.user.id !== useAuthStore.getState().user?.id) {
        useChatStore.setState({ typingUser: data.user.full_name });

        setTimeout(() => {
          useChatStore.setState({ typingUser: null });
        }, 3000);
      }
    });

    channel.bind(
      "MessageEdited",
      (data: { message: IMessage }) => {
        useChatStore.setState((state) => {
          const targetId = Number(data.message.id);
          return {
            messages: state.messages.map((msg) =>
              Number(msg.id) === targetId
                ? { ...msg, ...data.message } 
                : msg,
            ),
          };
        });
      },
    );

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
      // Dọn sạch timer đếm ngược nếu user thoát phòng sớm
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectConversation?.id]); 
};