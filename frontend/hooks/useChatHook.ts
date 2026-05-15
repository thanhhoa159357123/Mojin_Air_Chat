import { useChatStore } from "@/stores/useChatStore";
import { IFriend } from "@/types/friend";
import { toast } from "sonner";

export const useChatHook = (selectedFriend: IFriend | null) => {
  const {
    messages,
    loading,
    error,
    sendMessage,
    deleteMessage,
    deleteAllMessages,
  } = useChatStore();

  const handleSendMessage = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedFriend: any, // Lúc này có thể là IFriend hoặc IConversation
    content: string,
    parent_id?: number | null,
    messageType: string = "text",
  ) => {
    try {
      // selectedFriend.type ở đây sẽ là 'private' hoặc 'group', mặc định 'private' nếu là IFriend
      const type = selectedFriend.type || "private";
      await sendMessage(
        selectedFriend.id,
        type,
        content,
        parent_id,
        messageType, // 'text', 'image', 'file'... vẫn giữ nguyên đây bác!
      );
    } catch (err) {
      toast.error("Gửi tin nhắn thất bại.");
    }
  };

  // Hàm xoá một tin nhắn cụ thể
  const handleDeleteMessage = async (messageId: number) => {
    if (!selectedFriend) return;

    try {
      await deleteMessage(messageId, selectedFriend.id);
      toast.success("Đã xóa tin nhắn.");
    } catch (err) {
      toast.error("Xóa tin nhắn thất bại.");
    }
  };

  // Hàm xoá toàn bộ tin nhắn với bạn bè
  const handleAllDeleteMessages = async () => {
    if (!selectedFriend) return;

    if (
      !confirm(
        "Bạn có chắc muốn xóa toàn bộ tin nhắn với " +
          selectedFriend.full_name +
          "?",
      )
    ) {
      return; // Nếu người dùng hủy, không làm gì cả
    }
    try {
      await deleteAllMessages(selectedFriend.id);
      toast.success(
        "Đã xóa toàn bộ tin nhắn với " + selectedFriend.full_name + ".",
      );
    } catch (error) {
      toast.error("Xóa tin nhắn thất bại.");
    }
  };

  return {
    messages,
    loading,
    error,
    handleSendMessage,
    handleDeleteMessage,
    handleAllDeleteMessages,
  };
};
