import Image from "next/image";
import { Users, MoreHorizontal } from "lucide-react";
import { AnimatePresence } from "motion/react";
import OptionUser from "./OptionUser";
import { IConversation } from "@/types/conversation";

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
  console.log("Partner hiện tại: ", partner)

  const hasNewNotification =
    new Date(data.updated_at) > new Date(data.my_last_read_at || 0);

  const renderLastMessageContent = () => {
    if (!data.last_message) return "Chưa có tin nhắn";
    const isMe = String(data.last_message.user_id) === String(currentUserId);
    const prefix = isMe ? "Bạn: " : "";

    if (data.last_message.type === "text") {
      return `${prefix}${data.last_message.content}`;
    }
    if (data.last_message.type === "image") return `${prefix}[Hình ảnh]`;
    if (data.last_message.type === "file") return `${prefix}[Tệp tin]`;

    if (data.last_message.type === "mixed") {
      try {
        const parsed = JSON.parse(data.last_message.content);
        const hasImages = parsed.images && parsed.images.length > 0;
        const hasFiles = parsed.files && parsed.files.length > 0;
        const text = parsed.text || "";

        if (hasImages) return `${prefix}[Hình ảnh] ${text}`.trim();
        if (hasFiles) return `${prefix}[Tệp tin] ${text}`.trim();
        return `${prefix}${text}`;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        return `${prefix}Tin nhắn mới`;
      }
    }

    return `${prefix}${data.last_message.content || "Tin nhắn mới"}`;
  };

  return (
    <div
      onClick={onClick}
      className={`group/item relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer ${
        isSelected
          ? "bg-matcha/10 dark:bg-matcha/20"
          : "hover:bg-muted/60 border-l-[3px] border-transparent"
      }`}
      title={displayName}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="size-11 rounded-full bg-matcha/10 dark:bg-matcha/20 flex items-center justify-center overflow-hidden">
          {isGroup ? (
            <Users className="size-5 text-forest dark:text-matcha-light" />
          ) : avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-forest dark:text-matcha-light font-semibold text-sm uppercase">
              {displayName?.substring(0, 2)}
            </span>
          )}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full ring-2 ring-card" />
        )}
      </div>

      {/* Thông tin */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`font-medium text-sm truncate ${
              isSelected
                ? "text-forest-dark dark:text-forest-light"
                : "text-foreground"
            }`}
          >
            {displayName}
          </span>

          {/* Cụm bên phải: MoreHorizontal + Time */}
          <div className="flex items-center gap-1 shrink-0">
            {/* MoreHorizontal */}
            <div className="w-0 opacity-0 invisible group-hover/item:w-7 group-hover/item:opacity-100 group-hover/item:visible transition-all duration-150">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePopup();
                }}
                className="size-7 rounded-md flex items-center justify-center hover:bg-matcha/15 dark:hover:bg-matcha/30 text-muted-foreground hover:text-forest dark:hover:text-matcha-light"
              >
                <MoreHorizontal className="size-3.5" />
              </button>

              <AnimatePresence>
                {isPopupOpen && (
                  <OptionUser
                    onClose={onClosePopup}
                    partner={{
                      id: Number(isGroup ? data.id : partner?.id || 0),
                      name: isGroup
                        ? data.label || "Nhóm"
                        : partner?.full_name || "Người dùng",
                      type: data.type,
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Time */}
            {data.last_message?.created_at && (
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                {new Date(data.last_message.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Dòng cuối: Last message + Notification dot */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <p
            className={`text-xs truncate ${
              hasNewNotification
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            }`}
          >
            {renderLastMessageContent()}
          </p>

          {hasNewNotification && (
            <span className="size-2 rounded-full bg-forest dark:bg-matcha-light shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;