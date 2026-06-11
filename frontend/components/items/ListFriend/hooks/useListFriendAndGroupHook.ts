import { useConversationHook } from "@/hooks/useConversationHook";
import { useConversationStore } from "@/stores/useConversationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";
import { IConversation } from "@/types/conversation";
import { useFriendHook } from "@/hooks/useFriendHook"; // 💡 1. Gọi lại hook danh bạ thần thánh

export const useListFriendAndGroupHook = () => {
  const user = useAuthStore((state) => state.user);

  // 💡 NGUỒN CHÂN LÝ INBOX
  const { conversations } = useConversationHook();
  
  // 💡 2. KÉO DANH SÁCH BẠN BÈ XỊN VỀ ĐÂY BÁC ƠI
  const { friends } = useFriendHook(); 

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
    // 💡 3. XỬ LÝ RIÊNG TAB "BẠN BÈ" - BIẾN THÀNH DANH BẠ THUẦN TÚY (A-Z)
    if (activeTab === "friends") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const directoryData = (friends || []).map((f: any) => ({
        id: f.id, // Lấy tạm ID User làm ID phòng ảo
        type: "private",
        label: f.full_name || `${f.last_name || ""} ${f.first_name || ""}`.trim(),
        updated_at: f.updated_at || null,
        participants: [f], // Nhét nó vào mảng participant để component render avatar/status ngon lành
        // last_message: undefined, // Danh bạ thuần túy thì giấu preview tin nhắn đi
        unread_count: 0,
      })) as IConversation[];

      // Bộ lọc tìm kiếm cho tab Bạn bè
      return directoryData
        .filter((partner) => {
          if (!searchTerm.trim()) return true;
          const searchKey = searchTerm.toLowerCase();
          return partner.label.toLowerCase().includes(searchKey);
        })
        .sort((a, b) => a.label.localeCompare(b.label)); // Sắp xếp A-Z chuẩn danh bạ điện thoại
    }

    // 💡 4. XỬ LÝ CÁC TAB CÒN LẠI (ALL VÀ GROUPS) THEO LỊCH SỬ INBOX
    let baseData = [...conversations];

    if (activeTab === "groups") {
      baseData = conversations.filter((c) => c.type === "group");
    }

    // Bộ lọc tìm kiếm cho tab All và Group
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

    // Sắp xếp đưa phòng có tương tác mới nhất lên đầu (Cho tab All và Group)
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
  };
};