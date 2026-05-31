import { IMessage } from "@/types/message";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export const useChatRefHook = (
  messages: IMessage[],
  selectedFriendId: number | undefined,
  onLoadMore?: () => void, // 💡 Truyền hàm load thêm vào đây
  hasMore?: boolean,
  loadingMore?: boolean,
) => {
  const isFetchingRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const [showScrollDown, setShowScrollDown] = useState(false);

  // 💡 DÙNG REF THAY CHO STATE ĐỂ CHỐNG RACE CONDITION
  const lastScrolledMessageIdRef = useRef<number | null>(null);
  const currentRoomIdRef = useRef<number | undefined>(undefined);

  // 💡 LƯU TRỮ CHIỀU CAO ĐỂ LÀM SCROLL ANCHOR
  const previousScrollHeightRef = useRef<number>(0);
  const isFetchingOlderRef = useRef<boolean>(false);

  // 💡 KỸ THUẬT "CẮT NGANG": Đổi phòng là clear não ngay lập tức, không chờ useEffect
  // eslint-disable-next-line react-hooks/refs
  if (currentRoomIdRef.current !== selectedFriendId) {
    // eslint-disable-next-line react-hooks/refs
    currentRoomIdRef.current = selectedFriendId;
    // eslint-disable-next-line react-hooks/refs
    lastScrolledMessageIdRef.current = null; // Quên ID tin nhắn cũ đi
    // eslint-disable-next-line react-hooks/refs
    isFetchingOlderRef.current = false; // Reset cờ
  }

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    setShowScrollDown(!isNearBottom);

    // 💡 KHÓA VAN NGAY LẬP TỨC VỚI isFetchingRef
    if (scrollTop <= 10 && hasMore && !isFetchingRef.current) {
      isFetchingRef.current = true; // Khóa van không cho spam
      previousScrollHeightRef.current = scrollHeight;
      isFetchingOlderRef.current = true;
      onLoadMore?.();
    }
  };

  useEffect(() => {
    if (!loadingMore) {
      isFetchingRef.current = false;
    }
  }, [loadingMore]);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // 💡 MASTER EFFECT: Xử lý cuộn cho mọi trường hợp
  useEffect(() => {
    // Không có container hoặc chưa load xong tin nhắn thì NÍN, không làm gì hết
    if (!containerRef.current || messages.length === 0) return;

    const container = containerRef.current;

    // 🌟 XỬ LÝ SCROLL ANCHOR KHI LOAD XONG TIN NHẮN CŨ
    if (isFetchingOlderRef.current) {
      requestAnimationFrame(() => {
        // Lấy chiều cao mới (đã có thêm tin nhắn) trừ đi chiều cao cũ
        // Sẽ ra đúng khoảng cách bị chênh lệch -> Đẩy thanh cuộn xuống y hệt khoảng đó
        const heightDifference =
          container.scrollHeight - previousScrollHeightRef.current;
        container.scrollTop = heightDifference;

        isFetchingOlderRef.current = false; // Tắt cờ
      });
      return; // Cực kỳ quan trọng: Return luôn, không chạy xuống logic auto-scroll đáy!
    }

    const lastMessage = messages[messages.length - 1];
    const isMyMessage = lastMessage?.user_id === user?.id;

    // Nếu não đang trống trơn -> Lần đầu tiên load của phòng này!
    const isFirstLoadOfRoom = lastScrolledMessageIdRef.current === null;

    // Check xem có phải tin nhắn mới tinh so với lần cuộn trước không
    const isRealNewMessage =
      lastScrolledMessageIdRef.current !== lastMessage?.id;

    // 💡 BÍ THUẬT: setTimeout kết hợp requestAnimationFrame
    // Đảm bảo DOM đã nhét đủ 100% thẻ div tin nhắn vào khung rồi mới tính toán chiều cao
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 400;

        // TRƯỜNG HỢP 1: Mới chuyển từ PopUp qua hoặc mới F5
        if (isFirstLoadOfRoom) {
          container.scrollTo({ top: container.scrollHeight, behavior: "auto" });
          lastScrolledMessageIdRef.current = lastMessage?.id;
        }
        // TRƯỜNG HỢP 2: Đang chat, có tin nhắn mới bắn vào
        else if (isRealNewMessage) {
          if (isMyMessage || isNearBottom) {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: "smooth",
            });
            lastScrolledMessageIdRef.current = lastMessage?.id;
          }
        }
      });
    }, 100); // 100ms là đủ để React render mượt mà

    return () => clearTimeout(timer);
  }, [messages, selectedFriendId, user?.id]);

  return {
    containerRef,
    showScrollDown,
    handleScroll,
    scrollToBottom,
  };
};
