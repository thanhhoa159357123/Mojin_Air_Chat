"use client";

import { useChatStore } from "@/stores/useChatStore";
import { useConversationStore } from "@/stores/useConversationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { IConversation } from "@/types/conversation";
import { IMessage } from "@/types/message";
import { toast } from "sonner";
import { getConversationDetails } from "@/lib/conversationUtils";

export const useChatHook = (selectConversation: IConversation | null) => {
  const user = useAuthStore((state) => state.user);
  const store = useChatStore();
  const conversations = useConversationStore((state) => state.conversations);

  const liveConversation = selectConversation
    ? conversations.find(
        (c) =>
          c.id === selectConversation.id && c.type === selectConversation.type,
      ) || selectConversation
    : null;

  const { isGroup, partner, displayName, displayAvatar } =
    getConversationDetails(liveConversation, user?.id);

  // 🚀 OPTIMISTIC UI: GỬI TIN NHẮN
  const handleSendMessage = async (
    content: string,
    parent_id?: number | null,
    messageType: string = "text",
  ) => {
    if (!selectConversation || !user?.id) return;

    const type = isGroup ? "group" : "private";
    const fakeMsgId = `optimistic-${Date.now()}`;

    // 1. TẠO TIN NHẮN GIẢ TRÊN RAM
    const fakeMessage: IMessage = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: fakeMsgId as any,
      conversation_id: selectConversation.id,
      user_id: user.id,
      parent_id: parent_id || null,
      content: content,
      edit_count: 0,
      type: messageType,
      created_at: new Date().toISOString(),
      sender: {
        id: user.id,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        avatar: user.avatar || null,
      },
    };

    // 2. NHÉT VÀO KHUNG CHAT (0ms)
    useChatStore.setState((chatState) => ({
      messages: [...chatState.messages, fakeMessage],
    }));

    // 3. ĐẨY LÊN TOP SIDEBAR (0ms)
    useConversationStore.setState((convState) => {
      const restConversations = convState.conversations.filter((c) => c.id !== selectConversation.id);
      const targetConv = convState.conversations.find((c) => c.id === selectConversation.id) || selectConversation;
      const updatedConv = { ...targetConv, last_message: fakeMessage, updated_at: fakeMessage.created_at, unread_count: 0 };
      
      return {
        conversations: [updatedConv, ...restConversations],
        selectConversation: convState.selectConversation?.id === selectConversation.id ? updatedConv : convState.selectConversation,
      };
    });

    try {
      // 4. GỌI API NGẦM
      const responseData = await store.sendMessage(selectConversation.id, type, content, parent_id, messageType);

      if (!responseData) return;

      // 🌟 BƯỚC 5: ÉP KIỂU SỐ ĐỂ CHỐNG TRÙNG LẶP DO TYPE MISMATCH
      useChatStore.setState((chatState) => {
        // 1. Gắp cái tin nhắn giả (optimistic) ném sọt rác
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanMessages = chatState.messages.filter((m) => m.id !== (fakeMsgId as any));
        
        // 2. 💡 BẢO BỐI Ở ĐÂY: Ép cả 2 vế về Number để so sánh chuẩn tuyệt đối!
        const incomingId = Number(responseData.id);
        const alreadyExists = cleanMessages.some((m) => Number(m.id) === incomingId);
        
        return {
          messages: alreadyExists ? cleanMessages : [...cleanMessages, responseData],
        };
      });

      // Đồng bộ Sidebar giữ nguyên
      useConversationStore.setState((convState) => ({
        conversations: convState.conversations.map((c) => c.id === selectConversation.id ? { ...c, last_message: responseData } : c),
        selectConversation: convState.selectConversation?.id === selectConversation.id ? { ...convState.selectConversation, last_message: responseData } : convState.selectConversation,
      }));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      // 🌟 BƯỚC 6: BÁO LỖI
      useChatStore.setState((chatState) => ({
        messages: chatState.messages.map((m) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          m.id === (fakeMsgId as any) 
            ? { ...m, isError: true } 
            : m
        ),
      }));
      toast.error("Gửi tin nhắn thất bại.");
    }
  };

  // 🚀 OPTIMISTIC UI: XÓA TIN NHẮN
  const handleDeleteMessage = async (messageId: number) => {
    if (!selectConversation) return;

    const previousMessages = store.messages;

    // Cho bốc hơi khỏi màn hình trong 0ms (💡 Nhớ ép kiểu)
    useChatStore.setState({
      messages: previousMessages.filter((m) => Number(m.id) !== Number(messageId)),
    });

    try {
      await store.deleteMessage(selectConversation.id, messageId);
      toast.success("Đã xóa tin nhắn.");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      useChatStore.setState({ messages: previousMessages });
      toast.error("Xóa tin nhắn thất bại.");
    }
  };

  // Hàm xoá toàn bộ tin nhắn
  const handleAllDeleteMessages = async () => {
    if (!selectConversation) return;
    if (!confirm(`Bạn có chắc muốn xóa toàn bộ tin nhắn với ${displayName}?`)) return;

    try {
      await store.deleteAllMessages(selectConversation.id);
      toast.success(`Đã xóa toàn bộ tin nhắn với ${displayName}.`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      toast.error("Xóa tin nhắn thất bại.");
    }
  };

  // 🚀 OPTIMISTIC UI: SỬA TIN NHẮN
  const handleEditMessage = async (messageId: number, content: string) => {
    if (!selectConversation) return;

    const previousMessages = store.messages;

    // Đổi chữ ngay trên RAM (💡 Nhớ ép kiểu)
    useChatStore.setState({
      messages: previousMessages.map((m) =>
        Number(m.id) === Number(messageId) ? { ...m, content: content, edit_count: (m.edit_count || 0) + 1 } : m
      ),
    });

    try {
      await store.editMessage(selectConversation.id, messageId, content);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      useChatStore.setState({ messages: previousMessages });
      toast.error("Chỉnh sửa tin nhắn thất bại.");
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
    handleEditMessage,
  };
};