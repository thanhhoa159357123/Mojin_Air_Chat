"use client";

import { useChatStore } from "@/stores/useChatStore";
import { useConversationStore } from "@/stores/useConversationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { IConversation } from "@/types/conversation";
import { toast } from "sonner";
import { getConversationDetails } from "@/lib/conversationUtils";

export const useChatHook = (selectConversation: IConversation | null) => {
  const user = useAuthStore((state) => state.user); // 💡 NẠP VỊ CỨU TINH USER VÀO ĐÂY

  const store = useChatStore();

  const { isGroup, partner, displayName, displayAvatar } =
    getConversationDetails(selectConversation, user?.id);

  // Hàm gửi tin nhắn
  const handleSendMessage = async (
    content: string,
    parent_id?: number | null,
    messageType: string = "text",
  ) => {
    if (!selectConversation) return;

    try {
      const type = isGroup ? "group" : "private";

      // 1. Gọi API Gửi tin nhắn
      const newMessage = await store.sendMessage(
        selectConversation.id, // Nếu là phòng ảo thì đây là ID của user, Laravel tự hiểu
        type,
        content,
        parent_id,
        messageType,
      );

      if (!newMessage) return;

      useConversationStore.setState((state) => {
        const conversationId = newMessage.conversation_id;
        const currentSelect = state.selectConversation;

        const updatedSelect = currentSelect
          ? currentSelect.id === conversationId
            ? {
                ...currentSelect,
                last_message: newMessage,
                updated_at: newMessage.created_at,
                unread_count: 0,
                is_virtual: false,
              }
            : currentSelect.type === "private"
              ? {
                  ...currentSelect,
                  id: conversationId,
                  last_message: newMessage,
                  updated_at: newMessage.created_at,
                  unread_count: 0,
                  is_virtual: false,
                }
              : currentSelect
          : currentSelect;

        const exists = state.conversations.some(
          (conv) => conv.id === conversationId,
        );

        const updatedConversations = state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                last_message: newMessage,
                updated_at: newMessage.created_at,
                unread_count: 0,
              }
            : conv,
        );

        return {
          conversations: exists
            ? updatedConversations
            : updatedSelect
              ? [updatedSelect, ...state.conversations]
              : state.conversations,
          selectConversation: updatedSelect,
        };
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Gửi tin nhắn thất bại.");
      }
    }
  };

  // Hàm xoá một tin nhắn cụ thể
  const handleDeleteMessage = async (messageId: number) => {
    if (!selectConversation) return;

    try {
      await store.deleteMessage(messageId, selectConversation.id);
      toast.success("Đã xóa tin nhắn.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Xóa tin nhắn thất bại.");
      }
    }
  };

  // Hàm xoá toàn bộ tin nhắn
  const handleAllDeleteMessages = async () => {
    if (!selectConversation) return;

    if (!confirm(`Bạn có chắc muốn xóa toàn bộ tin nhắn với ${displayName}?`)) {
      return;
    }

    try {
      await store.deleteAllMessages(selectConversation.id);
      toast.success(`Đã xóa toàn bộ tin nhắn với ${displayName}.`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Xóa tin nhắn thất bại.");
      }
    }
  };

  return {
    ...store,

    isGroup,
    partner,
    displayName,
    displayAvatar,

    handleSendMessage,
    handleDeleteMessage,
    handleAllDeleteMessages,
  };
};
