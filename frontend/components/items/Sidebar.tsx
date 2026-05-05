import { IUser } from "@/types/auth";
import { BellIcon } from "lucide-react";

interface SidebarProps {
  onToggleNotification: () => void;
  user: IUser | null;
}

const Sidebar = ({ onToggleNotification, user }: SidebarProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative group cursor-pointer">
        <div className="size-10 rounded-full bg-linear-to-br from-forest to-matcha shadow-lg ring-4 ring-white/50 dark:ring-gray-800/50 flex items-center justify-center">
          <span className="text-white font-semibold text-sm uppercase">
            {user?.first_name?.[0] || ""}
            {user?.last_name?.[0] || ""}
          </span>
        </div>
      </div>
      <div
        className="text-matcha transition duration-300 ease-in-out hover:text-matcha-dark hover:bg-sage-light px-2 py-2 rounded-full cursor-pointer"
        onClick={onToggleNotification}
      >
        <BellIcon className="w-6 h-6 " />
      </div>
    </div>
  );
};

export default Sidebar;
