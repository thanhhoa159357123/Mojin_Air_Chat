"use client";

import FormChatting from "./items/FormChatting";
import FormInput from "./items/FormInput";
import { useInputRefHook } from "./hooks/useInputRefHook";
import { useChatPusher } from "@/hooks/useChatPusher";
import HeaderBar from "./items/HeaderBar";
import { useChatFormHook } from "./hooks/useChatFormHook";
import { useChatStore } from "@/stores/useChatStore";
import { useEffect } from "react";
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
  // 💡 NGUỒN CHÂN LÝ: Lấy phòng đang chat chính chủ từ Store
  // 💡 GỌI HOOK DUY NHẤT 1 LẦN Ở ĐÂY ĐỂ TRÁNH XUNG ĐỘT STATE
  const inputHookData = useInputRefHook();

  // 🌟 KÍCH HOẠT MẮT THẦN REAL-TIME: Nghe chuẩn đét theo ID cuộc hội thoại
  useChatPusher(selectConversation);

  const fetchMessages = useChatStore((state) => state.fetchMessages);

  useEffect(() => {
    const loadMessages = async () => {
      if (selectConversation?.id) {
        try {
          await fetchMessages(
            selectConversation.id,
            selectConversation.type,
            1,
            !!selectConversation.is_virtual,
          );
          if (
            selectConversation.unread_count &&
            selectConversation.unread_count > 0
          ) {
            await markConversationRead(selectConversation.id);
          }
        } catch {
          // Lỗi đã được xử lý trong store
        }
      } else {
        // Nếu không chọn ai (vừa vào app), dọn sạch mảng tin nhắn về rỗng
        useChatStore.setState({ messages: [] });
      }
    };

    void loadMessages();
  }, [selectConversation, fetchMessages, markConversationRead]);

  return (
    <div className="flex flex-col h-full bg-background/40 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-border">
      {/* Header Bar */}
      <HeaderBar
        isGroup={isGroup}
        partner={partner}
        displayName={displayName}
        displayAvatar={displayAvatar}
        onToggleOption={onToggleOption}
      />

      {/* Messages Area */}
      <FormChatting
        selectConversation={selectConversation}
        setReplyingTo={inputHookData.setReplyingTo}
        setChatDeleteMessageId={setChatDeleteMessageId}
        setIsVisibleNotificationDeleteMessage={
          setIsVisibleNotificationDeleteMessage
        }
      />

      {/* Input Form */}
      <FormInput
        inputHookData={inputHookData}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatForm;
