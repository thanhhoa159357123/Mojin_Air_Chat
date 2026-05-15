import { IMessage } from "@/types/chat";
import { IFriend } from "@/types/friend";
import { Reply, Smile, Trash2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

interface HasMessageProps {
  isThem: boolean | null;
  msg: IMessage;
  messages: IMessage[]; // Cần cả mảng tin nhắn để tìm parent message khi có reply
  selectedFriend: IFriend | null;
  setPreviewImage: (url: string | null) => void;
  setReplyingTo: (msg: IMessage | null) => void;
  setChatDeleteMessageId: (id: number | null) => void;
  getFileNameFromUrl: (url: string) => string;
  setIsVisibleNotificationDeleteMessage: (visible: boolean) => void;
}

const HasMessage = ({
  isThem,
  msg,
  messages,
  selectedFriend,
  setPreviewImage,
  setReplyingTo,
  setChatDeleteMessageId,
  getFileNameFromUrl,
  setIsVisibleNotificationDeleteMessage,
}: HasMessageProps) => {
  const user = useAuthStore((state) => state.user);

  return (
    <div
      className={`flex flex-col gap-1 max-w-[85%] ${!isThem ? "items-end" : "items-start"}`}
    >
      {/* REPLY HEADER */}
      {msg.parent_id &&
        (() => {
          const parentMsg = messages.find((m) => m.id === msg.parent_id);
          if (!parentMsg) return null;

          const isParentMe = parentMsg.user_id === user?.id;

          // Lấy Tên hiển thị an toàn
          const myName = "Bạn";
          const parentSenderName =
            parentMsg.sender?.first_name ||
            selectedFriend?.first_name ||
            "ai đó";
          const msgSenderName =
            msg.sender?.first_name || selectedFriend?.first_name || "Ai đó";

          // Lắp ghép câu text reply thông minh
          let replyText = "";
          if (!isThem) {
            // Mình gửi
            replyText = isParentMe
              ? "Bạn đã trả lời chính mình"
              : `Bạn đã trả lời ${parentSenderName}`;
          } else {
            // Người khác gửi
            replyText = isParentMe
              ? `${msgSenderName} đã trả lời bạn`
              : `${msgSenderName} đã trả lời ${parentMsg.user_id === msg.user_id ? "chính họ" : parentSenderName}`;
          }

          return (
            <div
              className={`flex flex-col ${!isThem ? "items-end" : "items-start"} mb-1`}
            >
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium mb-1">
                <Reply className="size-3 -scale-x-100" />
                <span>{replyText}</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-foreground/5 text-foreground/70 text-xs w-fit max-w-full opacity-90 border border-border/50">
                <p className="line-clamp-2">
                  {parentMsg.type === "image"
                    ? "[Hình ảnh]"
                    : parentMsg.type === "file"
                      ? "[Tệp tin]"
                      : parentMsg.content}
                </p>
              </div>
            </div>
          );
        })()}

      <div
        className={`flex items-center gap-2 w-full ${!isThem ? "flex-row-reverse" : "flex-row"}`}
      >
        <div
          className={`relative p-1 transition-all duration-200 ${
            msg.type === "text" ? "px-4 py-1.5" : ""
          } ${
            !isThem
              ? `${msg.type === "text" ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm" : ""}`
              : `${msg.type === "text" ? "bg-secondary text-secondary-foreground rounded-2xl rounded-bl-sm border border-border" : ""}`
          }`}
        >
          {msg.type === "image" ? (
            <div className="relative group/image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={msg.content}
                alt="Image"
                className="max-w-62.5 max-h-62.5 rounded-lg border border-border/50 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setPreviewImage(msg.content)}
              />
            </div>
          ) : msg.type === "file" ? (
            <div
              className={`p-4 rounded-xl flex items-center justify-between gap-4 max-w-62.5 overflow-hidden ${!isThem ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary border border-border rounded-bl-sm"}`}
            >
              <a
                href={`${msg.content}?download=`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 w-full hover:underline truncate"
              >
                <span
                  className="text-sm font-medium truncate shrink min-w-0"
                  title={getFileNameFromUrl(msg.content)}
                >
                  📁 {getFileNameFromUrl(msg.content)}
                </span>
              </a>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
              {msg.content}
            </p>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div
          className={`flex items-center gap-0.5 invisible group-hover:visible transition-all duration-200 text-muted-foreground shrink-0 ${
            !isThem ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <button className="p-1 hover:bg-muted rounded-full transition-colors cursor-pointer">
            <Smile className="size-4 font-bold" />
          </button>
          <button
            onClick={() => setReplyingTo(msg)}
            className="p-1 hover:bg-muted rounded-full transition-colors cursor-pointer"
          >
            <Reply className="size-4 font-bold" />
          </button>
          <button
            onClick={() => {
              setChatDeleteMessageId(msg.id);
              setIsVisibleNotificationDeleteMessage(true);
            }}
            className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors cursor-pointer"
          >
            <Trash2 className="size-4 font-bold" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HasMessage;
