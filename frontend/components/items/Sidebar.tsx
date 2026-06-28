import { useAuthStore } from "@/stores/useAuthStore";
import { useFriends } from "@/hooks/useFriends";
import { BellIcon } from "lucide-react";
import Image from "next/image";

interface SidebarProps {
  onToggleNotification: () => void;
  onToggleSetting: () => void;
}

const Sidebar = ({ onToggleNotification, onToggleSetting }: SidebarProps) => {
  const { friendRequests } = useFriends();
  const pendingCount = friendRequests.length;
  const user = useAuthStore((state) => state.user);
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        onClick={() => onToggleSetting()}
        className="relative group cursor-pointer"
      >
        <div className="size-10 rounded-full bg-primary shadow-lg ring-4 ring-ring/30 flex items-center justify-center overflow-hidden">
          {user?.avatar ? (
            /* 💡 Đã fix: Bắn ảnh trực tiếp, ép full size và object-cover để bo tròn chuẩn đét */
            <Image
              src={user.avatar}
              alt="Avatar"
              className="size-full object-cover"
              width={40}
              height={40}
              priority // Tối ưu tốc độ load ảnh đại diện của hệ thống
            />
          ) : (
            /* 💡 Đã fix: Tách luồng render fallback text riêng biệt, không lồng bậy bạ vào thẻ span bọc ảnh */
            <div className="text-primary-foreground font-bold text-sm uppercase tracking-wider">
              {user?.last_name?.[0] || ""}
              {user?.first_name?.[0] || "M"}
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div
          className="text-muted-foreground transition duration-300 ease-in-out hover:text-primary hover:bg-secondary px-2 py-2 rounded-full cursor-pointer"
          onClick={onToggleNotification}
        >
          <BellIcon className="w-6 h-6 " />
        </div>
        {pendingCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center">
            {pendingCount > 99 ? "99+" : pendingCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
