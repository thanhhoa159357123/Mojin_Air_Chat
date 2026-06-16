// stores/useChatStore.ts
import { create } from "zustand";
import { IChatState } from "@/types/message";
import {
  deleteAllMessages,
  deleteMessage,
  editMessage,
  getMessage,
  sendMessage,
} from "@/services/messageService";
import { extractErrorMessage } from "@/lib/errorHandler"; // <-- Rước vị cứu tinh vào đây
import { useConversationStore } from "./useConversationStore";

export const useChatStore = create<IChatState>((set) => ({
  messages: [],
  loading: false,
  loadingMore: false,
  page: 1,
  error: null,
  hasMore: true,

  typingUser: null,

  // 1. Lấy tin nhắn (Cho Khung chat chính)
  // 1. Lấy tin nhắn (Cho Khung chat chính)
  fetchMessages: async (
    friendId: number,
    type: "private" | "group",
    page: number = 1,
    byFriend: boolean = false,
  ) => {
    set({ [page === 1 ? "loading" : "loadingMore"]: true, error: null });
    try {
      const response = await getMessage(friendId, type, page, byFriend);

      const newMessages = response.data || response;
      const hasMore = response.hasMore || false;

      set((state) => {
        // 💡 BẢO BỐI: Lọc sạch những tin nhắn bị lặp lại do lệch trang (Pagination Shift)
        const uniqueNewMessages =
          page === 1
            ? newMessages
            : newMessages.filter(
                // Chỉ lấy những tin nhắn TỪ API mà CHƯA CÓ TRONG state.messages hiện tại
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (newMsg: any) =>
                  !state.messages.some(
                    (existingMsg) =>
                      Number(existingMsg.id) === Number(newMsg.id),
                  ),
              );

        // Nối mảng an toàn tuyệt đối
        const updatedMessages =
          page === 1
            ? uniqueNewMessages
            : [...uniqueNewMessages, ...state.messages];

        return {
          messages: updatedMessages,
          hasMore,
          page,
          loading: false,
          loadingMore: false,
        };
      });
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Lỗi không tải được tin nhắn!",
      );
      set({ error: message, loading: false, loadingMore: false });
      throw new Error(message);
    }
  },

  // 2. Gửi tin nhắn
  sendMessage: async (
    id: number,
    type: "private" | "group",
    content: string,
    parent_id?: number | null,
    msgType: string = "text",
  ) => {
    try {
      const data = await sendMessage(id, type, content, parent_id, msgType);
      const newMessage = data.data || data;

      set((state) => {
        // 💡 BẢO BỐI CHỐNG NHÂN ĐÔI (RACE CONDITION)
        // Nếu thằng Pusher chạy nhanh hơn và nhét tin này vào rồi thì bỏ qua!
        const incomingId = Number(newMessage.id);
        if (state.messages.some((m) => Number(m.id) === incomingId)) {
          return state;
        }

        return {
          messages: [...state.messages, newMessage],
        };
      });

      return newMessage;
    } catch (error: unknown) {
      // --- SỬA Ở ĐÂY: Đồng bộ helper gầm cao máy thoáng ---
      const message = extractErrorMessage(
        error,
        "Gửi tin nhắn thất bại rồi bác ơi!",
      );
      set({ error: message });
      throw new Error(message);
    }
  },

  // 3. Xóa một tin nhắn cụ thể
  deleteMessage: async (conversationId: number, messageId: number) => {
    try {
      // 💡 ĐÃ FIX TRỌNG TÂM Ở ĐÂY: Đảo lại đúng thứ tự API (conversationId trước, messageId sau)
      await deleteMessage(conversationId, messageId);

      set((state) => {
        const updatedMessages = state.messages.filter(
          (msg) => Number(msg.id) !== Number(messageId),
        ); // 💡 Ép kiểu cho chắc

        useConversationStore.setState((convState) => {
          // Lấy tin nhắn cuối cùng mới nhất sau khi đã xóa tin kia đi
          const newLastMessage =
            updatedMessages.length > 0
              ? updatedMessages[updatedMessages.length - 1]
              : null;

          return {
            conversations: convState.conversations.map((conv) =>
              conv.id === conversationId
                ? { ...conv, last_message: newLastMessage }
                : conv,
            ),
          };
        });

        return { messages: updatedMessages };
      });
    } catch (error: unknown) {
      // --- SỬA Ở ĐÂY ---
      const message = extractErrorMessage(error, "Xóa tin nhắn thất bại rồi!");
      set({ error: message });
      throw new Error(message);
    }
  },

  // 4. Xóa tất cả tin nhắn với bạn bè
  deleteAllMessages: async (conversationId: number) => {
    try {
      await deleteAllMessages(conversationId);
      set({ messages: [] });
      useConversationStore.getState().fetchConversations();
    } catch (error: unknown) {
      // --- SỬA Ở ĐÂY ---
      const message = extractErrorMessage(
        error,
        "Xóa sạch cuộc hội thoại thất bại!",
      );
      set({ error: message });
      throw new Error(message);
    }
  },

  // 5. Sửa tin nhắn (NẾU CÓ)
  editMessage: async (
    conversationId: number,
    messageId: number,
    content: string,
  ) => {
    try {
      const response = await editMessage(conversationId, messageId, content);
      const updateMessage = response.data || response;

      set((state) => ({
        messages: state.messages.map((msg) =>
          Number(msg.id) === Number(messageId)
            ? { ...msg, ...updateMessage }
            : msg,
        ),
      }));
    } catch (error: unknown) {
      // --- SỬA Ở ĐÂY ---
      const message = extractErrorMessage(
        error,
        "Chỉnh sửa tin nhắn thất bại!",
      );
      set({ error: message });
      throw new Error(message);
    }
  },
}));
