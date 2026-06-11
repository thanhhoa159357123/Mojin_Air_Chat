"use client";

import FormChatting from "./items/FormChatting";
import FormInput from "./items/FormInput";
import { useInputRefHook } from "./hooks/useInputRefHook";
import { useChatPusher } from "@/hooks/useChatPusher";
import HeaderBar from "./items/HeaderBar";
import { useChatStore } from "@/stores/useChatStore";
import { useEffect, useRef } from "react"; // 💡 NHẬP useRef VÀO ĐÂY
import { useChatHook } from "@/hooks/useChatHook";
import { useConversationStore } from "@/stores/useConversationStore";

interface ChatFormProps {
  onToggleOption: () => void;
  setChatDeleteMessageId: (messageId: number | null) => void;
  handleSendMessage: (
    content: string,
    parent_id?: number | null,
    type?: string,
  ) => void;
  setIsVisibleNotificationDeleteMessage: (visible: boolean) => void;
}

const ChatForm = ({
  onToggleOption,
  setChatDeleteMessageId,
  handleSendMessage,
  setIsVisibleNotificationDeleteMessage,
}: ChatFormProps) => {
  const selectConversation = useConversationStore(
    (state) => state.selectConversation,
  );
  const markConversationRead = useConversationStore(
    (state) => state.markConversationRead,
  );
  const { isGroup, partner, displayName, displayAvatar } =
    useChatHook(selectConversation);

  const inputHookData = useInputRefHook();
  useChatPusher(selectConversation);
  const fetchMessages = useChatStore((state) => state.fetchMessages);

  // 🚀 BẢO BỐI THẦN KHÍ CHỐNG REACT STRICT MODE & DOUBLE RENDER
  const fetchedRoomIdRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Trường hợp không có phòng: Reset sạch sẽ
    if (!selectConversation?.id) {
      useChatStore.setState({ messages: [], hasMore: true, page: 1, loading: false });
      fetchedRoomIdRef.current = null;
      return;
    }

    // 🚀 2. VÒNG KIM CÔ: Nếu phòng này vừa lấy data xong, cấm gọi API lần thứ 2!
    if (fetchedRoomIdRef.current === selectConversation.id) return;
    fetchedRoomIdRef.current = selectConversation.id; // Khóa chốt ID lại ngay

    const loadMessages = async () => {
      // Xóa tàn dư phòng cũ trước khi gọi API
      useChatStore.setState({ messages: [], hasMore: true, page: 1, loading: true });

      try {
        await fetchMessages(
          selectConversation.id,
          selectConversation.type,
          1,
          !!selectConversation.is_virtual,
        );
        
        if (selectConversation.unread_count && selectConversation.unread_count > 0) {
          // GỌI /read SAU CÙNG ĐỂ KHÔNG CHÉN CHUNG BĂNG THÔNG VỚI THẰNG MESSAGES
          await markConversationRead(selectConversation.id).catch(() => {});
        }
      } catch {
        // Handle error in store
      }
    };

    void loadMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectConversation?.id]); // Lắng nghe chuẩn ID


  return (
    <div className="flex flex-col h-full bg-background/40 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-border">
      <HeaderBar
        isGroup={isGroup}
        partner={partner}
        displayName={displayName}
        displayAvatar={displayAvatar}
        onToggleOption={onToggleOption}
      />
      <FormChatting
        selectConversation={selectConversation}
        partner={partner}
        setReplyingTo={inputHookData.setReplyingTo}
        startEditing={inputHookData.startEditing}
        setChatDeleteMessageId={setChatDeleteMessageId}
        setIsVisibleNotificationDeleteMessage={
          setIsVisibleNotificationDeleteMessage
        }
      />
      <FormInput
        inputHookData={inputHookData}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatForm;