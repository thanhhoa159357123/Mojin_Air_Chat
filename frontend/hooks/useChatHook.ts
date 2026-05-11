import { useEffect } from "react";
import { useChatStore } from "@/stores/useChatStore";
import { IFriend } from "@/types/friend";
import { toast } from "sonner";

export const useChatHook = (selectedFriend: IFriend | null) => {
  const {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    deleteMessage,
    deleteAllMessages,
  } = useChatStore();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (selectedFriend) {
      // 1. Lần đầu click vào thì gọi ngay lập tức để hiện tin nhắn
      fetchMessages(selectedFriend.id);

      // 2. Thiết lập "máy nhắc việc": Cứ 3 giây gọi API 1 lần để lấy tin nhắn mới
      intervalId = setInterval(() => {
        // fetchMessages này của Zustand đã lo việc cập nhật mảng messages rồi
        fetchMessages(selectedFriend.id);
      }, 3000); // 3000ms = 3 giây. Bác có thể chỉnh thành 5000 nếu muốn máy nhẹ hơn.
    } else {
      useChatStore.setState({ messages: [] });
    }

    // 3. QUAN TRỌNG: Khi đóng chat hoặc đổi người, phải dẹp cái "máy nhắc" này đi
    // Nếu không nó cứ chạy ngầm mãi gây tốn tài nguyên (Memory Leak)
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFriend?.id]); // Chạy lại mỗi khi đổi bạn chat

  const handleSendMessage = async (
    selectedFriend: IFriend,
    content: string,
  ) => {
    try {
      await sendMessage(selectedFriend.id, content);
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
