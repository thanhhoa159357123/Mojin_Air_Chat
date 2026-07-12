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
import { useFriends } from "@/hooks/useFriends"; // 💡 IMPORT HOOK BẠN BÈ CỦA BÁC
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

  // 💡 LẤY DANH SÁCH BẠN BÈ MỚI NHẤT TỪ CACHE TANSTACK QUERY
  // (Cục useFriends này có staleTime nên F5 nó sẽ tự re-fetch ngầm cực nhanh)
  const { friends } = useFriends();

  // 💡 Lấy thông tin hiển thị UI
  const { isGroup, partner, displayName, displayAvatar } =
    getConversationDetails(selectConversation, user?.id);

  const inputHookData = useInputRefHook();

  // 💡 Bật Radar hứng Pusher
  useChatPusher(selectConversation);

  // 🚀 ĐÚNG DUY NHẤT 1 CÁI USE-EFFECT CHỈ ĐỂ BÁO ĐÃ ĐỌC
  useEffect(() => {
    if (selectConversation?.id && Number(selectConversation.my_last_read_at || 0) > 0) {
      handleMarkConversationRead(selectConversation.id);
    }
  }, [selectConversation?.id, selectConversation?.my_last_read_at, handleMarkConversationRead]);

  // =========================================================================
  // 🚀 BÍ THUẬT TRIỆT TIÊU BUG LOCALSTORAGE KHI F5
  // =========================================================================
  // Nếu là phòng chat 1-1, check xem thằng partner.id có nằm trong list bạn bè không.
  // Nếu list bạn bè load xong mà ĐÉO thấy nó đâu -> Ép cứng trạng thái Read-only kể cả data localStorage bảo false!
  const isStillFriend = isGroup 
    ? true 
    : friends.some((f) => Number(f.id) === Number(partner?.id));

  const isReadOnly = selectConversation?.is_read_only || !isStillFriend;
  // =========================================================================

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
      
      {/* 💡 THAY ĐỔI TẠI ĐÂY: Dùng biến tính toán động isReadOnly */}
      {isReadOnly ? (
        // 🔴 GIAO DIỆN KHÓA: Khi 2 đứa đã hủy kết bạn dưới DB hoặc check cache thấy mất friend
        <div className="px-6 py-4 border-t border-border bg-secondary/30 flex items-center justify-center">
          <div className="w-full bg-secondary/70 text-muted-foreground text-center text-xs py-3 px-4 rounded-2xl border border-dashed border-border/60 italic select-none">
            🔒 Hai người hiện không còn là bạn bè. Hãy kết bạn lại để tiếp tục trò chuyện.
          </div>
        </div>
      ) : (
        // 🟢 GIAO DIỆN BÌNH THƯỜNG: Vẫn là bạn bè thì render FormInput của bác
        <FormInput
          inputHookData={inputHookData}
          handleSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
};

export default ChatForm;