// stores/useChatStore.ts
import { create } from "zustand";
import { IChatState } from "@/types/message";
import {
  deleteAllMessages,
  deleteMessage,
  getMessage,
  sendMessage,
} from "@/services/messageService";
import { extractErrorMessage } from "@/lib/errorHandler"; // <-- Rước vị cứu tinh vào đây

export const useChatStore = create<IChatState>((set) => ({
  messages: [],
  loading: false,
  loadingMore: false,
  page: 1,
  error: null,
  hasMore: true,

  typingUser: null,

  // 1. Lấy tin nhắn (Cho Khung chat chính)
  fetchMessages: async (
    friendId: number,
    type: "private" | "group",
    page: number = 1,
    byFriend: boolean = false,
  ) => {
    // Nếu là trang 1 thì xoay loading to, nếu > 1 thì xoay loading nhỏ ở top
    set({ [page === 1 ? "loading" : "loadingMore"]: true, error: null });
    try {
      // 💡 Bác nhớ update file messageService.ts thêm tham số page vào axios nhé:
      // axiosClient.get(`/messages/${id}?type=${type}&page=${page}`)
      const response = await getMessage(friendId, type, page, byFriend);

      const newMessages = response.data || response;
      const hasMore = response.hasMore || false;

      set((state) => {
        // 💡 TRỌNG TÂM: Nếu là load thêm (page > 1), nhét tin nhắn cũ LÊN ĐẦU mảng
        const updatedMessages =
          page === 1 ? newMessages : [...newMessages, ...state.messages];

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
  deleteMessage: async (messageId: number, friendId: number) => {
    try {
      await deleteMessage(messageId, friendId);
      set((state) => ({
        messages: state.messages.filter(
          (msg) => Number(msg.id) !== Number(messageId),
        ), // 💡 Ép kiểu cho chắc
      }));
    } catch (error: unknown) {
      // --- SỬA Ở ĐÂY ---
      const message = extractErrorMessage(error, "Xóa tin nhắn thất bại rồi!");
      set({ error: message });
      throw new Error(message);
    }
  },

  // 4. Xóa tất cả tin nhắn với bạn bè
  deleteAllMessages: async (friendId: number) => {
    try {
      await deleteAllMessages(friendId);
      set({ messages: [] });
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
}));
