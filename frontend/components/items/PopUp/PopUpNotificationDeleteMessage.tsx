import { useEffect } from "react"; // 💡 Nhớ import cái này nha đại ca

interface PopUpNotificationDeleteMessageProps {
  onClose?: () => void;
  messageId?: number | null;
  handleDeleteMessage?: (messageId: number) => void;
}

const PopUpNotificationDeleteMessage = ({
  onClose,
  messageId,
  handleDeleteMessage,
}: PopUpNotificationDeleteMessageProps) => {

  // 🚀 BÍ THUẬT: LẮNG NGHE PHÍM ENTER KHI POPUP ĐANG MỞ
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bắt trúng phím Enter
      if (e.key === "Enter") {
        e.preventDefault(); // Chặn hành vi mặc định (tránh nhảy trang hoặc submit form rác)
        
        // Gọi hàm xóa y hệt như lúc bấm nút
        if (handleDeleteMessage && messageId) {
          handleDeleteMessage(messageId);
          if (onClose) onClose();
        }
      }

      // 💡 Bonus: Ấn nút ESC để đóng PopUp cho nó pro
      if (e.key === "Escape") {
        e.preventDefault();
        if (onClose) onClose();
      }
    };

    // Gắn tai nghe vào window
    window.addEventListener("keydown", handleKeyDown);

    // 🧹 QUAN TRỌNG NHẤT (CLEANUP): 
    // Khi PopUp đóng lại, phải gỡ tai nghe ra, nếu không ra ngoài chat ấn Enter nó lại gọi nhầm hàm xóa!
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleDeleteMessage, messageId, onClose]); // Khai báo đủ dependencies

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
