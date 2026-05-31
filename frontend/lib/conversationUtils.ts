// lib/conversationUtils.ts
import { IConversation } from "@/types/conversation";

// 🚀 TÁCH HÀM LẤY PARTNER RA RIÊNG ĐỂ XÀI ĐỘC LẬP LUÔN
export const getPrivateChatPartner = (
  conversation: IConversation | null,
  currentUserId: number | undefined,
) => {
  if (
    !conversation ||
    conversation.type !== "private" ||
    !conversation.participants
  ) {
    return null;
  }
  return conversation.participants.find((p) => p.id !== currentUserId) || null;
};

// 🚀 HÀM TỔNG HỢP GỌI LẠI HÀM Ở TRÊN
export const getConversationDetails = (
  conversation: IConversation | null,
  currentUserId: number | undefined,
) => {
  if (!conversation) {
    return {
      isGroup: false,
      partner: null,
      displayName: "",
      displayAvatar: null,
    };
  }

  const isGroup = conversation.type === "group";

  // 💡 Xài luôn cái hàm vừa tách ở trên, code cực kỳ tường minh!
  const partner = getPrivateChatPartner(conversation, currentUserId);

  const displayName = isGroup
    ? conversation.label || "Nhóm chưa đặt tên"
    : partner
      ? partner.full_name || `${partner.last_name} ${partner.first_name}`.trim()
      : "Người dùng Mojin";

  const displayUsername = conversation
    ? isGroup
      ? "Nhóm chat nhiều thành viên"
      : partner
        ? partner.username || "nguoidung_mojin"
        : "mojin_user"
    : "mojin_air_chat";

  const displayAvatar = isGroup ? null : partner?.avatar;

  return { isGroup, partner, displayName, displayUsername, displayAvatar };
};
