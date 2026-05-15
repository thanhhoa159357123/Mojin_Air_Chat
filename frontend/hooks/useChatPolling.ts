import { useEffect } from "react";
import { useChatStore } from "@/stores/useChatStore";

export const useChatPolling = (selectedFriend: any) => {
  const fetchMessages = useChatStore((state) => state.fetchMessages);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (selectedFriend) {
      const type = selectedFriend.type || "private";
      fetchMessages(selectedFriend.id, type);

      intervalId = setInterval(() => {
        const type = selectedFriend.type || "private";
        fetchMessages(selectedFriend.id, type);
      }, 3000); 
    } else {
      useChatStore.setState({ messages: [] });
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedFriend?.id, fetchMessages, selectedFriend?.type]);
};
