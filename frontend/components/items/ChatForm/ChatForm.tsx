"use client";

import { useEffect } from "react";
import FormChatting from "./items/FormChatting";
import FormInput from "./items/FormInput";
import HeaderBar from "./items/HeaderBar";
import { useInputRefHook } from "./hooks/useInputRefHook";
import { useChatPusher } from "@/hooks/useChatPusher";
import { useConversations } from "@/hooks/useConversations";
import { useConversationStore } from "@/stores/useConversationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { getConversationDetails } from "@/lib/conversationUtils";

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
  const user = useAuthStore((state) => state.user);
  const selectConversation = useConversationStore((state) => state.selectConversation);
  
  // 💡 Móc hàm đánh dấu đã đọc từ TanStack Query Hook
  const { handleMarkConversationRead } = useConversations();

  // 💡 Lấy thông tin hiển thị UI
  const { isGroup, partner, displayName, displayAvatar } = getConversationDetails(
    selectConversation,
    user?.id
  );

  const inputHookData = useInputRefHook();
  
  // 💡 Bật Radar hứng Pusher
  useChatPusher(selectConversation);

  // 🚀 ĐÚNG DUY NHẤT 1 CÁI USE-EFFECT CHỈ ĐỂ BÁO ĐÃ ĐỌC (Còn lấy tin nhắn thì useChats nó tự lo ngầm rồi!)
  useEffect(() => {
    if (selectConversation?.id && Number(selectConversation.unread_count || 0) > 0) {
      handleMarkConversationRead(selectConversation.id);
    }
  }, [selectConversation?.id, selectConversation?.unread_count, handleMarkConversationRead]);

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
        setIsVisibleNotificationDeleteMessage={setIsVisibleNotificationDeleteMessage}
      />
      <FormInput
        inputHookData={inputHookData}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatForm;