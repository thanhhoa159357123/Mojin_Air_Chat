import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase"; // Nhớ import con hàng này
import { compressImage } from "@/lib/utils"; // Hàm nén ảnh
import { useFriendHook } from "@/hooks/useFriendHook";
import { IMessage } from "@/types/chat";
import { useChatHook } from "@/hooks/useChatHook";

export const useInputRefHook = () => {
  const { selectedFriend } = useFriendHook();
  const { handleSendMessage } = useChatHook(selectedFriend);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // THÊM STATE ĐỂ LƯU NỘI DUNG Ô NHẬP LIỆU
  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useState<IMessage | null>(null);

  // Hàm xử lý khi bấm nút Gửi (hoặc bấm Enter)
  const onSend = () => {
    if (!inputValue.trim() || !selectedFriend) return;

    handleSendMessage(selectedFriend, inputValue, replyingTo?.id || null); // Gọi hàm gửi tin nhắn
    setInputValue(""); // Xóa trắng ô input sau khi gửi
    setReplyingTo(null); // Reset trạng thái reply
  };

  // Hàm để xử lý khi người dùng ấn phím trên ô input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSend();
    }
  };

  // HÀM XỬ LÝ UPLOAD (TRÍ MẠNG ĐÂY BÁC)
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: "image" | "file",
  ) => {
    let file = e.target.files?.[0];
    if (!file || !selectedFriend) return;

    try {
      if (mode === "image") {
        toast.loading("Đang nén ảnh để gửi nhanh hơn...");
        file = await compressImage(file, { maxWidth: 1920, quality: 0.7 });
        toast.dismiss();
      }

      const bucket = mode === "image" ? "image" : "files"; // Đảm bảo bucket là file (đổi lại files nếu bác lấy bucket gốc là files)

      // Bỏ khoảng trắng để URL k bị dính %20 dài ngoằng, dùng ___ làm mốc tách tên gốc
      const fileName = `${Date.now()}___${file.name.replace(/\s+/g, "_")}`;

      // Ảnh thì cho thẳng vào folder image_chat, file tài liệu thì để ngoài cùng của bucket file
      const filePath = mode === "image" ? `image_chat/${fileName}` : fileName;

      toast.loading(`Đang gửi ${mode === "image" ? "ảnh" : "tài liệu"}...`);

      // 1. Phóng lên Supabase
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Lấy link Public
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

      // 3. Báo cáo về Laravel thôi bác!
      await handleSendMessage(
        selectedFriend,
        data.publicUrl,
        replyingTo?.id,
        mode,
      );

      toast.dismiss();
      toast.success("Đã gửi thành công!");
    } catch (error) {
      toast.dismiss();
      toast.error("Toang rồi, upload thất bại!");
      console.error(error);
    } finally {
      // Reset input để lần sau chọn lại file đó vẫn trigger
      e.target.value = "";
    }
  };

  return {
    inputValue,
    setInputValue,
    replyingTo,
    handleSend: onSend,
    setReplyingTo,
    handleKeyDown,
    fileInputRef,
    imageInputRef,
    handleFileChange,
  };
};
