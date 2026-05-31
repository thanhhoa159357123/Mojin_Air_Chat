import { useConversationStore } from "@/stores/useConversationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";
import { toast } from "sonner";

export const useConversationHook = () => {
  const store = useConversationStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user?.id) return;
    store.fetchConversations(); // Truyền user ID để lấy cuộc trò chuyện của người dùng
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleCreateConversation = async (
    label: string,
    participantIds: number[],
  ) => {
    try {
      await store.createConversation(label, participantIds);
      toast.success("Cuộc trò chuyện mới đã được tạo!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Lỗi tạo cuộc trò chuyện mới!");
      }
    }
  };

  const handleAddParticipants = async (
    conversationId: number,
    userIds: number[],
  ) => {
    try {
      await store.addParticipants(conversationId, userIds);
      toast.success("Đã thêm thành viên vào nhóm!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Thêm thành viên thất bại!");
      }
    }
  };

  const handleFetchParticipants = async (conversationId: number) => {
    try {
      await store.fetchParticipants(conversationId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Không thể tải danh sách thành viên!");
      }
    }
  };

  const handleRemoveParticipants = async (
    conversationId: number,
    userIds: number[],
  ) => {
    try {
      await store.removeParticipants(conversationId, userIds);
      toast.success("Đã loại thành viên khỏi nhóm!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Không thể loại thành viên khỏi nhóm!");
      }
    }
  };

  return {
    conversations: store.conversations,
    loading: store.loading,
    error: store.error,
    handleCreateConversation,
    handleAddParticipants,
    handleFetchParticipants,
    handleRemoveParticipants,
    addConversationToState: store.addConversationToState,
  };
};
