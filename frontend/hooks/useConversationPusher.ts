import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import { useAuthStore } from "@/stores/useAuthStore";
import { IConversation } from "@/types/conversation";
import { useConversationStore } from "@/stores/useConversationStore";

export const useConversationPusher = (
) => {
  const user = useAuthStore((state) => state.user);
  const addConversation = useConversationStore(
    (state) => state.addConversationToState,
  );
  const updateParticipantStatus = useConversationStore(
    (state) => state.updateParticipantStatus,
  );

  useEffect(() => {
    if (!user?.id) return;
    // 💡 SỬ DỤNG CHUNG pusherClient
    const userChannelName = `user.${user.id}`;
    const globalChannelName = "mojin-global-presence";

    const channel = pusherClient.subscribe(userChannelName);
    const globalChannel = pusherClient.subscribe(globalChannelName);

    channel.bind("new-group", (data: { conversation: IConversation }) => {
      addConversation(data.conversation);
    });

    // --- 💡 THÊM CÁI MỚI NÀY VÀO: LẮNG NGHE ON/OFF ---
    globalChannel.bind("user-status-changed", (data: { userId: number; status: "online" | "offline"; lastActiveAt?: string }) => {
      updateParticipantStatus(data.userId, data.status, data.lastActiveAt);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(userChannelName); // Đóng kênh cá nhân
      
      globalChannel.unbind_all();
      pusherClient.unsubscribe(globalChannelName);
    };
  }, [user?.id, addConversation, updateParticipantStatus]);
};
