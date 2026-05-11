"use client";

import { IMessage } from "@/types/chat";
import { IFriend } from "@/types/friend";
import {
  Image,
  Menu,
  Mic,
  MoreVertical,
  PaperclipIcon,
  Phone,
  Reply,
  SendHorizonalIcon,
  Smile,
  Trash2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ChatFormProps {
  onToggleOption: () => void;
  selectedFriend: IFriend | null; // Thêm prop này để nhận bạn bè đang được chọn từ parent component
  messages: IMessage[]; // Thêm prop này để nhận tin nhắn từ parent component
  setChatDeleteMessageId: (messageId: number | null) => void; // Thêm prop này để set ID tin nhắn cần xoá lên parent component
  handleSendMessage: (friend: IFriend, content: string) => void; // Thêm prop này để gửi tin nhắn từ parent component
  setIsVisibleNotificationDeleteMessage: (visible: boolean) => void; // Thêm prop này để điều khiển hiển thị thông báo xoá tin nhắn
}

const ChatForm = ({
  onToggleOption,
  selectedFriend,
  messages,
  setChatDeleteMessageId,
  handleSendMessage,
  setIsVisibleNotificationDeleteMessage,
}: ChatFormProps) => {
  // THÊM STATE ĐỂ LƯU NỘI DUNG Ô NHẬP LIỆU
  const [inputValue, setInputValue] = useState("");

  // 1. Tạo một cái "mỏ neo" ở cuối danh sách tin nhắn
  const scrollRef = useRef<HTMLDivElement>(null);

  // 2. Mỗi khi mảng messages thay đổi, cuộn xuống cái mỏ neo đó
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Hàm xử lý khi bấm nút Gửi (hoặc bấm Enter)
  const onSend = () => {
    if (!inputValue.trim() || !selectedFriend) return;

    handleSendMessage(selectedFriend, inputValue); // Gọi hàm gửi tin nhắn
    setInputValue(""); // Xóa trắng ô input sau khi gửi
  };

  // Hàm để xử lý khi người dùng ấn phím trên ô input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSend();
    }
  };
  return (
    <div className="flex flex-col h-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-sage/20 dark:border-sage/10">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-linear-to-r from-white/80 to-sage-lighter/50 dark:from-gray-800/80 dark:to-forest-lighter/20 backdrop-blur-md border-b border-sage/20 dark:border-sage/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-10 rounded-full bg-linear-to-br from-forest to-matcha shadow-lg" />
            <span className="absolute bottom-0 right-0 size-3 bg-matcha rounded-full ring-2 ring-white dark:ring-gray-800"></span>
          </div>
          <div>
            <span className="font-semibold text-forest dark:text-matcha-light">
              {selectedFriend ? selectedFriend.full_name : "Chọn một bạn bè"}
            </span>
            <span className="text-xs text-sage dark:text-sage-light block">
              Đang hoạt động
            </span>
          </div>
        </div>
        <div className="flex gap-4 text-forest/60 dark:text-matcha/60">
          <Phone className="size-4 cursor-pointer hover:text-matcha dark:hover:text-mint transition-all duration-200" />
          <Menu
            onClick={onToggleOption}
            className="size-4 cursor-pointer hover:text-matcha dark:hover:text-mint transition-all duration-200"
          />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-linear-to-b from-transparent to-sage-lighter/10 dark:to-forest-lighter/5">
        {messages.map((msg, index) => {
          const isThem = selectedFriend && msg.user_id === selectedFriend.id;
          const showAvatar =
            isThem &&
            (index === messages.length - 1 ||
              messages[index + 1].user_id !== selectedFriend.id);

          return (
            <div
              key={msg.id}
              /* Group ở đây để con nhận biết trạng thái hover của cha */
              className={`flex items-end gap-2 group ${!isThem ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* 1. AVATAR */}
              {isThem && (
                <div className="size-8 flex-none">
                  {showAvatar ? (
                    <div className="size-8 rounded-full bg-linear-to-br from-forest to-matcha shadow-sm flex items-center justify-center text-[10px] text-white uppercase mb-1">
                      {selectedFriend?.first_name?.[0]}
                      {selectedFriend?.last_name?.[0]}
                    </div>
                  ) : (
                    /* Giữ chỗ cho avatar của họ để các dòng tin nhắn của họ thẳng hàng */
                    <div className="size-8" />
                  )}
                </div>
              )}

              {/* Cục này bác muốn fix lại đây */}
              <div
                className={`flex items-center gap-2 max-w-[85%] ${!isThem ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* 2. NỘI DUNG TIN NHẮN */}
                <div
                  className={`relative px-4 py-2 rounded-2xl shadow-sm transition-all duration-200 ${
                    !isThem
                      ? "bg-linear-to-r from-forest to-matcha text-white rounded-br-sm"
                      : "bg-white/80 dark:bg-gray-800/80 text-forest dark:text-matcha-light rounded-bl-sm border border-sage/20 dark:border-sage/10"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>

                {/* 3. DÀN ICON ACTION (NẰM NGANG HÀNG VỚI TIN NHẮN) */}
                <div
                  className={`flex items-center gap-0.5 invisible group-hover:visible transition-all duration-200 text-sage/60 dark:text-sage/40 shrink-0 ${
                    !isThem ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <button className="p-1 hover:bg-sage-lighter dark:hover:bg-gray-800 rounded-full transition-colors">
                    <Smile className="size-4" />
                  </button>
                  <button className="p-1 hover:bg-sage-lighter dark:hover:bg-gray-800 rounded-full transition-colors">
                    <Reply className="size-4" />
                  </button>
                  <button
                    onClick={() => {
                      setChatDeleteMessageId(msg.id); // Set ID tin nhắn cần xoá lên parent component
                      setIsVisibleNotificationDeleteMessage(true);
                    }}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-full transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Form */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-sage/20 dark:border-sage/10">
        <button className="p-2 rounded-full text-sage dark:text-matcha-light hover:text-matcha dark:hover:text-mint hover:bg-sage-lighter/50 dark:hover:bg-sage/10 transition-all duration-200">
          <Mic className="size-5" />
        </button>
        <button className="p-2 rounded-full text-sage dark:text-matcha-light hover:text-matcha dark:hover:text-mint hover:bg-sage-lighter/50 dark:hover:bg-sage/10 transition-all duration-200">
          <PaperclipIcon className="size-5" />
        </button>
        <button className="p-2 rounded-full text-sage dark:text-matcha-light hover:text-matcha dark:hover:text-mint hover:bg-sage-lighter/50 dark:hover:bg-sage/10 transition-all duration-200">
          <Image className="size-5" />
        </button>

        {/* Ô INPUT ĐƯỢC GẮN STATE */}
        <input
          type="text"
          value={inputValue} // Gắn State
          onChange={(e) => setInputValue(e.target.value)} // Cập nhật State khi gõ
          onKeyDown={handleKeyDown} // Bắt sự kiện Enter
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-sage-lighter/50 dark:bg-gray-700/50 text-forest dark:text-matcha-light placeholder:text-sage/60 dark:placeholder:text-sage/40 outline-none text-sm px-4 py-2 rounded-full border border-sage/30 dark:border-sage/20 focus:border-matcha dark:focus:border-mint focus:ring-1 focus:ring-matcha dark:focus:ring-mint transition-all duration-200"
        />

        {/* NÚT GỬI */}
        <button
          onClick={onSend}
          className="p-2 rounded-full bg-linear-to-r from-forest to-matcha text-white hover:from-forest-dark hover:to-matcha-dark shadow-md hover:shadow-lg transition-all duration-200"
        >
          <SendHorizonalIcon className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatForm;
