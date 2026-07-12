import { motion } from "motion/react";
// 🚀 1. Bổ sung thêm Info và LogOut để làm icon cho Group Chat
import { User as UserIcon, Users, ShieldAlert, Info, LogOut } from "lucide-react"; 
import { useConversationStore } from "@/stores/useConversationStore";

interface OptionUserProps {
  onClose: () => void;
  partner: { id: number; name: string; type: string };
}

const OptionUser = ({ onClose, partner }: OptionUserProps) => {
  const setActionTarget = useConversationStore(
    (state) => state.setActionTarget,
  );
  const isGroupChat = partner.type === "group";

  return (
    <>
      <div
        className="fixed inset-0 z-40 cursor-default pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 5 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-full mt-1 w-64 bg-card border border-border shadow-2xl rounded-2xl p-2 z-50 overflow-hidden pointer-events-auto"
      >
        {isGroupChat ? (
          /* 👥 Mớ nút dành riêng cho nhóm (Đã được lên đồ chuẩn UX/UI) */
          <>
            {/* Nút thông tin nhóm */}
            <button
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-all cursor-pointer"
              onClick={() => {
                // Tùy thuộc vào logic mở Popup detail nhóm của bác sau này (ví dụ dùng cờ "groupDetail")
                // setActionTarget("groupDetail", partner); 
                onClose();
              }}
            >
              <div className="size-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                <Info className="w-4 h-4" />
              </div>
              Thông tin nhóm
            </button>

            {/* Nút rời khỏi nhóm */}
            <button
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all cursor-pointer"
              onClick={() => {
                // Kích hoạt popup xác nhận rời nhóm bằng cách bắn cờ "leaveGroup" lên Store nếu cần
                // setActionTarget("leaveGroup", partner);
                onClose();
              }}
            >
              <div className="size-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
                <LogOut className="w-4 h-4" />
              </div>
              Rời khỏi nhóm
            </button>
          </>
        ) : (
          /* 👤 Mớ nút cũ dành cho Chat riêng tư của bác (Giữ nguyên phong độ) */
          <>
            <button
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-all cursor-pointer"
              onClick={() => {
                setActionTarget("detail", partner);
                onClose();
              }}
            >
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <UserIcon className="w-4 h-4" />
              </div>
              Thông tin người dùng
            </button>

            <button
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium hover:bg-amber-500/10 hover:text-amber-500 rounded-xl transition-all cursor-pointer"
              onClick={() => {
                setActionTarget("unfriend", partner);
                onClose();
              }}
            >
              <div className="size-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                <Users className="w-4 h-4" />
              </div>
              Hủy kết bạn
            </button>

            <button
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all cursor-pointer"
              onClick={() => {
                setActionTarget("block", partner);
                onClose();
              }}
            >
              <div className="size-8 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
                <ShieldAlert className="w-4 h-4" />
              </div>
              Chặn người dùng
            </button>
          </>
        )}
      </motion.div>
    </>
  );
};

export default OptionUser;