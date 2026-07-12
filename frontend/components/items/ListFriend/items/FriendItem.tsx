import Image from "next/image";
import { User as UserIcon } from "lucide-react";
import { IFriend } from "@/types/friend";

interface FriendItemProps {
  data: IFriend;
  isSelected: boolean;
  onClick: () => void;
}

const FriendItem = ({ data, isSelected, onClick }: FriendItemProps) => {
  return (
    <div
      onClick={onClick}
      className={`group/item relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer ${
        isSelected
          ? "bg-matcha/10 dark:bg-matcha/20"
          : "hover:bg-muted/60 border-l-[3px] border-transparent"
      }`}
      title={data.full_name}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="size-11 rounded-full bg-matcha/10 dark:bg-matcha/20 flex items-center justify-center overflow-hidden">
          {data.avatar ? (
            <Image
              src={data.avatar}
              alt={data.full_name}
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-forest dark:text-matcha-light font-semibold text-sm uppercase">
              {data.full_name?.substring(0, 2) || (
                <UserIcon className="size-4" />
              )}
            </span>
          )}
        </div>
        {data.status === "online" && (
          <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full ring-2 ring-card" />
        )}
      </div>

      {/* Thông tin */}
      <div className="flex-1 min-w-0">
        <span
          className={`font-medium text-sm truncate block ${
            isSelected
              ? "text-forest-dark dark:text-forest-light"
              : "text-foreground"
          }`}
        >
          {data.full_name}
        </span>
        {data.username && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            @{data.username}
          </p>
        )}
      </div>
    </div>
  );
};

export default FriendItem;
