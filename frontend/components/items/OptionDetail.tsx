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
    <div className="flex flex-col h-full bg-background/40 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-border">
      {/* Header Profile */}
      <div className="relative px-5 py-6 bg-secondary/30">
        {/* Decorative blob nhỏ */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />

        <div className="relative flex flex-col items-center justify-center">
          <div className="relative">
            <div className="size-20 rounded-full bg-primary shadow-lg ring-4 ring-background" />
            <div className="absolute bottom-1 right-1 size-4 bg-primary rounded-full ring-2 ring-background animate-pulse" />
          </div>
          <div className="text-center mt-3">
            <h2 className="text-xl font-bold text-foreground">
              {selectedFriend ? selectedFriend.full_name : "Chọn một bạn bè"}
            </h2>
            <h3 className="text-sm text-muted-foreground mt-0.5">
              @{selectedFriend ? selectedFriend.username : "username"}
            </h3>
          </div>
          <div className="mt-5 flex items-center gap-6">
            <button className="group flex flex-col items-center gap-1 transition-all duration-200 hover:scale-105">
              <div className="p-2 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
                <Bell className="size-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Thông báo</span>
            </button>
            <button className="group flex flex-col items-center gap-1 transition-all duration-200 hover:scale-105">
              <div className="p-2 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
                <Search className="size-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Tìm kiếm</span>
            </button>
          </div>
        </div>
      </div>

      {/* Options List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {/* Option 1: Tùy chỉnh đoạn chat */}
        <div className="rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-accent group"
            onClick={() => setIsOpenSettingChat(!isOpenSettingChat)}
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
                <span className="text-sm text-foreground">
                  Chỉnh sửa biệt danh
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Option 2: File phương tiện & file */}
        <div className="rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-accent group"
            onClick={() => setIsOpenMedia(!isOpenMedia)}
          >
            <span className="font-medium text-foreground group-hover:text-primary">
              File phương tiện & file
            </span>
            <ChevronRight
              className={`size-4 text-muted-foreground transition-all duration-300 ${
                isOpenMedia
                  ? "rotate-90 text-primary"
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
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent group/item">
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
                  <ImageIcon className="size-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">
                  File phương tiện (12)
                </span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent group/item">
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
                  <FileTextIcon className="size-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">File (5)</span>
              </div>
            </div>
          </div>
        </div>
        {/* Option 3: Quyền riêng tư và hỗ trợ */}
        <div className="rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-accent group"
            onClick={() => setIsOpenPrivacy(!isOpenPrivacy)}
          >
            <span className="font-medium text-foreground group-hover:text-primary">
              Quyền riêng tư và hỗ trợ
            </span>
            <ChevronRight
              className={`size-4 text-muted-foreground transition-all duration-300 ${
                isOpenPrivacy
                  ? "rotate-90 text-primary"
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
                onClick={() => selectedFriend && handleAllDeleteMessages()}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent group/item"
              >
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
                  <Trash className="size-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">Xoá tin nhắn</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Thông tin thêm */}
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Thành viên từ 2024</span>
          <span>●</span>
          <span>123 tin nhắn</span>
        </div>
      </div>
    </div>
  );
};

export default OptionDetail;
