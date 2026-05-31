import {
  ChevronRight,
  PaletteIcon,
  ThumbsUpIcon,
  UserPenIcon,
} from "lucide-react";
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
    <div className="rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-accent group"
        onClick={setIsOpenSettingChat}
      >
        <span className="font-medium text-foreground group-hover:text-primary">
          Tùy chỉnh đoạn chat
        </span>
        <ChevronRight
          className={`size-4 text-muted-foreground transition-all duration-300 ${
            isOpenSettingChat
              ? "rotate-90 text-primary"
              : "group-hover:translate-x-0.5"
          }`}
        />
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpenSettingChat ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-2 py-1 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent group/item">
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
              <PaletteIcon className="size-4 text-primary" />
            </div>
            <span className="text-sm text-foreground">Thay đổi chủ đề</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent group/item">
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
              <ThumbsUpIcon className="size-4 text-primary" />
            </div>
            <span className="text-sm text-foreground">
              Thay đổi biểu tượng cảm xúc
            </span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent group/item">
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
              <UserPenIcon className="size-4 text-primary" />
            </div>
            <span className="text-sm text-foreground">Chỉnh sửa biệt danh</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionChatting;
