import { useConversationStore } from "@/stores/useConversationStore";
import { useEffect } from "react";

export const useConversationHook = () => {
  const { conversations, loading, error, fetchConversations } =
    useConversationStore();

  useEffect(() => {
    fetchConversations(); // Truyền user ID để lấy cuộc trò chuyện của người dùng
  }, []);

  return { conversations, loading, error };
};
