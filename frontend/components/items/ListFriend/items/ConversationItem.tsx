import Image from "next/image";
import { Users, MoreHorizontal } from "lucide-react";
import { AnimatePresence } from "motion/react";
import OptionUser from "./OptionUser";
import { IConversation } from "@/types/conversation";
import { useConversationStore } from "@/stores/useConversationStore";

interface ConversationItemProps {
  data: IConversation;
  isSelected: boolean;
  isPopupOpen: boolean;
  currentUserId: number | string | undefined;
  onClick: () => void;
  onTogglePopup: () => void;
  onClosePopup: () => void;
}

const ConversationItem = ({
  data,
  isSelected,
  isPopupOpen,
  currentUserId,
  onClick,
  onTogglePopup,
  onClosePopup,
}: ConversationItemProps) => {
  const isGroup = data.type === "group";
  const partner = data.participants?.[0];

  const displayName = isGroup
    ? data.label || "Nhóm chưa đặt tên"
    : partner?.full_name || "Người dùng Mojin";
  const avatarUrl = isGroup ? data.avatar : partner?.avatar;
  const isOnline = !isGroup && partner?.status === "online";

  // 💡 HÀM XỬ LÝ TEXT TIN NHẮN CUỐI CÙNG
  const renderLastMessageContent = () => {
    if (!data.last_message) return "Chưa có tin nhắn";

    // 1. Kiểm tra xem mình có phải là người gửi tin nhắn này không
    // (Ép kiểu về String hoặc Number cho đồng bộ tùy data của bác)
    const isMe = String(data.last_message.user_id) === String(currentUserId);

    // 2. Tiền tố (Prefix) hiển thị trước tin nhắn
    const prefix = isMe ? "Bạn: " : "";

    // 3. Render nội dung theo từng loại tin nhắn kèm theo prefix
    if (data.last_message.type === "text") {
      return `${prefix}${data.last_message.content}`;
    }

    if (data.last_message.type === "image") return `${prefix}[Hình ảnh]`;
    if (data.last_message.type === "file") return `${prefix}[Tệp tin]`;

    return `${prefix}${data.last_message.content || "Tin nhắn mới"}`;
  };

  return (
    <div
      onClick={onClick}
      className={`group/item relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors duration-150 ${
        isSelected
          ? "bg-forest-light/15 dark:bg-forest/20 border border-forest/20 dark:border-forest/30"
          : "hover:bg-muted/50 border border-transparent"
      }`}
      title={displayName}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={`size-12 rounded-full flex items-center justify-center overflow-hidden ${isGroup ? "bg-linear-to-br from-forest-light to-matcha" : "bg-muted"}`}
        >
          {isGroup ? (
            <Users className="size-5 text-white" />
          ) : avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-foreground/60 font-semibold text-sm uppercase">
              {displayName?.substring(0, 2)}
            </span>
          )}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 size-3.5 bg-emerald-500 rounded-full ring-2 ring-card" />
        )}
      </div>

      {/* Thông tin */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`font-semibold text-sm truncate ${isSelected ? "text-forest-dark dark:text-forest-light" : "text-foreground"}`}
          >
            {displayName}
          </span>
          {data.last_message?.created_at && (
            <span className="text-[11px] text-muted-foreground shrink-0">
              {new Date(data.last_message.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          {/* 💡 THAY ĐỔI TẠI ĐÂY: Gọi hàm render nội dung thật từ backend truyền vào */}
          <p
            className={`text-xs truncate ${Number(data.unread_count || 0) > 0 ? "text-foreground font-semibold" : "text-muted-foreground"}`}
          >
            {renderLastMessageContent()}
          </p>
          {Number(data.unread_count || 0) > 0 && (
            <span className="min-w-5 h-5 px-1.5 rounded-full bg-forest text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {data.unread_count}
            </span>
          )}
        </div>
      </div>

      {/* Nút 3 chấm (Chỉ hiện cho chat riêng tư như thiết kế của bác) */}
      {!isGroup && (
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePopup();
            }}
            className="size-8 rounded-lg flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <MoreHorizontal className="size-4" />
          </button>
          <AnimatePresence>
            {isPopupOpen && <OptionUser onClose={onClosePopup} />}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ConversationItem;
