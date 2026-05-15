import { IMessage } from "@/types/chat";
import { ArrowDown, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import NonMessage from "./message/NonMessage";
import HasMessage from "./message/HasMessage";
import { useRefHook } from "../hooks/useChatRefHook";
import { getFileNameFromUrl } from "@/lib/utils";
import { useFriendStore } from "@/stores/useFriendStore";
import { useAuthStore } from "@/stores/useAuthStore";

interface FormChattingProps {
  messages: IMessage[];
  setReplyingTo: (msg: IMessage | null) => void;
  setChatDeleteMessageId: (id: number | null) => void;
  setIsVisibleNotificationDeleteMessage: (visible: boolean) => void;
}

const FormChatting = ({
  messages,
  setReplyingTo,
  setChatDeleteMessageId,
  setIsVisibleNotificationDeleteMessage,
}: FormChattingProps) => {
  const selectedFriend = useFriendStore((state) => state.selectedFriend);
  const user = useAuthStore((state) => state.user);
  const {
    scrollRef,
    containerRef,
    showScrollDown,
    handleScroll,
    scrollToBottom,
  } = useRefHook();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="flex-1 relative min-h-0 bg-background">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto p-4 space-y-1 scroll-smooth"
      >
        {messages.length > 0 ? (
          /* 1. TRƯỜNG HỢP CÓ TIN NHẮN: MAP RA UI */
          messages.map((msg, index) => {
            const isThem = msg.user_id !== user?.id; // Tin nhắn không phải của mình thì là của người khác
            const showAvatar =
              isThem &&
              (index === messages.length - 1 ||
                messages[index + 1].user_id !== msg.user_id); // Hiện avatar nếu là tin cuối cùng của người đó trong 1 cụm

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 group ${!isThem ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* AVATAR */}
                {isThem && (
                  <div className="size-8 flex-none">
                    {showAvatar ? (
                      <div className="size-8 rounded-full bg-primary shadow-sm flex items-center justify-center text-[10px] text-primary-foreground uppercase mb-1">
                        {msg.sender
                          ? `${msg.sender.first_name?.[0] || ""}${msg.sender.last_name?.[0] || ""}`
                          : selectedFriend?.first_name?.[0] || ""}
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
                  selectedFriend={selectedFriend}
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
        <div ref={scrollRef} />
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

      {/* LỚP MÀN POPUP (LIGHTBOX) ĐỂ XEM ẢNH TO - DÙNG PORTAL ĐỂ HIỆN TOÀN MÀN HÌNH TÁCH KHỎI CHATFORM */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {previewImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewImage(null)} // Click ra ngoài để đóng
                className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 p-4 md:p-10"
              >
                {/* Nút X Góc phải trên */}
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white transition-colors p-2 z-10000 cursor-pointer"
                >
                  <X className="size-8" />
                </button>

                {/* Ảnh bành bự lên */}
                <motion.img
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  src={previewImage}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                  onClick={(e) => e.stopPropagation()} // Click vào ảnh thì không bị đóng
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
