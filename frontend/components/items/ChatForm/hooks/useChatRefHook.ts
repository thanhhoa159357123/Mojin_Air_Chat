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

  // 💡 CHÂN LÝ: Chỉ cần 2 biến này để khống chế toàn bộ Pagination!
  const isFetchingOlderRef = useRef<boolean>(false);
  const distanceFromBottomRef = useRef<number>(0);

  const currentRoomIdRef = useRef<number | undefined>(undefined);
  const isFirstLoadRef = useRef<boolean>(true);

  // 🌟 EFFECT 0: Đổi phòng chat là clear não
  useEffect(() => {
    currentRoomIdRef.current = selectedFriendId;
    isFetchingOlderRef.current = false;
    isFirstLoadRef.current = true;
  }, [selectedFriendId]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    setShowScrollDown(!isNearBottom);

    // CHẠM ĐỈNH -> GỌI API LOAD CŨ
    if (
      scrollTop <= 10 &&
      hasMore &&
      !loadingMore &&
      !isFetchingOlderRef.current
    ) {
      isFetchingOlderRef.current = true;

      // 🚀 BÍ THUẬT: Tính toán khoảng cách hiện tại so với ĐÁY của khung chat
      distanceFromBottomRef.current = scrollHeight - scrollTop;

      // Khóa Smooth Scroll để né giật lùi
      container.style.scrollBehavior = "auto";

      onLoadMore?.();
    }
  };

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // 🚀 EFFECT 1: NGƯNG ĐỌNG THỜI GIAN VÀ NEO DOM ĐỨNG IM TRƯỚC KHI VẼ
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !isFetchingOlderRef.current) return;

    // Lấy chiều cao mới ngay khi React vừa đắp DOM vào
    const newScrollHeight = container.scrollHeight;

    // Tính toán vị trí neo chuẩn pixel
    const targetScrollTop = newScrollHeight - distanceFromBottomRef.current;

    // 💡 CHIÊU THỨC ÉP CƯỠNG BỨC TẠI HAI KHUNG HÌNH LIÊN TIẾP
    container.scrollTop = targetScrollTop;

    const jq = requestAnimationFrame(() => {
      container.scrollTop = targetScrollTop; // Khóa chết phát nữa triệt tiêu hoàn toàn cú giật ngược từ 1 về 50
      isFetchingOlderRef.current = false;
      container.style.scrollBehavior = "smooth";
    });

    return () => cancelAnimationFrame(jq);
  }, [messages]); // 💡 Chỉ chạy khi mảng tin nhắn thực sự thay đổi/

  // 🌟 EFFECT 2: XỬ LÝ VÀO PHÒNG MỚI HOẶC CÓ TIN NHẮN REALTIME ĐẾN
  useEffect(() => {
    const container = containerRef.current;
    if (!container || messages.length === 0 || isFetchingOlderRef.current)
      return;

    const lastMessage = messages[messages.length - 1];
    const isMyMessage = lastMessage?.user_id === user?.id;

    // setTimeout bọc thép để chắc chắn ảnh/DOM nhét xong mới đẩy xuống đáy
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        if (isFetchingOlderRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 400;

        if (isFirstLoadRef.current) {
          container.style.scrollBehavior = "auto";
          container.scrollTo({ top: container.scrollHeight });
          container.style.scrollBehavior = "smooth";
          isFirstLoadRef.current = false;
        } else if (isMyMessage || isNearBottom) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [messages, selectedFriendId, user?.id]);

  return {
    containerRef,
    showScrollDown,
    handleScroll,
    scrollToBottom,
  };
};
