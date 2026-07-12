"use client";

import {
  Image as ImageIcon,
  Mic,
  PaperclipIcon,
  SendHorizonalIcon,
  ThumbsUp,
  X,
  FileIcon,
  Smile, // 🌟 Thêm con hàng này vào bác ơi
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, useRef, useEffect } from "react"; // Thêm useState

import { useInputRefHook } from "../hooks/useInputRefHook";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConversationStore } from "@/stores/useConversationStore";

interface FormInputProps {
  inputHookData: ReturnType<typeof useInputRefHook>;
  handleSendMessage: (
    content: string,
    parent_id?: number | null,
    type?: string,
  ) => void;
}

// 🌟 MẢNG EMOJI QUỐC DÂN (Native đéo sợ lag)
const COMMON_EMOJIS = ["😀", "😂", "🤣", "🥰", "😎", "🙏", "👍", "🔥", "🎉", "❤️", "💔", "👀", "✨", "💯", "😭", "😡"];

const FormInput = ({ inputHookData, handleSendMessage }: FormInputProps) => {
  const selectConversation = useConversationStore((state) => state.selectConversation);
  const user = useAuthStore((state) => state.user);
  
  // 🌟 State điều khiển đóng mở bảng chọn Emoji
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const {
    inputValue,
    setInputValue, // Móc hàm này ra từ hook để chèn emoji
    replyingTo,
    setReplyingTo,
    handleSend,
    handleKeyDown,
    fileInputRef,
    imageInputRef,
    handleFileChange,
    handlePaste,
    attachments,
    removeAttachment,
    textAreaRef,
    handleTextChange,
    editingMessage,
    cancelEditing,
  } = inputHookData;

  // Click ra ngoài thì tự đóng bảng Emoji
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🌟 HÀM CHÈN EMOJI VÀO TEXTAREA KHÔNG MẤT FOCUS
  const handleSelectEmoji = (emoji: string) => {
    setInputValue((prev) => prev + emoji);
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  };

  const getReplyTargetName = () => {
    if (!replyingTo) return "";
    if (replyingTo.user_id === user?.id) return "chính mình";
    if (replyingTo?.sender?.first_name) return replyingTo.sender.first_name;

    if (selectConversation) {
      if (selectConversation.type === "group") {
        return selectConversation.label || "Nhóm";
      } else {
        const partner = selectConversation.participants?.find((p) => p.id !== user?.id);
        return partner ? partner.full_name || `${partner.last_name} ${partner.first_name}` : "bạn bè";
      }
    }
    return "ai đó";
  };

  const isShowSendButton = inputValue.length > 0 || attachments.length > 0;

  return (
    <div className="flex flex-col bg-background/50 backdrop-blur-sm border-t border-border relative">
      {/* EDITING MESSAGE PREVIEW ... Giữ nguyên của bác ... */}
      {editingMessage && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-primary/10 mx-2 mt-2 rounded-t-xl">
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-primary">📝 Đang chỉnh sửa tin nhắn...</p>
            <p className="text-xs text-muted-foreground line-clamp-1 italic">{editingMessage.content}</p>
          </div>
          <button onClick={cancelEditing} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* REPLY PREVIEW ... Giữ nguyên của bác ... */}
      {replyingTo && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-foreground/5 mx-2 mt-2 rounded-t-xl">
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-primary">Đang trả lời {getReplyTargetName()}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {replyingTo.type === "image" ? "[Hình ảnh]" : replyingTo.type === "file" ? "[Tệp tin]" : replyingTo.content}
            </p>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* ATTACHMENTS PREVIEW ... Giữ nguyên của bác ... */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-3 px-4 pt-3 pb-1 bg-foreground/2 border-b border-border/40 max-h-40 overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {attachments.map((item) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative size-16 rounded-xl border border-border bg-background shadow-sm overflow-hidden group">
                {item.mode === "image" ? (
                  <img src={item.previewUrl} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-secondary/40">
                    <FileIcon className="size-6 text-primary" />
                    <span className="text-[9px] text-muted-foreground text-center truncate w-full px-1 mt-0.5">{item.file.name}</span>
                  </div>
                )}
                <button onClick={() => removeAttachment(item.id)} className="absolute top-0.5 right-0.5 size-4 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer">
                  <X className="size-2.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 🌟 3. KHU VỰC Ô NHẬP LIỆU CHÍNH */}
      <div className="flex items-end gap-2 px-4 py-3 relative">
        <input type="file" ref={fileInputRef} multiple className="hidden" onChange={(e) => handleFileChange(e, "file")} />
        <input type="file" ref={imageInputRef} multiple accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "image")} />

        <button className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-all duration-200">
          <Mic className="size-5" />
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-all duration-200 cursor-pointer">
          <PaperclipIcon className="size-5" />
        </button>
        <button onClick={() => imageInputRef.current?.click()} className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-all duration-200 cursor-pointer">
          <ImageIcon className="size-5" />
        </button>

        {/* 🌟 NÚT SMILE: Bấm để mở/đóng Popover Emoji */}
        <div ref={pickerRef} className="relative">
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
            className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${showEmojiPicker ? 'text-primary bg-secondary' : 'text-muted-foreground hover:text-primary hover:bg-secondary'}`}
          >
            <Smile className="size-5" />
          </button>

          {/* 🌟 BẢNG POPOVER EMOJI CHẠY CO ĐỘNG */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute bottom-12 left-0 bg-popover border border-border p-2.5 rounded-2xl shadow-2xl grid grid-cols-4 gap-1.5 z-50 w-44 backdrop-blur-md"
              >
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSelectEmoji(emoji)}
                    className="size-8 flex items-center justify-center text-lg rounded-xl hover:bg-muted active:scale-90 transition-all cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <textarea
          ref={textAreaRef}
          value={inputValue}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Nhập tin nhắn... (Shift + Enter để xuống dòng)"
          rows={1}
          className="flex-1 bg-secondary text-foreground placeholder:text-muted-foreground outline-none text-sm px-4 py-3 rounded-2xl border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 resize-none overflow-y-auto min-h-11 max-h-35 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none"
        />

        <div className="relative size-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isShowSendButton ? (
              <motion.button key="send" initial={{ scale: 0, rotate: -45, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0, rotate: 45, opacity: 0 }} transition={{ duration: 0.15, ease: "easeOut" }} onClick={handleSend} className="p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-shadow cursor-pointer flex items-center justify-center">
                <SendHorizonalIcon className="size-5" />
              </motion.button>
            ) : (
              <motion.button key="thumbsup" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.15 }} onClick={() => handleSendMessage("👍")} className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center justify-center">
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