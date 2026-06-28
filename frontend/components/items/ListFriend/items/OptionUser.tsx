import { motion } from "motion/react";
import { User as UserIcon, Users } from "lucide-react";

interface OptionUserProps {
  onClose: () => void;
}

const OptionUser = ({ onClose }: OptionUserProps) => {
  return (
    <>
      {/* 💡 Lớp phủ bạt vô hình phủ toàn màn hình: Click vào bất kỳ đâu ngoài menu là tự đóng */}
      <div 
        className="fixed inset-0 z-40 cursor-default pointer-events-auto" 
        onClick={(e) => {
          e.stopPropagation(); // Không cho kích hoạt click mở lại phòng chat
          onClose();
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 5 }}
        onClick={(e) => e.stopPropagation()} // Ngăn click bên trong menu bị đóng nhầm
        /* 💡 CHÌA KHÓA: Đổi pointer-events-none thành pointer-events-auto để click được nút bấm */
        className="absolute right-0 top-full mt-1 w-64 bg-card border border-border shadow-2xl rounded-2xl p-2 z-50 overflow-hidden pointer-events-auto"
      >
        <button
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-200 cursor-pointer text-foreground"
          onClick={() => {
            console.log("Xem thông tin");
            onClose();
          }}
        >
          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <UserIcon className="w-4 h-4" />
          </div>
          Thông tin người dùng
        </button>

        <button
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-200 cursor-pointer text-foreground"
          onClick={() => {
            console.log("Hủy kết bạn");
            onClose();
          }}
        >
          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Users className="w-4 h-4" />
          </div>
          Hủy kết bạn
        </button>

        <button
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all duration-200 cursor-pointer text-foreground"
          onClick={() => {
            console.log("Chặn");
            onClose();
          }}
        >
          <div className="size-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
            <Users className="w-4 h-4" />
          </div>
          Chặn người dùng
        </button>
      </motion.div>
    </>
  );
};

export default OptionUser;