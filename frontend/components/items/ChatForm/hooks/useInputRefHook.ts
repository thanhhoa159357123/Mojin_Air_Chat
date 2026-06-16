"use client";

import { useRef, useState } from "react";
import { useChatStore } from "@/stores/useChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { IMessage } from "@/types/message";
import { useChatHook } from "@/hooks/useChatHook";
import { useConversationStore } from "@/stores/useConversationStore";
import { sendTypingSignal } from "@/services/conversationService";
import { toast } from "sonner"; // 💡 Nhớ import sonner hoặc thư viện toast của bác để báo lỗi file nặng

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

  const { handleSendMessage, handleEditMessage } =
    useChatHook(selectConversation);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const isTypingLockedRef = useRef(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [editingMessage, setEditingMessage] = useState<IMessage | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useState<IMessage | null>(null);

  // 💡 Hàng chờ BÂY GIỜ CHỈ DÀNH CHO ẢNH (Vì file nó bắn đi luôn rồi đéo bao giờ vào đây)
  const [attachments, setAttachments] = useState<IAttachmentPreview[]>([]);

  // 1. HÀM LÕI: UPLOAD LÊN CLOUDINARY
  const uploadSingleFileToCloudinary = async (item: IAttachmentPreview) => {
    const fileToUpload = item.file;

    // if (item.mode === "image") {
    //   try {
    //     fileToUpload = await compressImage(item.file, {
    //       maxWidth: 1920,
    //       quality: 0.7,
    //     });
    //   } catch (e) {
    //     console.error("Nén ảnh lỗi, giữ nguyên ảnh gốc", e);
    //   }
    // }

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

  // 🚀 2. LUỒNG BẮN TỈA: XỬ LÝ FILE ĐỘC LẬP (Không vào hàng chờ)
  const processDirectFileUploads = async (files: FileList) => {
    if (!selectConversation) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validator: Giới hạn 25MB cho file thô
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
        // Tải thẳng lên Cloudinary
        const uploadedUrl = await uploadSingleFileToCloudinary(tempItem);

        // Đóng gói Payload CHỈ CHỨA MỘT FILE DUY NHẤT, ĐÉO CÓ TEXT, ĐÉO CÓ ẢNH
        const filePayload = JSON.stringify({
          text: "",
          images: [],
          files: [{ url: uploadedUrl, name: file.name }],
        });

        // Bắn lên Backend tạo tin nhắn luôn!
        await handleSendMessage(filePayload, replyingTo?.id || null, "mixed");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error(`Lỗi khi gửi tệp: ${file.name}`);
      }
    }
  };

  // 🚀 3. LUỒNG HÀNG CHỜ: XỬ LÝ ẢNH (Nạp vào Preview UI)
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

  // 🎯 4. HÀM CHIA LUỒNG KHI CHỌN FILE/ẢNH
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: "image" | "file",
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (mode === "file") {
      // Nếu là FILE -> GỌI HÀM BẮN TỈA TRỰC TIẾP
      processDirectFileUploads(files);
    } else {
      // Nếu là ẢNH -> GỌI HÀM NẠP HÀNG CHỜ
      processImageToQueue(files);
    }

    e.target.value = ""; // Reset input
  };

  // 🎯 5. XỬ LÝ SỰ KIỆN PASTE TỪ BÀN PHÍM (Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          // Paste ảnh thì nhét vào Queue
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          processImageToQueue(dataTransfer.files);
        }
      }
      // Khúc này nếu mốt bác muốn cho user Copy/Paste Cả file Excel từ desktop vào thì bác có thể mở rộng đoạn này gọi processDirectFileUploads. Hiện tại cứ ưu tiên ảnh.
    }
  };

  // 🚀 6. HÀM GỬI LÕI: GỬI TEXT VÀ HÀNG CHỜ ẢNH
  const onSend = async () => {
    const trimmedText = inputValue.trim();
    const hasText = trimmedText.length > 0;
    const hasAttachments = attachments.length > 0; // Lúc này attachments CHỈ TOÀN LÀ ẢNH

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

    // Sao chép và dọn dẹp UI
    const imagesToSend = [...attachments];
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

    // Trường hợp 2: Có kèm ẢNH (Text + Ảnh)
    const tempId = Date.now(); // Tạo ID ảo
    const previewUrls = imagesToSend.map((item) => item.previewUrl);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fakeMessage: any = {
      id: tempId,
      conversation_id: selectConversation.id,
      user_id: user?.id,
      type: "mixed",
      content: JSON.stringify({
        text: textToSend,
        images: previewUrls,
        files: [],
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      edit_count: 0,
      sender: user,
      isSending: true, // 💡 Cờ đánh dấu đây là hàng Fake đang tải!
    };

    // 🚀 BƯỚC 2: BƠM THẲNG LÊN MÀN HÌNH KHUNG CHAT TRONG 0ms
    useChatStore.setState((state) => ({
      messages: [...state.messages, fakeMessage],
    }));

    try {
      // 🚀 BƯỚC 3: ÂM THẦM UP CLOUDINARY DƯỚI NỀN
      const uploadPromises = imagesToSend.map((item) =>
        uploadSingleFileToCloudinary(item),
      );
      const imageUrls = await Promise.all(uploadPromises);

      const mixedPayload = JSON.stringify({
        text: textToSend,
        images: imageUrls,
        files: [],
      });

      // Gọi API thật
      await handleSendMessage(mixedPayload, replyingTo?.id || null, "mixed");

      // 🚀 BƯỚC 4: API GỌI THÀNH CÔNG -> XOÁ TIN NHẮN ẢO ĐI
      // (Vì Pusher và API nó sẽ tự đẻ ra cái tin nhắn thật đập vào Store rồi)
      useChatStore.setState((state) => ({
        messages: state.messages.filter((m) => m.id !== tempId),
      }));
    } catch (error) {
      console.error("Lỗi gửi tin nhắn chứa ảnh:", error);

      // Lỗi mạng/Cloudinary? Biến cái tin nhắn ảo thành tin nhắn Lỗi (Màu đỏ cho user bấm thử lại)
      useChatStore.setState((state) => ({
        messages: state.messages.map((m) =>
          m.id === tempId ? { ...m, isSending: false, isError: true } : m,
        ),
      }));
    }
  };

  // ... Đống handleTextChange, removeAttachment, startEditing giữ nguyên y như cũ

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
