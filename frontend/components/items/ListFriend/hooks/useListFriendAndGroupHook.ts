import { useConversationHook } from "@/hooks/useConversationHook";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConversationStore } from "@/stores/useConversationStore";
import { useFriendStore } from "@/stores/useFriendStore";
import { IConversation } from "@/types/conversation";
import { useMemo, useState } from "react";

export const useListFriendAndGroupHook = () => {
  const user = useAuthStore((state) => state.user);
  const friends = useFriendStore((state) => state.friends);
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

  const friendIdSet = useMemo(
    () => new Set(friends.map((friend) => friend.id)),
    [friends],
  );

  const getPrivateChatPartner = (conversation: IConversation) => {
    if (conversation.type !== "private" || !conversation.participants)
      return null;
    return conversation.participants.find((p) => p.id !== user?.id) || null;
  };

  const getFilteredData = () => {
    let baseData: IConversation[] = [];

    // 1. Hóa trang danh bạ bạn bè thành chuẩn IConversation để UI dễ đọc
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedFriends = friends.map((f: any) => ({
      id: f.id,
      type: "private",
      participants: [f],
      is_virtual: true,
      last_message: f.last_msg_content
        ? {
            content: f.last_msg_content,
            type: f.last_msg_type,
            user_id: f.last_msg_user_id,
            created_at: f.last_msg_created_at,
          }
        : null,
      updated_at: f.last_msg_created_at || null,
      unread_count: 0,
    })) as IConversation[];

    // 2. BỘ LỌC TRÙNG LẶP (DEDUPLICATION)
    // Tìm ra ID của những người bạn ĐÃ CÓ TRONG LỊCH SỬ CHAT
    const groupConversations = conversations.filter((c) => c.type === "group");
    const friendPrivateConversations = conversations
      .filter((c) => c.type === "private")
      .filter((c) => {
        const partner = getPrivateChatPartner(c);
        return partner && friendIdSet.has(partner.id);
      });

    const chattedPartnerIds = new Set(
      friendPrivateConversations
        .map((c) => c.participants?.find((p) => p.id !== user?.id)?.id)
        .filter(Boolean),
    );

    // Lọc ra những người bạn MỚI KẾT BẠN, CHƯA TỪNG NHẮN TIN
    const unchattedFriends = mappedFriends.filter((mf) => {
      const partnerId = mf.participants?.[0]?.id;
      return partnerId && !chattedPartnerIds.has(partnerId);
    });

    // 3. PHÂN LUỒNG DỮ LIỆU VÀO TỪNG TAB CHUẨN XÁC
    if (activeTab === "all") {
      // Tab All: Hiện Lịch sử chat (Nhóm + Cá nhân) + Bạn bè chưa chat
      baseData = [
        ...groupConversations,
        ...friendPrivateConversations,
        ...unchattedFriends,
      ];
    } else if (activeTab === "friends") {
      // Tab Bạn bè: Hiện Lịch sử chat Cá nhân + Bạn bè chưa chat
      baseData = [...friendPrivateConversations, ...unchattedFriends];
    } else if (activeTab === "groups") {
      // Tab Nhóm: Chỉ hiện Lịch sử chat Nhóm
      baseData = groupConversations;
    }

    // 4. BỘ LỌC THEO Ô TÌM KIẾM
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
        const fullName = partner.full_name
          ? partner.full_name.toLowerCase()
          : `${lastName} ${firstName}`;
        const username = (partner.username || "").toLowerCase();

        return (
          fullName.includes(searchKey) ||
          firstName.includes(searchKey) ||
          lastName.includes(searchKey) ||
          username.includes(searchKey)
        );
      }
    });

    // 5. SẮP XẾP ĐƯA TIN NHẮN MỚI NHẤT LÊN ĐẦU
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
    friendIdSet,

    getPrivateChatPartner,
    filteredData: getFilteredData(),
    selectConversation,
    setSelectConversation,
    markConversationRead,

    addConversationToState,
  };
};
