import { IPartner } from "@/types/conversation";
import { Menu, UserIcon, Users } from "lucide-react";
import Image from "next/image";

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
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-card border-b border-matcha-light/20 dark:border-matcha-dark/30">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="size-10 rounded-full bg-matcha/10 dark:bg-matcha/20 flex items-center justify-center overflow-hidden">
            {isGroup ? (
              <Users className="size-5 text-forest dark:text-matcha-light" />
            ) : partner ? (
              partner.avatar || displayAvatar ? (
                <Image
                  src={partner.avatar || displayAvatar || "/default-avatar.png"}
                  alt="avatar"
                  width={44}
                  height={44}
                  className="w-full h-full object-cover shrink-0 block"
                />
              ) : (
                <span className="text-forest dark:text-matcha-light font-bold text-xs uppercase tracking-wider">
                  {partner.first_name
                    ? partner.first_name.substring(0, 2)
                    : partner.full_name
                      ? partner.full_name.substring(0, 2)
                      : partner.username
                        ? partner.username.substring(0, 2)
                        : null}
                </span>
              )
            ) : (
              <UserIcon className="size-4 text-muted-foreground" />
            )}
          </div>

          {!isGroup && partner?.status === "online" && (
            <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full ring-2 ring-card" />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-sm text-foreground truncate max-w-50 sm:max-w-xs">
            {displayName}
          </span>
          {partner?.status === "online" && (
            <span className="text-[11px] text-muted-foreground">
              Đang hoạt động
            </span>
          )}
        </div>
      </div>

      {/* Menu Button */} 
      <button
        onClick={onToggleOption}
        className="size-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-forest dark:hover:text-matcha-light hover:bg-matcha/10 dark:hover:bg-matcha/20 cursor-pointer"
        aria-label="Mở menu tùy chọn"
      >
        <Menu className="size-4" />
      </button>
    </div>
  );
};

export default HeaderBar;
