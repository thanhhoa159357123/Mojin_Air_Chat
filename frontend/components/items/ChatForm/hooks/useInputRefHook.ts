/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import { IMessage } from "@/types/message";
import { useChats } from "@/hooks/useChats";
import { useConversationStore } from "@/stores/useConversationStore";
import { sendTypingSignal } from "@/services/conversationService";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";

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

  // 💡 LẤY SÚNG TỪ KHO VŨ KHÍ MỚI
  const { handleSendMessage, handleEditMessage } = useChats(selectConversation);
  const queryClient = useQueryClient();

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

    // 💡 LƯU LẠI GIÁ TRỊ TRƯỚC KHI RESET UI ĐỂ TRÁNH MẤT DATA
    const currentReplyingTo = replyingTo?.id || null;

    // Reset UI ngay lập tức cho mượt (Optimistic UI)
    setInputValue("");
    setAttachments([]);
    setReplyingTo(null);
    if (textAreaRef.current) textAreaRef.current.style.height = "auto";

    // 🎯 TRƯỜNG HỢP 1: CHỈ GỬI TEXT
    if (hasText && !hasAttachments) {
      try {
        await handleSendMessage(textToSend, currentReplyingTo, "text");
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // 🎯 TRƯỜNG HỢP 2: CÓ HÀNG CHỜ ẢNH (KÈM HOẶC KHÔNG KÈM TEXT)
    if (hasAttachments) {
      // 1. Găm lại đống ảnh trong hàng chờ và text để xử lý ngầm
      const currentAttachments = [...attachments];
      const currentReplyingTo = replyingTo?.id || null;

      // 2. Reset UI bên ngoài lập tức cho User sướng mắt
      setInputValue("");
      setAttachments([]);
      setReplyingTo(null);
      if (textAreaRef.current) textAreaRef.current.style.height = "auto";

      // 3. 🚨 BÍ THUẬT: Đẻ ngay một cục Payload Fake chứa Blob URL để nhét vào UI lập tức
      const localImageUrls = currentAttachments.map((item) => item.previewUrl);
      const optimisticPayload = JSON.stringify({
        text: textToSend,
        images: localImageUrls, // Dùng ảnh Blob RAM hiện lên UI luôn!
        files: [],
      });

      // 4. Tạo một ID tạm thời âm bản để lát nữa Backend trả về ta tìm đúng đứa này ta đè lên
      const optimisticMsgId = `fake_msg_${Date.now()}`;

      // 5. Nạp thẳng cục Fake này vào Cache TanStack Query (Optimistic Update)
      const queryKey = ["messages", selectConversation?.id];

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        // Bơm cục tin nhắn fake vào cuối mảng tin nhắn
        const fakeMessage: IMessage = {
          id: optimisticMsgId as any,
          user_id: useAuthStore.getState().user?.id || 0,
          content: optimisticPayload,
          type: "mixed",
          parent_id: currentReplyingTo,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          edit_count: 0,
          isSending: true, // Bật cờ thông báo đang xoay vòng loading
        } as any;

        return {
          ...old,
          pages: old.pages.map((page: any, index: number) => {
            // Vì tin nhắn mới nằm ở cuối mảng, nếu là page cuối (hoặc page đầu tùy cấu hình của bác)
            // Ta push vào data tin nhắn
            if (index === 0) {
              // Thường page đầu tiên chứa tin mới nhất
              return { ...page, data: [...page.data, fakeMessage] };
            }
            return page;
          }),
        };
      });

      // 6. 🔥 CHẠY NGẦM BACKGROUND: Upload lên Cloudinary và bắn API thật
      (async () => {
        try {
          // Chạy upload ngầm
          const uploadPromises = currentAttachments.map((item) =>
            uploadSingleFileToCloudinary(item),
          );
          const uploadedUrls = await Promise.all(uploadPromises);

          const realPayload = JSON.stringify({
            text: textToSend,
            images: uploadedUrls, // URL xịn từ Cloudinary
            files: [],
          });

          // Bắn API thật lên server
          await handleSendMessage(realPayload, currentReplyingTo, "mixed");

          // 7. Xóa cụ nó cái cục tin nhắn Fake đi sau khi API thật chạy xong thành công
          // (Vì Pusher/Socket hoặc data trả về của query sẽ tự cập nhật ảnh xịn vào)
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                data: page.data.filter(
                  (m: any) => m.id !== (optimisticMsgId as any),
                ),
              })),
            };
          });
        } catch (error) {
          console.error("Lỗi upload ảnh ngầm:", error);

          // Nếu toang, chuyển trạng thái cục fake thành lỗi để user bấm gửi lại
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                data: page.data.map((m: any) =>
                  m.id === (optimisticMsgId as any)
                    ? { ...m, isSending: false, isError: true }
                    : m,
                ),
              })),
            };
          });
        }
      })();

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
