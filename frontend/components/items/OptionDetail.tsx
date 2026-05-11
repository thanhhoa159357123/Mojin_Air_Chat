"use client";

import { IFriend } from "@/types/friend";
import {
  Bell,
  ChevronRight,
  FileTextIcon,
  ImageIcon,
  PaletteIcon,
  Search,
  ThumbsUpIcon,
  Trash,
  UserPenIcon,
} from "lucide-react";
import { useState } from "react";

interface OptionDetailProps {
  selectedFriend: IFriend | null; // Thêm prop này để nhận bạn bè đang được chọn từ parent component
  handleAllDeleteMessages: () => void; // Thêm prop này để nhận hàm xoá tin nhắn từ parent component
}

const OptionDetail = ({
  selectedFriend,
  handleAllDeleteMessages,
}: OptionDetailProps) => {
  const [isOpenSettingChat, setIsOpenSettingChat] = useState(false);
  const [isOpenMedia, setIsOpenMedia] = useState(false);
  const [isOpenPrivacy, setIsOpenPrivacy] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-sage/20 dark:border-sage/10">
      {/* Header Profile */}
      <div className="relative px-5 py-6 bg-linear-to-b from-sage-lighter/30 to-transparent dark:from-forest-lighter/10">
        {/* Decorative blob nhỏ */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-matcha/5 dark:bg-mint/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-forest/5 dark:bg-forest/10 rounded-full blur-2xl" />

        <div className="relative flex flex-col items-center justify-center">
          <div className="relative">
            <div className="size-20 rounded-full bg-linear-to-br from-forest to-matcha shadow-lg ring-4 ring-white/50 dark:ring-gray-800/50" />
            <div className="absolute bottom-1 right-1 size-4 bg-matcha rounded-full ring-2 ring-white dark:ring-gray-800 animate-pulse" />
          </div>
          <div className="text-center mt-3">
            <h2 className="text-xl font-bold bg-linear-to-r from-forest to-matcha dark:from-mint dark:to-matcha bg-clip-text text-transparent">
              {selectedFriend ? selectedFriend.full_name : "Chọn một bạn bè"}
            </h2>
            <h3 className="text-sm text-sage dark:text-sage-light mt-0.5">
              @{selectedFriend ? selectedFriend.username : "username"}
            </h3>
          </div>
          <div className="mt-5 flex items-center gap-6">
            <button className="group flex flex-col items-center gap-1 transition-all duration-200 hover:scale-105">
              <div className="p-2 rounded-full bg-sage-lighter/50 dark:bg-gray-800/50 group-hover:bg-matcha/10 dark:group-hover:bg-mint/10 transition-colors">
                <Bell className="size-4 text-sage dark:text-matcha-light group-hover:text-matcha dark:group-hover:text-mint" />
              </div>
              <span className="text-xs text-sage dark:text-sage-light">
                Thông báo
              </span>
            </button>
            <button className="group flex flex-col items-center gap-1 transition-all duration-200 hover:scale-105">
              <div className="p-2 rounded-full bg-sage-lighter/50 dark:bg-gray-800/50 group-hover:bg-matcha/10 dark:group-hover:bg-mint/10 transition-colors">
                <Search className="size-4 text-sage dark:text-matcha-light group-hover:text-matcha dark:group-hover:text-mint" />
              </div>
              <span className="text-xs text-sage dark:text-sage-light">
                Tìm kiếm
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Options List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {/* Option 1: Tùy chỉnh đoạn chat */}
        <div className="rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-sage-lighter/30 dark:hover:bg-forest-lighter/20 group"
            onClick={() => setIsOpenSettingChat(!isOpenSettingChat)}
          >
            <span className="font-medium text-foreground dark:text-matcha-light group-hover:text-forest dark:group-hover:text-mint">
              Tùy chỉnh đoạn chat
            </span>
            <ChevronRight
              className={`size-4 text-sage transition-all duration-300 ${
                isOpenSettingChat
                  ? "rotate-90 text-matcha"
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
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-sage-lighter/40 dark:hover:bg-forest-lighter/20 group/item">
                <div className="p-1.5 rounded-lg bg-matcha/10 dark:bg-mint/10 group-hover/item:bg-matcha/20 dark:group-hover/item:bg-mint/20 transition-colors">
                  <PaletteIcon className="size-4 text-matcha dark:text-mint" />
                </div>
                <span className="text-sm text-foreground dark:text-matcha-light">
                  Thay đổi chủ đề
                </span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-sage-lighter/40 dark:hover:bg-forest-lighter/20 group/item">
                <div className="p-1.5 rounded-lg bg-matcha/10 dark:bg-mint/10 group-hover/item:bg-matcha/20 dark:group-hover/item:bg-mint/20 transition-colors">
                  <ThumbsUpIcon className="size-4 text-matcha dark:text-mint" />
                </div>
                <span className="text-sm text-foreground dark:text-matcha-light">
                  Thay đổi biểu tượng cảm xúc
                </span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-sage-lighter/40 dark:hover:bg-forest-lighter/20 group/item">
                <div className="p-1.5 rounded-lg bg-matcha/10 dark:bg-mint/10 group-hover/item:bg-matcha/20 dark:group-hover/item:bg-mint/20 transition-colors">
                  <UserPenIcon className="size-4 text-matcha dark:text-mint" />
                </div>
                <span className="text-sm text-foreground dark:text-matcha-light">
                  Chỉnh sửa biệt danh
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Option 2: File phương tiện & file */}
        <div className="rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-sage-lighter/30 dark:hover:bg-forest-lighter/20 group"
            onClick={() => setIsOpenMedia(!isOpenMedia)}
          >
            <span className="font-medium text-foreground dark:text-matcha-light group-hover:text-forest dark:group-hover:text-mint">
              File phương tiện & file
            </span>
            <ChevronRight
              className={`size-4 text-sage transition-all duration-300 ${
                isOpenMedia
                  ? "rotate-90 text-matcha"
                  : "group-hover:translate-x-0.5"
              }`}
            />
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isOpenMedia ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-2 py-1 space-y-1">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-sage-lighter/40 dark:hover:bg-forest-lighter/20 group/item">
                <div className="p-1.5 rounded-lg bg-forest/10 dark:bg-forest/20 group-hover/item:bg-forest/20 dark:group-hover/item:bg-forest/30 transition-colors">
                  <ImageIcon className="size-4 text-forest dark:text-mint" />
                </div>
                <span className="text-sm text-foreground dark:text-matcha-light">
                  File phương tiện (12)
                </span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-sage-lighter/40 dark:hover:bg-forest-lighter/20 group/item">
                <div className="p-1.5 rounded-lg bg-forest/10 dark:bg-forest/20 group-hover/item:bg-forest/20 dark:group-hover/item:bg-forest/30 transition-colors">
                  <FileTextIcon className="size-4 text-forest dark:text-mint" />
                </div>
                <span className="text-sm text-foreground dark:text-matcha-light">
                  File (5)
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Option 3: Quyền riêng tư và hỗ trợ */}
        <div className="rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-sage-lighter/30 dark:hover:bg-forest-lighter/20 group"
            onClick={() => setIsOpenPrivacy(!isOpenPrivacy)}
          >
            <span className="font-medium text-foreground dark:text-matcha-light group-hover:text-forest dark:group-hover:text-mint">
              Quyền riêng tư và hỗ trợ
            </span>
            <ChevronRight
              className={`size-4 text-sage transition-all duration-300 ${
                isOpenPrivacy
                  ? "rotate-90 text-matcha"
                  : "group-hover:translate-x-0.5"
              }`}
            />
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isOpenPrivacy ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-2 py-1 space-y-1">
              <div
                onClick={() =>
                  selectedFriend && handleAllDeleteMessages()
                }
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-sage-lighter/40 dark:hover:bg-forest-lighter/20 group/item"
              >
                <div className="p-1.5 rounded-lg bg-forest/10 dark:bg-forest/20 group-hover/item:bg-forest/20 dark:group-hover/item:bg-forest/30 transition-colors">
                  <Trash className="size-4 text-forest dark:text-mint" />
                </div>
                <span className="text-sm text-foreground dark:text-matcha-light">
                  Xoá tin nhắn
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Thông tin thêm */}
      <div className="px-4 py-3 border-t border-sage/20 dark:border-sage/10 bg-white/30 dark:bg-gray-800/30">
        <div className="flex items-center justify-between text-xs text-sage dark:text-sage-light">
          <span>Thành viên từ 2024</span>
          <span>●</span>
          <span>123 tin nhắn</span>
        </div>
      </div>
    </div>
  );
};

export default OptionDetail;
