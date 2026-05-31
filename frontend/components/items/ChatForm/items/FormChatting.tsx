"use client";

import { IMessage } from "@/types/message";
import { ArrowDown, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import NonMessage from "./message/NonMessage";
import HasMessage from "./message/HasMessage";
import { useChatRefHook } from "../hooks/useChatRefHook";
import { getFileNameFromUrl } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useChatFormHook } from "../hooks/useChatFormHook";
import { IConversation } from "@/types/conversation";

interface FormChattingProps {
  selectConversation: IConversation | null; // 💡 NHẬN SELECT CONVERSATION TỪ CHA
  setReplyingTo: (msg: IMessage | null) => void;
  setChatDeleteMessageId: (id: number | null) => void;
  setIsVisibleNotificationDeleteMessage: (visible: boolean) => void;
}

const FormChatting = ({
  setReplyingTo,
  setChatDeleteMessageId,
  setIsVisibleNotificationDeleteMessage,
  selectConversation,
}: FormChattingProps) => {
  const { typingUser } = useChatFormHook();
  const user = useAuthStore((state) => state.user); // 💡 LẤY THÊM STATE TỪ STORE
  const { messages, hasMore, loadingMore, page, fetchMessages } =
    useChatStore();

  const handleLoadMore = () => {
    if (selectConversation && hasMore && !loadingMore) {
      fetchMessages(
        selectConversation.id,
        selectConversation.type,
        page + 1,
        !!selectConversation.is_virtual,
      );
    }
  };

  const { containerRef, showScrollDown, handleScroll, scrollToBottom } =
    useChatRefHook(
      messages,
      selectConversation?.id,
      handleLoadMore,
      hasMore,
      loadingMore,
    );

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;
  const isLastMine =
    !!lastMessage &&
    lastMessage.user_id === user?.id &&
    lastMessage.type !== "system";
  const isPrivateChat = selectConversation?.type === "private";
  const partnerLastReadAt =
    selectConversation?.participants?.find((p) => p.id !== user?.id)?.pivot
      ?.last_read_at || null;
  const isSeen =
    !!lastMessage &&
    !!partnerLastReadAt &&
    new Date(partnerLastReadAt).getTime() >=
      new Date(lastMessage.created_at).getTime();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="flex-1 relative min-h-0 bg-background">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto p-4 space-y-2"
      >
        {/* 🌟 SPINNER BAY LƠ LỬNG TRÊN CÙNG ĐỂ KHÔNG LÀM SAI SỐ SCROLL HEIGHT */}
        {loadingMore && (
          <div className="absolute top-2 left-0 w-full flex justify-center z-10 pointer-events-none">
            <div className="bg-background/80 p-1.5 rounded-full shadow-sm border border-border">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          </div>
        )}
        {messages.length > 0 ? (
          /* 1. TRƯỜNG HỢP CÓ TIN NHẮN: MAP RA UI */
          messages.map((msg, index) => {
            if (msg.type === "system") {
              return (
                <div
                  key={msg.id}
                  className="w-full flex justify-center my-4 animate-in fade-in zoom-in-95 duration-300"
                >
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[11px] font-medium text-primary tracking-wide shadow-sm max-w-[80%] text-center">
                    <span>✨</span>
                    <span className="leading-relaxed">{msg.content}</span>
                  </div>
                </div>
              );
            }

            const isThem = msg.user_id !== user?.id;

            const showAvatar =
              isThem &&
              (index === messages.length - 1 ||
                messages[index + 1].user_id !== msg.user_id);

            const isNewCluster =
              index < messages.length - 1 &&
              messages[index + 1].user_id !== msg.user_id;

            const showSenderName =
              isThem &&
              (index === 0 || messages[index - 1].user_id !== msg.user_id);

            // 💡 HÀM LẤY CHỮ CÁI ĐẠI DIỆN FIX CHUẨN THEO CONVERSATION
            const getFallbackLetter = () => {
              if (msg.sender?.first_name) return msg.sender.first_name[0];
              if (selectConversation) {
                if (selectConversation.type === "group") {
                  return selectConversation.label?.[0] || "G";
                } else {
                  const partner = selectConversation.participants?.find(
                    (p) => p.id !== user?.id,
                  );
                  return partner?.first_name?.[0] || "U";
                }
              }
              return "U";
            };

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 group ${!isThem ? "flex-row-reverse" : "flex-row"} ${isNewCluster ? "mb-4" : "mb-0.5"}`}
              >
                {/* AVATAR */}
                {isThem && (
                  <div className="size-8 flex-none">
                    {showAvatar ? (
                      <div className="size-8 rounded-full bg-primary shadow-sm flex items-center justify-center text-[10px] text-primary-foreground uppercase mb-1">
                        {getFallbackLetter()}
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
                  selectConversation={selectConversation} // 💡 UPDATE ĐỔI SANG TRUYỀN SELECT CONVERSATION XỊN
                  showSenderName={showSenderName}
                  setPreviewImage={setPreviewImage}
                  setReplyingTo={setReplyingTo}
                  setChatDeleteMessageId={setChatDeleteMessageId}
                  getFileNameFromUrl={getFileNameFromUrl}
                  setIsVisibleNotificationDeleteMessage={
                    setIsVisibleNotificationDeleteMessage
                  }
                />
              </div>
            );
          })
        ) : (
          /* 2. TRƯỜNG HỢP TRỐNG: HIỆN LỜI CHÀO */
          <NonMessage />
        )}

        {isPrivateChat && isLastMine && (
          <div className="flex justify-end mt-1">
            <span className="text-[10px] text-muted-foreground/80 pr-1">
              {isSeen ? "Đã xem" : "Đã gửi"}
            </span>
          </div>
        )}

        {/* 💡 HIỆU ỨNG TYPING NẰM ĐÂY */}
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
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all z-10 flex items-center justify-center cursor-pointer"
          >
            <ArrowDown className="size-5" />
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
