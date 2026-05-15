import React from "react";

interface PopUpNotificationDeleteMessageProps {
  onClose?: () => void;
  messageId?: number | null; // Thêm prop này để nhận ID tin nhắn cần xoá
  handleDeleteMessage?: (messageId: number) => void;
}

const PopUpNotificationDeleteMessage = ({
  onClose,
  messageId,
  handleDeleteMessage,
}: PopUpNotificationDeleteMessageProps) => {
  console.log("mes", messageId);
  return (
    <div className="bg-card rounded-2xl p-6 w-150 shadow-xl flex flex-col gap-3 border border-border">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Xóa tin nhắn</h2>
      </div>
      <div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Tin nhắn này sẽ bị gỡ khỏi thiết bị của bạn, nhưng vẫn hiển thị với
          các thành viên khác trong đoạn chat.
        </p>
      </div>
      {/* Footer */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors cursor-pointer"
        >
          Hủy
        </button>
        <button
          onClick={() => {
            if (handleDeleteMessage && messageId) {
              handleDeleteMessage(messageId);
              if (onClose) onClose();
            }
          }}
          className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          Xóa
        </button>
      </div>
    </div>
  );
};

export default PopUpNotificationDeleteMessage;
