import {
  Image,
  Menu,
  Mic,
  PaperclipIcon,
  Phone,
  SendHorizonalIcon,
} from "lucide-react";

interface ChatFormProps {
  onToggleOption: () => void;
}

const ChatForm = ({ onToggleOption }: ChatFormProps) => {
  // Dữ liệu tin nhắn mẫu
  const messages = [
    {
      id: 1,
      sender: "them",
      text: "Chào bạn, hôm nay thế nào?",
      time: "10:30",
    },
    { id: 2, sender: "me", text: "Mình vẫn ổn, cảm ơn bạn!", time: "10:32" },
    { id: 3, sender: "them", text: "Có cần giúp gì không?", time: "10:33" },
    {
      id: 4,
      sender: "me",
      text: "Mình đang tìm hiểu về sản phẩm mới",
      time: "10:35",
    },
    {
      id: 5,
      sender: "them",
      text: "Để mình giới thiệu cho bạn nhé!",
      time: "10:36",
    },
  ];

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
              Lê Hòa
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
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                msg.sender === "me"
                  ? "bg-linear-to-r from-forest to-matcha text-white rounded-br-sm"
                  : "bg-white/80 dark:bg-gray-800/80 text-forest dark:text-matcha-light rounded-bl-sm border border-sage/20 dark:border-sage/10"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <span
                className={`text-[10px] mt-1 block ${
                  msg.sender === "me"
                    ? "text-white/70"
                    : "text-sage dark:text-sage-light/70"
                }`}
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        <div className="flex justify-start">
          <div className="bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-2xl rounded-bl-sm border border-sage/20">
            <div className="flex gap-1">
              <span
                className="w-2 h-2 bg-matcha rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className="w-2 h-2 bg-matcha rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className="w-2 h-2 bg-matcha rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></span>
            </div>
          </div>
        </div>
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

        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-sage-lighter/50 dark:bg-gray-700/50 text-forest dark:text-matcha-light placeholder:text-sage/60 dark:placeholder:text-sage/40 outline-none text-sm px-4 py-2 rounded-full border border-sage/30 dark:border-sage/20 focus:border-matcha dark:focus:border-mint focus:ring-1 focus:ring-matcha dark:focus:ring-mint transition-all duration-200"
        />

        <button className="p-2 rounded-full bg-linear-to-r from-forest to-matcha text-white hover:from-forest-dark hover:to-matcha-dark shadow-md hover:shadow-lg transition-all duration-200">
          <SendHorizonalIcon className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatForm;
