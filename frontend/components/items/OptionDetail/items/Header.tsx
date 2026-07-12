import { getConversationDetails } from "@/lib/conversationUtils";
import { useAuthStore } from "@/stores/useAuthStore";
import { IConversation } from "@/types/conversation";
import { Bell, Search, UserIcon, Users } from "lucide-react";
import React from "react";

interface HeaderProps {
  selectConversation: IConversation | null;
}

const Header = ({ selectConversation }: HeaderProps) => {
  const user = useAuthStore((state) => state.user);
  const { isGroup, partner, displayName, displayUsername, displayAvatar } =
    getConversationDetails(selectConversation, user?.id);

  return (
    <div className="px-5 py-6 border-b border-matcha-light/20 dark:border-matcha-dark/30">
      <div className="flex flex-col items-center">
        {/* Avatar */}
        <div className="relative">
          <div className="size-20 rounded-full bg-matcha/10 dark:bg-matcha/20 flex items-center justify-center overflow-hidden">
            {isGroup ? (
              <Users className="size-10 text-forest dark:text-matcha-light" />
            ) : displayAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayAvatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-forest dark:text-matcha-light font-bold text-xl uppercase">
                {partner?.first_name?.substring(0, 2) || (
                  <UserIcon className="size-8" />
                )}
              </span>
            )}
          </div>
          {selectConversation && !isGroup && partner?.status === "online" && (
            <span className="absolute bottom-1 right-1 size-4 bg-emerald-500 rounded-full ring-2 ring-card" />
          )}
        </div>

        {/* Info */}
        <div className="text-center mt-3">
          <h2 className="text-lg font-semibold text-foreground max-w-60 truncate">
            {displayName}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-60">
            {isGroup ? "" : "@"}
            {displayUsername}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-4">
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-matcha/10 dark:hover:bg-matcha/20 text-muted-foreground hover:text-forest dark:hover:text-matcha-light">
            <Bell className="size-4" />
            <span className="text-[11px]">Thông báo</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-matcha/10 dark:hover:bg-matcha/20 text-muted-foreground hover:text-forest dark:hover:text-matcha-light">
            <Search className="size-4" />
            <span className="text-[11px]">Tìm kiếm</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;