import { useConversationStore } from "@/stores/useConversationStore";
import { IPartner } from "@/types/conversation";
import { Menu, Phone, UserIcon, Users } from "lucide-react";
import Image from "next/image";
import React from "react";

interface HeaderBarProps {
  isGroup: boolean;
  partner: IPartner | null;
  displayName: string;
  displayAvatar?: string | null;
  onToggleOption: () => void;
}

const HeaderBar = ({
  displayName,
  displayAvatar,
  isGroup,
  partner,
  onToggleOption,
}: HeaderBarProps) => {
  const selectConversation = useConversationStore(
    (state) => state.selectConversation,
  );

  return (
    <div className="flex items-center justify-between px-5 py-3 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          {/* Logic render Avatar trên Header Bar */}
          <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg overflow-hidden">
            {isGroup ? (
              <Users className="size-5 text-primary" />
            ) : partner ? ( // 1️⃣ Bảo đảm với TS là nhánh này partner luôn tồn tại
              partner.avatar || displayAvatar ? (
                // 🖼️ Nếu CÓ ảnh avatar
                <Image
                  src={partner.avatar || displayAvatar || "/default-avatar.png"}
                  alt="avatar"
                  width={44}
                  height={44}
                  className="w-full h-full object-cover shrink-0 block"
                />
              ) : (
                // 🔤 Nếu KHÔNG CÓ ảnh (avatar: null giống trong ảnh log của ông) -> Render chữ viết tắt
                <span className="text-primary font-bold text-xs uppercase tracking-wider">
                  {partner.first_name ? (
                    partner.first_name.substring(0, 2)
                  ) : partner.full_name ? (
                    partner.full_name.substring(0, 2)
                  ) : partner.username ? (
                    partner.username.substring(0, 2)
                  ) : (
                    <UserIcon className="size-4" />
                  )}
                </span>
              )
            ) : (
              // 2️⃣ Nhánh cuối: Hoàn toàn không có dữ liệu partner
              <UserIcon className="size-4" />
            )}
          </div>
          {selectConversation && (
            <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full ring-2 ring-background"></span>
          )}
        </div>
        <div>
          <span className="font-semibold text-sm text-foreground block max-w-50 sm:max-w-xs truncate">
            {displayName}
          </span>
          <span className="text-[10px] text-muted-foreground block">
            {selectConversation ? "Đang hoạt động" : "Mojin Air Chat"}
          </span>
        </div>
      </div>
      <div className="flex gap-4 text-muted-foreground">
        <Phone className="size-4 cursor-pointer hover:text-primary transition-all duration-200" />
        <Menu
          onClick={onToggleOption}
          className="size-4 cursor-pointer hover:text-primary transition-all duration-200"
        />
      </div>
    </div>
  );
};

export default HeaderBar;
