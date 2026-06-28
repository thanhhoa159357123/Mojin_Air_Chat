/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query"; // 💡 THẦN KHÍ MỚI
import { useAuthStore } from "@/stores/useAuthStore";
import { IMessage } from "@/types/message";
import { useChats } from "@/hooks/useChats";
import { useConversationStore } from "@/stores/useConversationStore";
import { sendTypingSignal } from "@/services/conversationService";
import { toast } from "sonner";

export interface IAttachmentPreview {
  id: string;
  file: File;
  previewUrl: string;
  mode: "image" | "file";
}

export const useInputRefHook = () => {
  const user = useAuthStore((state) => state.user);
  const selectConversation = useConversationStore(
    (state) => state.selectConversation,
  );

  const queryClient = useQueryClient(); // 💡 Khởi tạo QueryClient để chọc vào Cache

  // 💡 LẤY SÚNG TỪ KHO VŨ KHÍ MỚI
  const { handleSendMessage, handleEditMessage } = useChats(selectConversation);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const isTypingLockedRef = useRef(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [editingMessage, setEditingMessage] = useState<IMessage | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useState<IMessage | null>(null);

  const [attachments, setAttachments] = useState<IAttachmentPreview[]>([]);

  // 1. HÀM LÕI: UPLOAD LÊN CLOUDINARY
  const uploadSingleFileToCloudinary = async (item: IAttachmentPreview) => {
    const fileToUpload = item.file;
    const formData = new FormData();
    formData.append("file", fileToUpload);

    const CLOUD_NAME = "dcds77ifp";
    const UPLOAD_PRESET = "Mojin_Air_Chat";

    formData.append("upload_preset", UPLOAD_PRESET);
    const folderPath =
      item.mode === "image" ? "mojin_air/chat" : "mojin_air/file";
    formData.append("folder", folderPath);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        { method: "POST", body: formData },
      );

      if (!response.ok) throw new Error("Cloudinary lỗi!");
      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // 🚀 2. LUỒNG BẮN TỈA: XỬ LÝ FILE ĐỘC LẬP
  const processDirectFileUploads = async (files: FileList) => {
    if (!selectConversation) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > 25 * 1024 * 1024) {
        toast.error(`Tệp "${file.name}" quá lớn. Vui lòng gửi file dưới 25MB!`);
        continue;
      }

      const tempItem: IAttachmentPreview = {
        id: `file_${Date.now()}_${i}`,
        file,
        previewUrl: "",
        mode: "file",
      };

      try {
        const uploadedUrl = await uploadSingleFileToCloudinary(tempItem);
        const filePayload = JSON.stringify({
          text: "",
          images: [],
          files: [{ url: uploadedUrl, name: file.name }],
        });

        // Gọi hàm của TanStack Query
        await handleSendMessage(filePayload, replyingTo?.id || null, "mixed");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error(`Lỗi khi gửi tệp: ${file.name}`);
      }
    }
  };

  // 🚀 3. LUỒNG HÀNG CHỜ: XỬ LÝ ẢNH
  const processImageToQueue = (files: FileList) => {
    const newAttachments: IAttachmentPreview[] = [];
    for (let i = 0; i < files.length; i++) {
      newAttachments.push({
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file: files[i],
        previewUrl: URL.createObjectURL(files[i]),
        mode: "image",
      });
    }
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: "image" | "file",
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (mode === "file") {
      processDirectFileUploads(files);
    } else {
      processImageToQueue(files);
    }
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
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          processImageToQueue(dataTransfer.files);
        }
      }
    }
  };

  // 🚀 6. HÀM GỬI LÕI: GỬI TEXT VÀ HÀNG CHỜ ẢNH
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

    setInputValue("");
    setAttachments([]);
    setReplyingTo(null);
    if (textAreaRef.current) textAreaRef.current.style.height = "auto";

    // Trường hợp 1: Chỉ gửi Text
    if (hasText && !hasAttachments) {
      try {
        await handleSendMessage(textToSend, replyingTo?.id || null, "text");
      } catch (err) {
        console.error(err);
      }
      return;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;

    if (selectConversation?.id && !isTypingLockedRef.current) {
      isTypingLockedRef.current = true;
      sendTypingSignal(selectConversation.id).catch(() => {});
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
    handleTextChange,
    editingMessage,
    startEditing,
    cancelEditing,
  };
};
