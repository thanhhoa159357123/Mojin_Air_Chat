"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/utils";
import { IMessage } from "@/types/message";
import { useChatHook } from "@/hooks/useChatHook";
import { useConversationStore } from "@/stores/useConversationStore"; // 💡 RƯỚC VỊ CỨU TINH MỚI VÀO ĐÂY

export interface IAttachmentPreview {
  id: string;
  file: File;
  previewUrl: string;
  mode: "image" | "file";
}

export const useInputRefHook = () => {
  // 🌟 NGUỒN CHÂN LÝ: Lấy trực tiếp cuộc hội thoại đang select từ Store chung
  const selectConversation = useConversationStore(
    (state) => state.selectConversation,
  );

  // Đấu nối selectConversation xịn vào useChatHook để lôi hàm gửi tin nhắn ra
  const { handleSendMessage, handleEditMessage } =
    useChatHook(selectConversation);

  // 💡 1. THÊM REF CHO TEXTAREA ĐỂ ĐIỀU KHIỂN CHIỀU CAO
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [editingMessage, setEditingMessage] = useState<IMessage | null>(null);

  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useState<IMessage | null>(null);
  const [attachments, setAttachments] = useState<IAttachmentPreview[]>([]);

  // 🌟 HÀM UPLOAD QUA CLOUDINARY (GIỮ NGUYÊN HOẠT ĐỘNG HOÀN HẢO)
  const uploadSingleFileToCloudinary = async (item: IAttachmentPreview) => {
    let fileToUpload = item.file;

    if (item.mode === "image") {
      try {
        fileToUpload = await compressImage(item.file, {
          maxWidth: 1920,
          quality: 0.7,
        });
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
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Cloudinary từ chối nhận hàng!");

      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      console.error(`Lỗi upload file ${item.file.name}:`, err);
      return item.previewUrl;
    }
  };

  // 🌟 NÚT BẤM CHỐT HẠ: Khi nhấn Gửi hoặc gõ Enter
  const onSend = async () => {
    const trimmedText = inputValue.trim();
    const hasText = trimmedText.length > 0;
    const hasAttachments = attachments.length > 0;

    // 💡 SỬA CHỖ NÀY: Check theo selectConversation mới tinh
    if ((!hasText && !hasAttachments) || !selectConversation) return;

    const textToSend = trimmedText;

    if (editingMessage) {
      if (!hasText) return; // Không cho phép sửa thành rỗng (muốn rỗng thì thu hồi đi)

      try {
        await handleEditMessage(editingMessage.id, textToSend); // Bắn API sửa

        // Reset lại UI sau khi sửa xong
        setEditingMessage(null);
        setInputValue("");
        if (textAreaRef.current) textAreaRef.current.style.height = "auto";
      } catch (err) {
        console.error("Lỗi sửa tin nhắn:", err);
      }
      return; // 💡 Ngắt luôn luồng, không chạy code gửi mới ở dưới nữa
    }

    const attachmentsToSend = [...attachments];

    setInputValue("");
    setAttachments([]);
    setReplyingTo(null);

    // 💡 2. GỬI XONG THÌ PHẢI ÉP CHIỀU CAO TEXTAREA VỀ LẠI BAN ĐẦU
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
    }

    // 🚀 NHÁNH 1: Nếu CHỈ CÓ TEXT thuần túy
    if (hasText && !hasAttachments) {
      try {
        await handleSendMessage(textToSend, replyingTo?.id || null, "text");
      } catch (err) {
        console.error("Gửi tin nhắn văn bản lỗi:", err);
      }
      return;
    }

    // 🚀 NHÁNH 2: Có đính kèm file (Tin nhắn MIXED vạn năng)
    try {
      const uploadPromises = attachmentsToSend.map((item) =>
        uploadSingleFileToCloudinary(item),
      );
      const uploadedUrls = await Promise.all(uploadPromises);

      const imageUrls: string[] = [];
      const fileUrls: string[] = [];

      attachmentsToSend.forEach((item, index) => {
        if (item.mode === "image") {
          imageUrls.push(uploadedUrls[index]);
        } else {
          fileUrls.push(uploadedUrls[index]);
        }
      });

      const mixedPayload = JSON.stringify({
        text: textToSend,
        images: imageUrls,
        files: fileUrls,
      });

      // Bắn thẳng sang API Laravel với type là 'mixed'
      await handleSendMessage(mixedPayload, replyingTo?.id || null, "mixed");

    } catch (error) {
      console.error("Lỗi gửi tin hỗn hợp:", error);
    }
  };

  // 💡 3. SỬA HÀM LẮNG NGHE BÀN PHÍM
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Nếu bấm Enter MÀ KHÔNG GIỮ phím Shift -> Gửi tin nhắn
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Chặn việc tự động xuống dòng
      onSend();
    }
    // Nếu bấm Shift + Enter -> Trình duyệt tự hiểu là xuống dòng, mình không cần code gì thêm
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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: "image" | "file",
  ) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      addAttachmentToQueue(files[i], mode);
    }
    e.target.value = "";
  };

  // 💡 Đổi type HTMLInputElement -> HTMLTextAreaElement
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
    setInputValue(msg.content || ""); // Bê nội dung cũ quăng vào Input
    setReplyingTo(null); // Đang sửa thì dẹp mẹ cái mode Trả lời đi cho đỡ rối
    if (textAreaRef.current) {
      textAreaRef.current.focus(); // Tự động trỏ nháy chuột vào ô text
    }
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

    editingMessage, // <--- Bơm ra
    startEditing, // <--- Bơm ra
    cancelEditing, // <--- Bơm ra
  };
};
