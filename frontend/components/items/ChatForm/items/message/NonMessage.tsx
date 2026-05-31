import { useAuthStore } from "@/stores/useAuthStore";
import { useConversationStore } from "@/stores/useConversationStore";
import { Smile } from "lucide-react";

const NonMessage = () => {
  const user = useAuthStore((state) => state.user);
  const selectConversation = useConversationStore(
    (state) => state.selectConversation,
  );

  const getPrivateChatPartner = () => {
    if (
      !selectConversation ||
      selectConversation.type !== "private" ||
      !selectConversation.participants
    )
      return null;
    return (
      selectConversation.participants.find((p) => p.id !== user?.id) || null
    );
  };

  const isGroup = selectConversation?.type === "group";
  const partner = getPrivateChatPartner();

  // 🌟 ĐỒNG BỘ ĐỊNH DANH HIỂN THỊ TRÊN PROFILE DETAIL
  const displayName = selectConversation
    ? isGroup
      ? selectConversation.label || "Nhóm chưa đặt tên"
      : partner
        ? partner.full_name || `${partner.last_name} ${partner.first_name}`
        : "Người dùng Mojin"
    : "Mojin Air Chat";


  // 1. Kiểm tra nếu chưa chọn ai chat thì return null hoặc giao diện trống luôn
  if (!selectConversation) return null;

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 animate-fade-in">
      <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center">
        <Smile className="size-8 text-primary animate-bounce" />
      </div>
      <div className="text-center">
        <p className="text-foreground font-medium">
          Chưa có tin nhắn nào ở đây cả...
        </p>
        <p className="text-sm text-muted-foreground">
          Hãy gửi lời chào tới{" "}
          <span className="font-bold text-primary">{displayName}</span> ngay đi
          bác!
        </p>
      </div>
    </div>
  );
};

export default NonMessage;
