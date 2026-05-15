import { useConversationStore } from "@/stores/useConversationStore";
import { useEffect } from "react";
import { toast } from "sonner";

export const useConversationHook = () => {
  const {
    conversations,
    loading,
    error,
    fetchConversations,
    createConversation,
  } = useConversationStore();

  useEffect(() => {
    fetchConversations(); // Truyền user ID để lấy cuộc trò chuyện của người dùng
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateConversation = async (
    label: string,
    participantIds: number[],
  ) => {
    try {
      await createConversation(label, participantIds);
      toast.success("Cuộc trò chuyện mới đã được tạo!");
    } catch (error) {
      toast.error("Lỗi tạo cuộc trò chuyện mới! Vui lòng thử lại.");
    }
  };

  return { conversations, loading, error, handleCreateConversation };
};
