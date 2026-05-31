import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import { useAuthStore } from "@/stores/useAuthStore";
import { IConversation } from "@/types/conversation";
import { useConversationStore } from "@/stores/useConversationStore";

export const useConversationPusher = (
  addConversation: (newConv: IConversation) => void,
) => {
  const user = useAuthStore((state) => state.user);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalChannel.bind("user-status-changed", (data: any) => {
      console.log("🟢 Có người đổi trạng thái:", data);
      // Data BE trả về có các key khớp với constructor trong Laravel Event
      updateParticipantStatus(data.userId, data.status, data.lastActiveAt);
    });

    return () => {
      channel.unbind_all();
      // channel.unsubscribe();
      globalChannel.unbind_all();
      // globalChannel.unsubscribe();
    };
  }, [user?.id, addConversation, updateParticipantStatus]);
};
