"use client";

import React from "react";
import { motion } from "motion/react";
import { ShieldAlert, UserMinus, X } from "lucide-react";
import { useFriends } from "@/hooks/useFriends";
import { useConversationStore } from "@/stores/useConversationStore";

interface PopUpUnFriendOrBlockProps {
  onClose: () => void;
}

const PopUpUnFriendOrBlock = ({ onClose }: PopUpUnFriendOrBlockProps) => {
  const { handleUnFriend, handleBlockFriend } = useFriends();

  // Rút data từ Store ra
  const currentAction = useConversationStore((state) => state.currentAction);
  const targetFriend = useConversationStore((state) => state.targetFriend);

  if (!targetFriend || !currentAction) return null;

  const isUnfriend = currentAction === "unfriend";

  const handleConfirm = async () => {
    if (isUnfriend) {
      await handleUnFriend(targetFriend.id); // Gọi API xóa bạn
    } else {
      await handleBlockFriend(targetFriend.id); // Gọi API chặn người dùng
    }
    onClose(); // Xong việc thì dập popup
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
        exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
        className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md overflow-hidden bg-card border border-border shadow-2xl rounded-2xl p-6 text-foreground"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-secondary transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div
            className={`size-14 rounded-full flex items-center justify-center mb-4 shadow-sm ${isUnfriend ? "bg-amber-500/10 text-amber-500" : "bg-destructive/10 text-destructive"}`}
          >
            {isUnfriend ? (
              <UserMinus className="size-7" />
            ) : (
              <ShieldAlert className="size-7" />
            )}
          </div>

          <h3 className="text-lg font-bold tracking-tight">
            {isUnfriend ? "Hủy kết bạn" : "Chặn người dùng"}
          </h3>

          <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
            {isUnfriend ? (
              <>
                Bạn có chắc chắn muốn hủy kết bạn với{" "}
                <span className="font-semibold text-foreground">
                  {targetFriend.name}
                </span>
                ? Hai người sẽ không thể nhắn tin cho nhau nữa.
              </>
            ) : (
              <>
                Bạn có chắc chắn muốn chặn{" "}
                <span className="font-semibold text-foreground">
                  {targetFriend.name}
                </span>
                ?
              </>
            )}
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border hover:bg-secondary font-medium text-sm transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 py-2.5 rounded-xl font-medium text-sm text-white shadow-md transition-all cursor-pointer ${isUnfriend ? "bg-amber-500 hover:bg-amber-600" : "bg-destructive hover:bg-destructive/90"}`}
          >
            Xác nhận
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default PopUpUnFriendOrBlock;
