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
    <div className="relative px-5 py-6 bg-secondary/30">
      {/* Decorative blob nhỏ */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />

      <div className="relative flex flex-col items-center justify-center">
        <div className="relative">
          {/* Giao diện Avatar động cho Sidebar bên phải */}
          <div className="size-20 rounded-full bg-primary/10 border-2 border-primary/20 shadow-lg ring-4 ring-background flex items-center justify-center overflow-hidden">
            {isGroup ? (
              <Users className="size-10 text-primary" />
            ) : displayAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayAvatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary font-bold text-xl uppercase">
                {partner?.first_name?.substring(0, 2) || (
                  <UserIcon className="size-8" />
                )}
              </span>
            )}
          </div>
          {selectConversation && !isGroup && partner?.status === "online" && (
            <span className="absolute bottom-1 right-1 size-4 bg-emerald-500 rounded-full ring-2 ring-offset-0 ring-background shadow-sm animate-in fade-in zoom-in duration-300" />
          )}
        </div>
        <div className="text-center mt-3">
          <h2 className="text-xl font-bold text-foreground max-w-60 truncate">
            {displayName}
          </h2>
          <h3 className="text-sm text-muted-foreground mt-0.5 truncate max-w-60">
            {isGroup ? "" : "@"}
            {displayUsername}
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
  );
};

export default Header;
