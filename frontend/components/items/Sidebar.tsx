import { IUser } from "@/types/auth";
import { BellIcon } from "lucide-react";

interface SidebarProps {
  onToggleNotification: () => void;
  onToggleSetting: () => void;
  user: IUser | null;
}

const Sidebar = ({
  onToggleNotification,
  onToggleSetting,
  user,
}: SidebarProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        onClick={() => onToggleSetting()}
        className="relative group cursor-pointer"
      >
        <div className="size-10 rounded-full bg-primary shadow-lg ring-4 ring-ring/30 flex items-center justify-center">
          <span className="text-primary-foreground font-semibold text-sm uppercase">
            {user?.first_name?.[0] || ""}
            {user?.last_name?.[0] || ""}
          </span>
        </div>
      </div>
      <div
        className="text-muted-foreground transition duration-300 ease-in-out hover:text-primary hover:bg-secondary px-2 py-2 rounded-full cursor-pointer"
        onClick={onToggleNotification}
      >
        <BellIcon className="w-6 h-6 " />
      </div>
    </div>
  );
};

export default Sidebar;
