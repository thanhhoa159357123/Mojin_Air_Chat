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
      className={`group/item relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors duration-150 ${
        isSelected
          ? "bg-forest-light/15 dark:bg-forest/20 border border-forest/20 dark:border-forest/30"
          : "hover:bg-muted/50 border border-transparent"
      }`}
      title={data.full_name}
    >
      <div className="relative shrink-0">
        <div className="size-12 rounded-full flex items-center justify-center overflow-hidden bg-muted">
          {data.avatar ? (
            <Image src={data.avatar} alt={data.full_name} width={48} height={48} className="w-full h-full object-cover" />
          ) : (
            <span className="text-foreground/60 font-semibold text-sm uppercase">
              {data.full_name?.substring(0, 2) || <UserIcon className="size-4" />}
            </span>
          )}
        </div>
        {data.status === "online" && (
          <span className="absolute bottom-0 right-0 size-3.5 bg-emerald-500 rounded-full ring-2 ring-card" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <span className={`font-semibold text-sm truncate block ${isSelected ? "text-forest-dark dark:text-forest-light" : "text-foreground"}`}>
          {data.full_name}
        </span>
        {data.username && <p className="text-xs text-muted-foreground truncate mt-1">@{data.username}</p>}
      </div>
    </div>
  );
};

export default FriendItem;