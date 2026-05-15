"use client";

import { IMessage } from "@/types/chat";
import { IFriend } from "@/types/friend";
import { Menu, Phone } from "lucide-react";
import FormChatting from "./items/FormChatting";
import FormInput from "./items/FormInput";
import { useInputRefHook } from "./hooks/useInputRefHook";
import { useFriendStore } from "@/stores/useFriendStore";

interface ChatFormProps {
  onToggleOption: () => void;
  messages: IMessage[]; // Thêm prop này để nhận tin nhắn từ parent component
  setChatDeleteMessageId: (messageId: number | null) => void; // Thêm prop này để set ID tin nhắn cần xoá lên parent component
  handleSendMessage: (
    friend: IFriend,
    content: string,
    parent_id?: number | null,
    type?: string,
  ) => void; // Thêm prop này để gửi tin nhắn từ parent component
  setIsVisibleNotificationDeleteMessage: (visible: boolean) => void; // Thêm prop này để điều khiển hiển thị thông báo xoá tin nhắn
}

const ChatForm = ({
  onToggleOption,
  messages,
  setChatDeleteMessageId,
  handleSendMessage,
  setIsVisibleNotificationDeleteMessage,
}: ChatFormProps) => {
  const selectedFriend = useFriendStore((state) => state.selectedFriend);
  const {
    inputValue,
    setInputValue,
    handleSend,
    handleKeyDown,
    replyingTo,
    setReplyingTo,
  } = useInputRefHook();

  return (
    <div className="flex flex-col h-full bg-background/40 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-border">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-10 rounded-full bg-primary shadow-lg" />
            <span className="absolute bottom-0 right-0 size-3 bg-primary rounded-full ring-2 ring-background"></span>
          </div>
          <div>
            <span className="font-semibold text-foreground">
              {selectedFriend ? selectedFriend.full_name : "Chọn một bạn bè"}
            </span>
            <span className="text-xs text-muted-foreground block">
              Đang hoạt động
            </span>
          </div>
        </div>
        <div className="flex gap-4 text-muted-foreground">
          <Phone className="size-4 cursor-pointer hover:text-primary transition-all duration-200" />
          <Menu
            onClick={onToggleOption}
            className="size-4 cursor-pointer hover:text-primary transition-all duration-200"
          />
        </div>
      </div>

      {/* Messages Area */}
      <FormChatting
        messages={messages}
        setReplyingTo={setReplyingTo}
        setChatDeleteMessageId={setChatDeleteMessageId}
        setIsVisibleNotificationDeleteMessage={
          setIsVisibleNotificationDeleteMessage
        }
      />

      {/* Input Form */}
      <FormInput
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleKeyDown={handleKeyDown}
        onSend={handleSend}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatForm;
