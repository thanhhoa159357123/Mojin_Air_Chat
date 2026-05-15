import { IMessage } from "@/types/chat";
import { IFriend } from "@/types/friend";
import {
  Image as ImageIcon,
  Mic,
  PaperclipIcon,
  SendHorizonalIcon,
  ThumbsUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useInputRefHook } from "../hooks/useInputRefHook";
import { useFriendStore } from "@/stores/useFriendStore";
import { useAuthStore } from "@/stores/useAuthStore";

interface FormInputProps {
  replyingTo: IMessage | null;
  setReplyingTo: (msg: IMessage | null) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
  handleSendMessage: (
    friend: IFriend,
    content: string,
    parent_id?: number | null,
    type?: string,
  ) => void;
}

const FormInput = ({
  replyingTo,
  setReplyingTo,
  inputValue,
  setInputValue,
  handleKeyDown,
  onSend,
  handleSendMessage,
}: FormInputProps) => {
  const selectedFriend = useFriendStore((state) => state.selectedFriend);
  const user = useAuthStore((state) => state.user);
  const { fileInputRef, imageInputRef, handleFileChange } = useInputRefHook();

  return (
    <div className="flex flex-col bg-background/50 backdrop-blur-sm border-t border-border">
      {/* REPLY PREVIEW */}
      {replyingTo && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-foreground/5 mx-2 mt-2 rounded-t-xl">
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-primary">
              {replyingTo.user_id === user?.id
                ? "Đang trả lời chính mình"
                : `Đang trả lời ${replyingTo.sender?.first_name || selectedFriend?.first_name || "ai đó"}`}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {replyingTo.type === "image"
                ? "[Hình ảnh]"
                : replyingTo.type === "file"
                  ? "[Tệp tin]"
                  : replyingTo.content}
            </p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* INPUT ẨN CHO FILE VÀ ẢNH */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleFileChange(e, "file")}
        />
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, "image")}
        />

        <button className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-all duration-200">
          <Mic className="size-5" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-all duration-200 cursor-pointer"
        >
          <PaperclipIcon className="size-5" />
        </button>
        <button
          onClick={() => imageInputRef.current?.click()}
          className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-all duration-200 cursor-pointer"
        >
          <ImageIcon className="size-5" />
        </button>

        {/* Ô INPUT ĐƯỢC GẮN STATE */}
        <input
          type="text"
          value={inputValue} // Gắn State
          onChange={(e) => setInputValue(e.target.value)} // Cập nhật State khi gõ
          onKeyDown={handleKeyDown} // Bắt sự kiện Enter
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-secondary text-foreground placeholder:text-muted-foreground outline-none text-sm px-4 py-2 rounded-full border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
        />

        {/* NÚT GỬI - ĐÃ FIX GIỰT */}
        <div className="relative size-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {inputValue.length > 0 ? (
              <motion.button
                key="send"
                // Animation khi xuất hiện
                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                // Animation khi biến mất
                exit={{ scale: 0, rotate: 45, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={onSend}
                className="p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-shadow cursor-pointer flex items-center justify-center"
              >
                <SendHorizonalIcon className="size-5" />
              </motion.button>
            ) : (
              <motion.button
                key="thumbsup"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  // Có thể dùng để gửi nhanh icon Like chẳng hạn
                  handleSendMessage(selectedFriend!, "👍");
                }}
                className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
              >
                <ThumbsUp className="size-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FormInput;
