"use client";

import { IMessage } from "@/types/message";
import Image from "next/image";
import { ArrowDown, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import NonMessage from "./message/NonMessage";
import HasMessage from "./message/HasMessage";
import { useChatRefHook } from "../hooks/useChatRefHook";
import { getFileNameFromUrl } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatFormHook } from "../hooks/useChatFormHook";
import { IConversation, IPartner } from "@/types/conversation";
import { useChats } from "@/hooks/useChats";

interface FormChattingProps {
  selectConversation: IConversation | null;
  partner: IPartner | null;
  setReplyingTo: (msg: IMessage | null) => void;
  setChatDeleteMessageId: (id: number | null) => void;
  setIsVisibleNotificationDeleteMessage: (visible: boolean) => void;
  startEditing: (msg: IMessage) => void;
}

const FormChatting = ({
  partner,
  setReplyingTo,
  setChatDeleteMessageId,
  setIsVisibleNotificationDeleteMessage,
  selectConversation,
  startEditing,
}: FormChattingProps) => {
  const { typingUser } = useChatFormHook();
  const user = useAuthStore((state) => state.user);

  const {
    messages,
    isLoading: loading,
    isFetchingNextPage: loadingMore,
    hasNextPage: hasMore,
    fetchNextPage,
  } = useChats(selectConversation);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchNextPage();
    }
  };

  const {
    containerRef,
    showScrollDown,
    handleScroll,
    scrollToBottom,
    unreadCount,
  } = useChatRefHook(
    messages,
    selectConversation?.id,
    handleLoadMore,
    hasMore,
    loadingMore,
  );

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // 💡 VÌ MẢNG ĐÃ XUÔI: Tin nhắn mới nhất nằm ở CUỐI mảng!
  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  const isLastMine =
    !!lastMessage &&
    Number(lastMessage.user_id) === Number(user?.id) &&
    lastMessage.type !== "system";

  const isPrivateChat = selectConversation?.type === "private";

  const partnerLastReadAt =
    selectConversation?.participants?.find(
      (p) => Number(p.id) !== Number(user?.id),
    )?.pivot?.last_read_at || null;

  const isSeen =
    !!lastMessage &&
    !!partnerLastReadAt &&
    new Date(partnerLastReadAt).getTime() >=
      new Date(lastMessage.created_at).getTime();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // =========================================================================
  // 🚀 BÍ THUẬT BẮT PHÍM ESC ĐỂ ĐÓNG POPUP XEM ẢNH TO
  // =========================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewImage(null);
      }
    };

    // Chỉ đăng ký lắng nghe khi đang mở ảnh to
    if (previewImage) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewImage]);

  return (
    <div className="flex-1 relative min-h-0 bg-background">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ overflowAnchor: "auto" }}
        className="h-full overflow-y-auto p-4 space-y-2"
      >
        {/* SPINNER LƠ LỬNG */}
        {loadingMore && (
          <div className="absolute top-2 left-0 w-full flex justify-center z-10 pointer-events-none">
            <div className="bg-background/80 p-1.5 rounded-full shadow-sm border border-border">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          </div>
        )}

        {loading && messages.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 opacity-60">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">
              Đang tải tin nhắn...
            </p>
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg, index) => {
            if (msg.type === "system") {
              return (
                <div
                  key={`system-${msg.id}-${index}`}
                  className="w-full flex justify-center my-4 animate-in fade-in zoom-in-95 duration-300"
                >
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[11px] font-medium text-primary tracking-wide shadow-sm max-w-[80%] text-center">
                    <span>✨</span>
                    <span className="leading-relaxed">{msg.content}</span>
                  </div>
                </div>
              );
            }

            const isThem = Number(msg.user_id) !== Number(user?.id);

            // 💡 LOGIC XUÔI CHIỀU THỜI GIAN:
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const nextMsg =
              index < messages.length - 1 ? messages[index + 1] : null;

            // Hiện tên người gửi nếu là tin nhắn đầu tiên của cụm (Tin trước đó khác người gửi)
            const showSenderName =
              isThem &&
              (index === 0 ||
                prevMsg?.type === "system" ||
                Number(prevMsg?.user_id) !== Number(msg.user_id));

            // Hiện avatar nếu là tin nhắn cuối cùng của cụm (Tin tiếp theo đổi người gửi)
            const showAvatar =
              isThem &&
              (index === messages.length - 1 ||
                nextMsg?.type === "system" ||
                Number(nextMsg?.user_id) !== Number(msg.user_id));

            // Cách cụm tin nhắn ra một khoảng (Margin bottom) nếu sắp đổi người
            const isNewCluster =
              index < messages.length - 1 &&
              (nextMsg?.type === "system" ||
                Number(nextMsg?.user_id) !== Number(msg.user_id));

            const liveAvatarUrl =
              selectConversation?.type !== "group" && partner && partner.avatar
                ? partner.avatar
                : msg.sender?.avatar
                  ? msg.sender.avatar
                  : null;

            const getFallbackLetter = () => {
              if (msg.sender?.first_name) return msg.sender.first_name[0];
              if (selectConversation) {
                if (selectConversation.type === "group") {
                  return selectConversation.label?.[0] || "G";
                } else {
                  const p = selectConversation.participants?.find(
                    (p) => Number(p.id) !== Number(user?.id),
                  );
                  return p?.first_name?.[0] || "U";
                }
              }
              return "U";
            };

            return (
              <div
                key={`msg-${msg.id}-${index}`}
                className={`flex items-end gap-2 group ${!isThem ? "flex-row-reverse" : "flex-row"} ${isNewCluster ? "mb-4" : "mb-0.5"}`}
              >
                {/* AVATAR */}
                {isThem && (
                  <div className="size-8 flex-none mb-1">
                    {showAvatar ? (
                      <div className="size-8 rounded-full bg-primary/10 border border-primary/20 shadow-md flex items-center justify-center text-[10px] text-primary font-bold uppercase overflow-hidden">
                        {liveAvatarUrl ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={liveAvatarUrl}
                              alt="avatar"
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span>{getFallbackLetter()}</span>
                        )}
                      </div>
                    ) : (
                      <div className="size-8" />
                    )}
                  </div>
                )}

                {/* BUBBLE TIN NHẮN */}
                <HasMessage
                  isThem={isThem}
                  msg={msg}
                  messages={messages}
                  selectConversation={selectConversation}
                  showSenderName={showSenderName}
                  setPreviewImage={setPreviewImage}
                  setReplyingTo={setReplyingTo}
                  setChatDeleteMessageId={setChatDeleteMessageId}
                  getFileNameFromUrl={getFileNameFromUrl}
                  setIsVisibleNotificationDeleteMessage={
                    setIsVisibleNotificationDeleteMessage
                  }
                  startEditing={startEditing}
                />
              </div>
            );
          })
        ) : (
          <NonMessage />
        )}

        {/* TRẠNG THÁI ĐÃ XEM / ĐÃ GỬI (Nằm ngay dưới tin nhắn cuối cùng) */}
        {isPrivateChat && isLastMine && (
          <div className="flex justify-end mt-1">
            <span className="text-[10px] text-muted-foreground/80 pr-1 animate-in fade-in duration-200">
              {isSeen ? "Đã xem" : "Đã gửi"}
            </span>
          </div>
        )}

        {/* HIỆU ỨNG TYPING */}
        <AnimatePresence>
          {typingUser && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 text-muted-foreground text-xs italic mt-2"
            >
              <div className="flex bg-secondary/60 rounded-full px-3 py-2 items-center gap-1">
                <span className="size-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="size-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="size-1.5 bg-primary/60 rounded-full animate-bounce"></span>
              </div>
              <span>{typingUser} đang soạn tin...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nút lướt xuống đáy */}
      <AnimatePresence>
        {showScrollDown && (
          <motion.button
            onClick={scrollToBottom}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all z-10 flex items-center justify-center cursor-pointer"
          >
            <ArrowDown className="size-5" />
            {/* 💡 UI SỐ ĐẾM TIN MỚI */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] size-5 flex items-center justify-center rounded-full font-bold border-2 border-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* LIGHTBOX POPUP XEM ẢNH TO */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {previewImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewImage(null)}
                className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 p-4 md:p-10"
              >
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white transition-colors p-2 z-10000 cursor-pointer"
                >
                  <X className="size-8" />
                </button>

                <motion.img
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  src={previewImage}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};

export default FormChatting;
