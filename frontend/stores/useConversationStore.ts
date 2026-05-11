import { getConversation } from "@/services/conversationService";
import { IConversationState } from "@/types/conversation";
import { create } from "zustand";

export const useConversationStore = create<IConversationState>((set) => ({
  conversations: [],
  loading: false,
  error: null,

  fetchConversations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getConversation();
      set({
        conversations: response.data.data || response.data,
        loading: false,
      });
    } catch (error) {
      set({ error: "Lỗi tải danh sách cuộc trò chuyện!", loading: false });
      throw error;
    }
  },
}));
