import { IMessage } from "@/types/message";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export const useChatRefHook = (
  messages: IMessage[],
  selectedFriendId: number | undefined,
  onLoadMore?: () => void,
  hasMore?: boolean,
  loadingMore?: boolean,
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const isFirstLoadRef = useRef<boolean>(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // 💡 Lưu ID tin nhắn cuối cùng để phân biệt "tin mới realtime" vs "load tin cũ pagination"
  const lastMessageIdRef = useRef<number | string | null>(null);

  // EFFECT 0: Đổi phòng → reset não
  useEffect(() => {
    isFirstLoadRef.current = true;
    lastMessageIdRef.current = null;
  }, [selectedFriendId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnreadCount(0);
  }, [selectedFriendId]);

  // Trong file useChatRefHook.ts, đoạn handleScroll
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    setShowScrollDown(!isNearBottom);
    if (isNearBottom) setUnreadCount(0);

    // 💡 TRICK GIỮ SCROLL ANCHOR CHUẨN XỊN
    // Khi cuộn chạm đỉnh (scrollTop = 0) -> Load thêm
    if (scrollTop === 0 && hasMore && !loadingMore) {
      // Lưu lại chiều cao hiện tại trước khi data mới ập vào
      const previousScrollHeight = scrollHeight;

      onLoadMore?.();

      // Đợi data mới map xong, cuộn trả lại đúng vị trí cũ
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop =
            containerRef.current.scrollHeight - previousScrollHeight;
        }
      }, 50);
    }
  };

  const scrollToBottom = (behavior: "auto" | "smooth" = "smooth") => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // ======================================================
  // 🚀 EFFECT 1: VÀO PHÒNG LẦN ĐẦU → SCROLL XUỐNG ĐÁY
  // ======================================================
  // PHẢI DÙNG useLayoutEffect (không phải useEffect)!
  //
  // Lý do:
  // - useEffect chạy SAU KHI browser paint
  //   → Browser đã vẽ messages với scrollTop = 0 (tin nhắn 1)
  //   → Sau đó mới scroll xuống đáy
  //   → User thấy "phóng nhanh từ tin 1 tới tin cuối" 👎
  //
  // - useLayoutEffect chạy TRƯỚC KHI browser paint (synchronous)
  //   → Set scrollTop xong rồi browser mới vẽ
  //   → User không bao giờ thấy trạng thái trung gian 👍
  // ======================================================
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || messages.length === 0) return;
    if (!isFirstLoadRef.current) return;

    // Set scrollTop trực tiếp = instant tuyệt đối, không có animation
    container.scrollTop = container.scrollHeight;
    isFirstLoadRef.current = false;

    // 💡 Ghi lại ID tin nhắn cuối để EFFECT 2 không bị nhầm là "có tin mới realtime"
    const lastMessage = messages[messages.length - 1];
    lastMessageIdRef.current = lastMessage?.id ?? null;
  }, [messages]);

  const prevMessagesLengthRef = useRef(messages.length);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || messages.length === 0) return;
    if (isFirstLoadRef.current) return;

    const lastMessage = messages[messages.length - 1];
    const isMyMessage = lastMessage?.user_id === user?.id;

    // Chỉ tính là có tin nhắn mới nếu độ dài mảng tăng lên
    const hasNewMessage = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    if (!hasNewMessage) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 400;

    // 1. NẾU MÌNH LÀ NGƯỜI GỬI HOẶC ĐANG Ở GẦN ĐÁY -> CUỘN NGAY
    if (isMyMessage || isNearBottom) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      setUnreadCount(0); // Reset bộ đếm khi đã cuộn xuống
    } else {
      // 2. NẾU ĐANG XEM TIN CŨ (KHÔNG Ở ĐÁY) -> TĂNG BỘ ĐẾM
      setUnreadCount((prev) => prev + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return {
    containerRef,
    showScrollDown,
    handleScroll,
    scrollToBottom: () => scrollToBottom("smooth"),
    unreadCount,
  };
};
