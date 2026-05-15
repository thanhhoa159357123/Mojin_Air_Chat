// hooks/useFriendPolling.ts
import { useEffect } from "react";
import { useFriendStore } from "@/stores/useFriendStore";
import { useConversationStore } from "@/stores/useConversationStore";

export const useFriendPolling = () => {
  const { getFriends } = useFriendStore();
  const { fetchConversations } = useConversationStore();

  useEffect(() => {
    getFriends();
    fetchConversations();

    const id = setInterval(() => {
      getFriends();
      fetchConversations();
    }, 3000);

    return () => clearInterval(id);
  }, [getFriends, fetchConversations]);
};
