// stores/useChatStore.ts
import { create } from "zustand";
import { IChatState } from "@/types/chat";
import {
  deleteAllMessages,
  deleteMessage,
  getMessage,
  sendMessage,
} from "@/services/messageService";

export const useChatStore = create<IChatState>((set) => ({
  messages: [],
  loading: false,
  error: null,

  // 1. Lấy tin nhắn (Cho Khung chat chính)
  fetchMessages: async (friendId: number, type: "private" | "group") => {
    set({ loading: true, error: null });
    try {
      const data = await getMessage(friendId, type); // Tái sử dụng hàm ở service
      set({
        messages: data.data || data,
        loading: false,
      });
    } catch (error) {
      set({ error: "Lỗi không tải được tin nhắn!", loading: false });
      console.error(error);
    }
  },

  // 2. Gửi tin nhắn
  sendMessage: async (
    id: number,
    type: "private" | "group", // <--- Thêm cái này
    content: string,
    parent_id?: number | null,
    msgType: string = "text",
  ) => {
    try {
      const data = await sendMessage(id, type, content, parent_id, msgType); // Tái sử dụng hàm ở service
      const newMessage = data.data || data;

      // Nhét tin nhắn mới vào mảng cũ
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));

      // Bonus: Ở đây sau này bác có thể gọi lại fetchConversations() để Sidebar tự động update tin nhắn mới nhất lên đầu!
    } catch (error) {
      console.error("Gửi tin nhắn thất bại", error);
      throw error;
    }
  },

  // 3. Xóa một tin nhắn cụ thể (nếu có)
  deleteMessage: async (messageId: number, friendId: number) => {
    try {
      await deleteMessage(messageId, friendId); // Tái sử dụng hàm ở service
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== messageId),
      }));
    } catch (error) {
      console.error("Xóa tin nhắn thất bại", error);
      throw error;
    }
  },

  // 4. Xóa tất cả tin nhắn với bạn bè (nếu có)
  deleteAllMessages: async (friendId: number) => {
    try {
      await deleteAllMessages(friendId); // Tái sử dụng hàm ở service
      set({ messages: [] }); // Xóa sạch tin nhắn trong store
    } catch (error) {
      console.error("Xóa tin nhắn thất bại", error);
      throw error;
    }
  },
}));
