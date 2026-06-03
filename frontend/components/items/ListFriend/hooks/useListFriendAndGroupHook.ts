import { useConversationHook } from "@/hooks/useConversationHook";
import { useConversationStore } from "@/stores/useConversationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";
import { IConversation } from "@/types/conversation";

export const useListFriendAndGroupHook = () => {
  const user = useAuthStore((state) => state.user);

  // 💡 NGUỒN CHÂN LÝ DUY NHẤT: Chỉ lấy mảng conversations xịn từ Backend dội về
  const { conversations, addConversationToState } = useConversationHook();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const selectConversation = useConversationStore(
    (state) => state.selectConversation,
  );
  const setSelectConversation = useConversationStore(
    (state) => state.setSelectConversation,
  );
  const markConversationRead = useConversationStore(
    (state) => state.markConversationRead,
  );

  // Helper lấy đối phương trong phòng private
  const getPrivateChatPartner = (conversation: IConversation) => {
    if (conversation.type !== "private" || !conversation.participants)
      return null;
    return (
      conversation.participants.find(
        (p: { id: number }) => p.id !== user?.id,
      ) || null
    );
  };

  const getFilteredData = () => {
    let baseData = [...conversations];

    // 1. CHIA TAB SIÊU NHẸ NHÀNG (Đồng bộ theo data chuẩn BE của bác)
    if (activeTab === "friends") {
      baseData = conversations.filter((c) => c.type === "private");
    } else if (activeTab === "groups") {
      baseData = conversations.filter((c) => c.type === "group");
    }

    // 2. BỘ LỌC THEO Ô TÌM KIẾM
    const filtered = baseData.filter((item) => {
      if (!searchTerm.trim()) return true;
      const searchKey = searchTerm.toLowerCase();

      if (item.type === "group") {
        return (item.label || "").toLowerCase().includes(searchKey);
      } else {
        const partner = getPrivateChatPartner(item);
        if (!partner) return false;

        const firstName = (partner.first_name || "").toLowerCase();
        const lastName = (partner.last_name || "").toLowerCase();
        const fullName = `${lastName} ${firstName}`.trim();
        const username = (partner.username || "").toLowerCase();

        return (
          fullName.includes(searchKey) ||
          firstName.includes(searchKey) ||
          lastName.includes(searchKey) ||
          username.includes(searchKey)
        );
      }
    });

    // 3. SẮP XẾP ĐƯA TIN NHẮN MỚI LÊN ĐẦU (Theo chuẩn data snake_case 'last_message' trong ảnh console)
    return filtered.sort((a, b) => {
      const timeA = a.last_message?.created_at
        ? new Date(a.last_message.created_at).getTime()
        : new Date(a.updated_at || 0).getTime();

      const timeB = b.last_message?.created_at
        ? new Date(b.last_message.created_at).getTime()
        : new Date(b.updated_at || 0).getTime();

      return timeB - timeA;
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    getPrivateChatPartner,
    filteredData: getFilteredData(),
    selectConversation,
    setSelectConversation,
    markConversationRead,
    addConversationToState,
  };
};
