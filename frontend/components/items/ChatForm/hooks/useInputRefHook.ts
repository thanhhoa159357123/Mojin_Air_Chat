"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/utils";
import { IMessage } from "@/types/message";
import { useChatHook } from "@/hooks/useChatHook";
import { useConversationStore } from "@/stores/useConversationStore";
import { sendTypingSignal } from "@/services/conversationService"; // 💡 NHỚ IMPORT HÀM NÀY

export interface IAttachmentPreview {
  id: string;
  file: File;
  previewUrl: string;
  mode: "image" | "file";
}

export const useInputRefHook = () => {
  const selectConversation = useConversationStore(
    (state) => state.selectConversation,
  );

  const { handleSendMessage, handleEditMessage } =
    useChatHook(selectConversation);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // 🚀 Ổ 1: Ổ KHÓA CHỐNG SPAM TYPING
  const isTypingLockedRef = useRef(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [editingMessage, setEditingMessage] = useState<IMessage | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useState<IMessage | null>(null);
  const [attachments, setAttachments] = useState<IAttachmentPreview[]>([]);

  // ... (Giữ nguyên hàm uploadSingleFileToCloudinary)
  const uploadSingleFileToCloudinary = async (item: IAttachmentPreview) => {
    let fileToUpload = item.file;
    if (item.mode === "image") {
      try {
        fileToUpload = await compressImage(item.file, { maxWidth: 1920, quality: 0.7 });
      } catch (e) {
        console.error("Nén ảnh lỗi, giữ nguyên ảnh gốc", e);
      }
    }
    const formData = new FormData();
    formData.append("file", fileToUpload);
    const CLOUD_NAME = "dcds77ifp";
    const UPLOAD_PRESET = "Mojin_Air_Chat";
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "mojin_air/chat");
    const resourceType = item.mode === "image" ? "image" : "raw";

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
        { method: "POST", body: formData }
      );
      if (!response.ok) throw new Error("Cloudinary lỗi!");
      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      console.error(err);
      return item.previewUrl;
    }
  };

  // ... (Giữ nguyên hàm onSend)
  const onSend = async () => {
    const trimmedText = inputValue.trim();
    const hasText = trimmedText.length > 0;
    const hasAttachments = attachments.length > 0;

    if ((!hasText && !hasAttachments) || !selectConversation) return;

    const textToSend = trimmedText;

    if (editingMessage) {
      if (!hasText) return;
      try {
        await handleEditMessage(editingMessage.id, textToSend);
        setEditingMessage(null);
        setInputValue("");
        if (textAreaRef.current) textAreaRef.current.style.height = "auto";
      } catch (err) {
        console.error(err);
      }
      return;
    }

    const attachmentsToSend = [...attachments];
    setInputValue("");
    setAttachments([]);
    setReplyingTo(null);

    if (textAreaRef.current) textAreaRef.current.style.height = "auto";

    if (hasText && !hasAttachments) {
      try {
        await handleSendMessage(textToSend, replyingTo?.id || null, "text");
      } catch (err) { console.error(err); }
      return;
    }

    try {
      const uploadPromises = attachmentsToSend.map((item) => uploadSingleFileToCloudinary(item));
      const uploadedUrls = await Promise.all(uploadPromises);

      const imageUrls: string[] = [];
      const fileUrls: string[] = [];

      attachmentsToSend.forEach((item, index) => {
        if (item.mode === "image") imageUrls.push(uploadedUrls[index]);
        else fileUrls.push(uploadedUrls[index]);
      });

      const mixedPayload = JSON.stringify({
        text: textToSend,
        images: imageUrls,
        files: fileUrls,
      });

      await handleSendMessage(mixedPayload, replyingTo?.id || null, "mixed");
    } catch (error) {
      console.error(error);
    }
  };

  // 🚀 LOGIC XỬ LÝ TEXT + KHÓA TYPING
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;

    // Nếu đang có phòng chat và van typing CHƯA BỊ KHÓA
    if (selectConversation?.id && !isTypingLockedRef.current) {
      isTypingLockedRef.current = true; // Sập van khóa ngay lập tức!
      
      // Nã API 1 phát duy nhất
      sendTypingSignal(selectConversation.id).catch(() => {});

      // Bấm giờ 3 giây sau mới mở van ra cho gõ tiếp
      setTimeout(() => {
        isTypingLockedRef.current = false;
      }, 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const addAttachmentToQueue = (file: File, mode: "image" | "file") => {
    const newAttachment: IAttachmentPreview = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      mode,
    };
    setAttachments((prev) => [...prev, newAttachment]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, mode: "image" | "file") => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) addAttachmentToQueue(files[i], mode);
    e.target.value = "";
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          addAttachmentToQueue(file, "image");
        }
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const startEditing = (msg: IMessage) => {
    setEditingMessage(msg);
    setInputValue(msg.content || "");
    setReplyingTo(null);
    if (textAreaRef.current) textAreaRef.current.focus();
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setInputValue("");
    if (textAreaRef.current) textAreaRef.current.style.height = "auto";
  };

  return {
    inputValue,
    setInputValue,
    replyingTo,
    attachments,
    handleSend: onSend,
    setReplyingTo,
    handleKeyDown,
    fileInputRef,
    imageInputRef,
    handleFileChange,
    handlePaste,
    removeAttachment,
    textAreaRef,
    handleTextChange, // 💡 NÉM HÀM MỚI NÀY RA CHO FORM INPUT DÙNG
    editingMessage,
    startEditing,
    cancelEditing,
  };
};