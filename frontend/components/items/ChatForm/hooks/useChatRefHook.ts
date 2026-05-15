import { useChatHook } from "@/hooks/useChatHook";
import { useFriendHook } from "@/hooks/useFriendHook";
import { useEffect, useRef, useState } from "react";

export const useRefHook = () => {
  const { selectedFriend } = useFriendHook();
  const { messages } = useChatHook(selectedFriend);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Hiện icon nếu cuộn lên trên cách đáy hơn 150px
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    setShowScrollDown(!isNearBottom);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 2. Auto scroll khi có tin nhắn mới: CHỈ scroll nếu user đang ở sát đáy
  useEffect(() => {
    if (!containerRef.current || !scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 250;

    if (isNearBottom) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 3. Luôn scroll xuống đáy khi vừa đổi bạn trò chuyện
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView();
    }
  }, [selectedFriend?.id]);

  return {
    scrollRef,
    containerRef,
    showScrollDown,
    handleScroll,
    scrollToBottom,
  };
};
