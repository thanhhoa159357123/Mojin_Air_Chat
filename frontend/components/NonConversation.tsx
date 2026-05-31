import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, MessageSquareIcon } from "lucide-react";

const NonConversation = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-1 flex flex-col items-center justify-center gap-4 p-8"
    >
      {/* Icon trang trí */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", damping: 15 }}
        className="relative"
      >
        <div className="size-20 rounded-full bg-secondary flex items-center justify-center">
          <MessageSquareIcon className="size-10 text-muted-foreground" />
        </div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -inset-2 rounded-full bg-primary/20 blur-xl -z-10"
        />
      </motion.div>

      {/* Text */}
      <div className="text-center space-y-2">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-semibold text-foreground"
        >
          Chưa có cuộc trò chuyện nào
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-muted-foreground"
        >
          Chọn một bạn bè từ danh sách bên trái để bắt đầu chat
        </motion.p>
      </div>

      {/* Gợi ý */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/70"
      >
        <ArrowLeft className="size-3 animate-pulse" />
        <span>Chọn bạn bè bên trái</span>
      </motion.div>
    </motion.div>
  );
};

export default NonConversation;
