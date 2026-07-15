/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { IMessage } from "@/types/message";
import {
  Edit2,
  Reply,
  Smile,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { IConversation } from "@/types/conversation";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query"; // 💡 GỌI VŨ KHÍ MỚI
import { useChats } from "@/hooks/useChats";

interface HasMessageProps {
  isThem: boolean | null;
  msg: IMessage;
  messages: IMessage[];
  selectConversation: IConversation | null;
  showSenderName: boolean;
  setPreviewImage: (url: string | null) => void;
  setReplyingTo: (msg: IMessage | null) => void;
  setChatDeleteMessageId: (id: number | null) => void;
  getFileNameFromUrl: (url: string) => string;
  setIsVisibleNotificationDeleteMessage: (visible: boolean) => void;
  startEditing: (msg: IMessage) => void;
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
  startEditing,
}: HasMessageProps) => {
  const user = useAuthStore((state) => state.user);

  // 💡 CHUYỂN SANG DÙNG useChats và queryClient
  const queryClient = useQueryClient();
  const { handleSendMessage } = useChats(selectConversation);

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
              ? msg.type === "text" || msg.type === "mixed"
                ? msg.isError
                  ? "bg-destructive/15 text-destructive rounded-2xl rounded-br-sm border border-destructive/30 shadow-xs"
                  : "bg-linear-to-br from-primary to-forest-dark text-white rounded-2xl rounded-br-sm shadow-md"
                : ""
              : msg.type === "text" || msg.type === "mixed"
                ? "bg-linear-to-br from-matcha-dark to-forest-darker text-white rounded-2xl rounded-bl-sm border border-(--forest-darker)/30 shadow-sm"
                : ""
          }`}
        >
          {msg.type === "image" ? (
            <div
              className={`relative group/image ${msg.isError ? "opacity-40 border border-destructive rounded-lg" : ""}`}
            >
              <Image
                src={msg.content}
                alt="Image"
                className="max-w-62.5 max-h-62.5 rounded-lg border border-border/50 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => !msg.isError && setPreviewImage(msg.content)}
                width={200}
                height={200}
              />
            </div>
          ) : msg.type === "file" ? (
            <div
              className={`p-4 rounded-xl flex items-center justify-between gap-4 max-w-62.5 overflow-hidden ${msg.isError ? "bg-destructive/15 text-destructive border border-destructive/20 rounded-br-sm" : !isThem ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary border border-border rounded-bl-sm"}`}
            >
              <a
                href={msg.isError ? undefined : `${msg.content}?download=`}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-3 w-full truncate ${msg.isError ? "pointer-events-none" : "hover:underline"}`}
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
            <div className="flex flex-col gap-2 max-w-full w-full break-words">
              {msg.edit_count > 0 && (
                <span className="text-[10px] text-foreground/50 italic self-end pr-1 mt-1">
                  (Đã chỉnh sửa)
                </span>
              )}

              {/* HIỂN THỊ HÀNG LOẠT ẢNH NẾU CÓ */}
              {currentContent.images && currentContent.images.length > 0 && (
                <div
                  className={`grid gap-1 mt-0.5 rounded-lg overflow-hidden ${msg.isError ? "opacity-40" : ""} ${
                    currentContent.images.length === 1
                      ? "grid-cols-1"
                      : currentContent.images.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                  }`}
                >
                  {currentContent.images.map((url: string, idx: number) => {
                    return (
                      <div
                        key={idx}
                        className="relative overflow-hidden rounded-lg"
                      >
                        <img
                          src={url}
                          alt="Chat attachment"
                          loading="lazy"
                          className={`w-full object-cover border border-border/10 cursor-pointer transition-all shadow-sm bg-background/10 ${
                            (msg as any).isSending
                              ? "opacity-50 blur-[2px] grayscale-30"
                              : "hover:opacity-90"
                          } ${
                            currentContent.images.length === 1
                              ? "max-h-52"
                              : "aspect-square h-24"
                          }`}
                          onClick={() =>
                            !msg.isError &&
                            !(msg as any).isSending &&
                            setPreviewImage(url)
                          }
                        />

                        {(msg as any).isSending && (
                          <div className="absolute inset-0 m-auto flex items-center justify-center pointer-events-none">
                            <div className="bg-black/50 p-2 rounded-full shadow-lg backdrop-blur-sm">
                              <Loader2 className="size-5 text-white animate-spin" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* HIỂN THỊ DANH SÁCH FILE NẾU CÓ */}
              {currentContent.files && currentContent.files.length > 0 && (
                <div className="flex flex-col gap-1 mt-0.5">
                  {currentContent.files.map((fileObj: any, idx: number) => {
                    const isObject =
                      typeof fileObj === "object" && fileObj !== null;
                    let finalUrl = isObject ? fileObj.url : fileObj;
                    const finalName = isObject
                      ? fileObj.name
                      : getFileNameFromUrl(fileObj);

                    if (finalUrl && finalUrl.includes("res.cloudinary.com")) {
                      finalUrl = finalUrl.replace(
                        "/upload/",
                        "/upload/fl_attachment/",
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg flex items-center gap-2 border overflow-hidden ${msg.isError ? "bg-destructive/5 border-destructive/20 text-destructive" : !isThem ? "bg-black/10 border-white/10 text-white" : "bg-background border-border text-foreground"}`}
                      >
                        <a
                          href={msg.isError ? undefined : finalUrl}
                          target="_blank"
                          rel="noreferrer"
                          download={finalName}
                          className={`flex items-center gap-2 w-full truncate text-xs font-medium ${msg.isError ? "pointer-events-none" : "hover:underline"}`}
                        >
                          <span
                            className="truncate shrink min-w-0"
                            title={finalName}
                          >
                            📄 {finalName}
                          </span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 🌟 VÀ VÁ THÊM KHÚC NÀY CỦA BÁC: Render đoạn Text đi kèm ảnh/file */}
              {currentContent.text && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-white w-full">
                  {currentContent.text}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col w-full max-w-full break-all">
              {msg.edit_count > 0 && (
                <span className="text-[10px] text-primary-foreground/70 italic self-end mt-0.5">
                  (Đã chỉnh sửa)
                </span>
              )}

              {/* Dùng break-all để ép chuỗi bùa chú dài dằng dặc này bắt buộc phải xuống dòng */}
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-all">
                {msg.content}
              </p>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        {!msg.isError && (
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
            {!isThem &&
              msg.type !== "system" &&
              msg.type !== "image" &&
              msg.type !== "file" && (
                <button
                  onClick={() => startEditing(msg)}
                  title="Chỉnh sửa tin nhắn"
                  className="p-1 hover:bg-primary/10 hover:text-primary rounded-full transition-colors cursor-pointer"
                >
                  <Edit2 className="size-4 font-bold" />
                </button>
              )}
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
        )}
      </div>

      {/* 🚨 NÚT GỬI LẠI ĐÃ ĐƯỢC CHUYỂN SANG DÙNG TANSTACK QUERY CACHE */}
      {msg.isError && (
        <button
          onClick={() => {
            // 1. Xóa thẳng tin nhắn lỗi này khỏi Cache của TanStack Query
            queryClient.setQueryData(
              ["messages", selectConversation?.id],
              (old: any) => {
                if (!old) return old;
                return {
                  ...old,
                  pages: old.pages.map((page: any) => ({
                    ...page,
                    data: page.data.filter((m: any) => m.id !== msg.id),
                  })),
                };
              },
            );

            // 2. Bắn lại API (Nó sẽ tự đẻ ra 1 cục Fake Message mới đang xoay vòng vòng siêu đẹp)
            handleSendMessage(msg.content, msg.parent_id, msg.type);
          }}
          className="flex items-center gap-1 text-[11px] text-destructive font-medium mt-0.5 pr-1 hover:underline cursor-pointer group active:scale-95 transition-transform animate-in fade-in duration-200"
          title="Bấm để gửi lại tin nhắn"
        >
          <AlertCircle className="size-3.5 animate-pulse" />
          <span>
            Gửi lỗi.{" "}
            <strong className="text-primary hover:text-primary/80">
              Thử lại?
            </strong>
          </span>
        </button>
      )}
    </div>
  );
};

export default HasMessage;
