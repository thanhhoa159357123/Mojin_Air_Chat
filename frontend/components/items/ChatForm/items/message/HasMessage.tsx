"use client";

import { IMessage } from "@/types/message";
import { Reply, Smile, Trash2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { IConversation } from "@/types/conversation";
import Image from "next/image";

interface HasMessageProps {
  isThem: boolean | null;
  msg: IMessage;
  messages: IMessage[];
  selectConversation: IConversation | null; // 💡 ĐỔI KIỂU CHUẨN SANG ICONVERSATION
  showSenderName: boolean;
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
  selectConversation,
  showSenderName,
  setPreviewImage,
  setReplyingTo,
  setChatDeleteMessageId,
  getFileNameFromUrl,
  setIsVisibleNotificationDeleteMessage,
}: HasMessageProps) => {
  const user = useAuthStore((state) => state.user);

  const senderName = msg.sender
    ? `${msg.sender.last_name} ${msg.sender.first_name}`.trim()
    : "Thành viên nhóm";

  const parseContent = (contentData: string, type: string) => {
    if (type !== "mixed") return { text: contentData, images: [], files: [] };
    if (typeof contentData === "string") {
      try {
        return JSON.parse(contentData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        return { text: contentData, images: [], files: [] };
      }
    }
    return contentData || { text: "", images: [], files: [] };
  };

  const currentContent = parseContent(msg.content, msg.type);

  return (
    <div
      className={`flex flex-col gap-1 max-w-[85%] ${!isThem ? "items-end" : "items-start"}`}
    >
      {showSenderName && !msg.parent_id && (
        <span className="text-[11px] font-semibold text-muted-foreground/80 ml-2 mb-0.5 block">
          {senderName}
        </span>
      )}

      {/* REPLY HEADER */}
      {msg.parent_id &&
        (() => {
          const parentMsg = messages.find((m) => m.id === msg.parent_id);
          if (!parentMsg) return null;

          const isParentMe = parentMsg.user_id === user?.id;

          // 💡 ĐỒNG BỘ LOGIC LẤY TÊN ĐỐI PHƯƠNG KHI REPLY
          const getTargetFirstName = (targetMsg: IMessage) => {
            if (targetMsg.sender?.first_name)
              return targetMsg.sender.first_name;
            if (selectConversation) {
              if (selectConversation.type === "group") {
                return selectConversation.label || "Nhóm";
              } else {
                const partner = selectConversation.participants?.find(
                  (p) => p.id !== user?.id,
                );
                return partner?.first_name || "Bạn bè";
              }
            }
            return "ai đó";
          };

          const parentSenderName = getTargetFirstName(parentMsg);
          const msgSenderName = getTargetFirstName(msg);

          let replyText = "";
          if (!isThem) {
            replyText = isParentMe
              ? "Bạn đã trả lời chính mình"
              : `Bạn đã trả lời ${parentSenderName}`;
          } else {
            replyText = isParentMe
              ? `${msgSenderName} đã trả lời bạn`
              : `${msgSenderName} đã trả lời ${parentMsg.user_id === msg.user_id ? "chính họ" : parentSenderName}`;
          }

          const parentContent = parseContent(parentMsg.content, parentMsg.type);

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
                      : parentMsg.type === "mixed"
                        ? parentContent.text || "[Tin nhắn hỗn hợp]"
                        : parentMsg.content}
                </p>
              </div>
            </div>
          );
        })()}

      <div
        className={`flex items-center gap-2 w-full ${!isThem ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* MAIN BUBBLE AREA */}
        <div
          className={`relative p-1 transition-all duration-200 ${
            msg.type === "text" || msg.type === "mixed" ? "px-4 py-2" : ""
          } ${
            !isThem
              ? `${msg.type === "text" || msg.type === "mixed" ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm shadow-sm" : ""}`
              : `${msg.type === "text" || msg.type === "mixed" ? "bg-secondary text-secondary-foreground rounded-2xl rounded-bl-sm border border-border shadow-sm" : ""}`
          }`}
        >
          {msg.type === "image" ? (
            <div className="relative group/image">
              <Image
                src={msg.content}
                alt="Image"
                className="max-w-62.5 max-h-62.5 rounded-lg border border-border/50 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setPreviewImage(msg.content)}
                width={200}
                height={200}
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
          ) : msg.type === "mixed" ? (
            <div className="flex flex-col gap-2 max-w-72">
              {/* 1. Text chữ */}
              {currentContent.text && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word px-0.5">
                  {currentContent.text}
                </p>
              )}

              {/* 2. Lưới ảnh Grid */}
              {currentContent.images && currentContent.images.length > 0 && (
                <div
                  className={`grid gap-1 mt-0.5 rounded-lg overflow-hidden ${
                    currentContent.images.length === 1
                      ? "grid-cols-1"
                      : currentContent.images.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                  }`}
                >
                  {currentContent.images.map((url: string, idx: number) => (
                    <Image
                      key={idx}
                      src={url}
                      alt="Uploaded image"
                      className={`w-full object-cover border border-border/10 cursor-pointer hover:opacity-90 transition-opacity shadow-sm bg-background/10 ${
                        currentContent.images.length === 1
                          ? "max-h-52 rounded-lg"
                          : "aspect-square h-24"
                      }`}
                      width={100}
                      height={100}
                      onClick={() => setPreviewImage(url)}
                    />
                  ))}
                </div>
              )}

              {/* 3. Đính kèm File tài liệu */}
              {currentContent.files && currentContent.files.length > 0 && (
                <div className="flex flex-col gap-1 mt-0.5">
                  {currentContent.files.map((url: string, idx: number) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg flex items-center gap-2 border overflow-hidden ${!isThem ? "bg-black/10 border-white/10 text-white" : "bg-background border-border text-foreground"}`}
                    >
                      <a
                        href={`${url}?download=`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 w-full hover:underline truncate text-xs font-medium"
                      >
                        <span
                          className="truncate shrink min-w-0"
                          title={getFileNameFromUrl(url)}
                        >
                          📄 {getFileNameFromUrl(url)}
                        </span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
              {msg.content}
            </p>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div
          className={`flex items-center gap-0.5 invisible group-hover:visible transition-all duration-200 text-muted-foreground shrink-0 ${!isThem ? "flex-row-reverse" : "flex-row"}`}
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
