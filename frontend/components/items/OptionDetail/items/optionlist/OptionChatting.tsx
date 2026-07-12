import { ChevronRight, PaletteIcon, ThumbsUpIcon, UserPenIcon } from "lucide-react";
import React from "react";

interface OptionChattingProps {
  isOpenSettingChat: boolean;
  setIsOpenSettingChat: () => void;
}

const OptionChatting = ({
  isOpenSettingChat,
  setIsOpenSettingChat,
}: OptionChattingProps) => {
  return (
    <div>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-matcha/5 dark:hover:bg-matcha/10 group"
        onClick={setIsOpenSettingChat}
      >
        <span className="text-sm font-medium text-foreground group-hover:text-forest dark:group-hover:text-matcha-light">
          Tùy chỉnh đoạn chat
        </span>
        <ChevronRight
          className={`size-4 text-muted-foreground ${isOpenSettingChat ? "rotate-90 text-forest dark:text-matcha-light" : ""}`}
        />
      </div>

      {/* Content */}
      {isOpenSettingChat && (
        <div className="px-1 pb-1 space-y-0.5">
          <div
            onClick={() => alert("Tính năng đang được phát triển!")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-matcha/5 dark:hover:bg-matcha/10"
          >
            <div className="p-1.5 rounded-md bg-matcha/10 dark:bg-matcha/20">
              <PaletteIcon className="size-3.5 text-forest dark:text-matcha-light" />
            </div>
            <span className="text-sm text-foreground">Thay đổi chủ đề</span>
          </div>
          <div
            onClick={() => alert("Tính năng đang được phát triển!")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-matcha/5 dark:hover:bg-matcha/10"
          >
            <div className="p-1.5 rounded-md bg-matcha/10 dark:bg-matcha/20">
              <ThumbsUpIcon className="size-3.5 text-forest dark:text-matcha-light" />
            </div>
            <span className="text-sm text-foreground">Thay đổi biểu tượng cảm xúc</span>
          </div>
          <div
            onClick={() => alert("Tính năng đang được phát triển!")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-matcha/5 dark:hover:bg-matcha/10"
          >
            <div className="p-1.5 rounded-md bg-matcha/10 dark:bg-matcha/20">
              <UserPenIcon className="size-3.5 text-forest dark:text-matcha-light" />
            </div>
            <span className="text-sm text-foreground">Chỉnh sửa biệt danh</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionChatting;