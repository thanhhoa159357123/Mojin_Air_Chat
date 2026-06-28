"use client";

import { useConversationStore } from "@/stores/useConversationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";
import { IConversation } from "@/types/conversation";
import { useFriends } from "@/hooks/useFriends"; 
import { IFriend } from "@/types/friend";
import { useConversations } from "@/hooks/useConversations";

export const useListFriendAndGroupHook = () => {
  const user = useAuthStore((state) => state.user);

  const selectConversation = useConversationStore((state) => state.selectConversation);
  const setSelectConversation = useConversationStore((state) => state.setSelectConversation);
  const { conversations, handleMarkConversationRead } = useConversations();
  const { friends, isLoading: isLoadingFriends } = useFriends();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);

  // 💡 CHÌA KHÓA: Lưu ID của cuộc trò chuyện đang được click mở menu ba chấm
  const [activePopupId, setActivePopupId] = useState<string | number | null>(null);

  const handleShowBlockedUsers = () => setShowBlockedUsers(!showBlockedUsers);
  
  // Hàm đóng/mở linh hoạt theo ID
  const handleTogglePopup = (id: string | number) => {
    setActivePopupId((prev) => (prev === id ? null : id));
  };

  const handleClosePopup = () => setActivePopupId(null);

  const getPrivateChatPartner = (conversation: IConversation) => {
    if (conversation.type !== "private" || !conversation.participants) return null;
    return conversation.participants.find((p: { id: number }) => p.id !== user?.id) || null;
  };

  const handleSelectFriendFromDirectory = (friend: IFriend) => {
    const realRoom = conversations.find((c) => {
      if (c.type !== "private") return false;
      const partner = getPrivateChatPartner(c);
      return partner?.id === friend.id;
    });

    if (realRoom) {
      setSelectConversation(realRoom);
      if (Number(realRoom.unread_count || 0) > 0) {
        handleMarkConversationRead(realRoom.id);
      }
    } else {
      const fallbackRoom: IConversation = {
        id: friend.id,
        type: "private",
        label: friend.full_name,
        updated_at: new Date().toISOString(),
        participants: [friend],
        is_virtual: true,
      };
      setSelectConversation(fallbackRoom);
    }
  };

  const getFilteredData = () => {
    if (activeTab === "friends") {
      return (friends || [])
        .filter((f) => {
          if (!searchTerm.trim()) return true;
          const searchKey = searchTerm.toLowerCase();
          const fullName = f.full_name?.toLowerCase() || "";
          return fullName.includes(searchKey) || f.username?.toLowerCase().includes(searchKey);
        })
        .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
    }

    let baseData = [...conversations];
    if (activeTab === "groups") {
      baseData = conversations.filter((c) => c.type === "group");
    }

    const filtered = baseData.filter((item) => {
      if (!searchTerm.trim()) return true;
      const searchKey = searchTerm.toLowerCase();

      if (item.type === "group") {
        return (item.label || "").toLowerCase().includes(searchKey);
      } else {
        const partner = getPrivateChatPartner(item);
        if (!partner) return false;
        return (partner.full_name || "").toLowerCase().includes(searchKey) || (partner.username || "").toLowerCase().includes(searchKey);
      }
    });

    return filtered.sort((a, b) => {
      const timeA = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : new Date(a.updated_at || 0).getTime();
      const timeB = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : new Date(b.updated_at || 0).getTime();
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
    handleMarkConversationRead,
    handleSelectFriendFromDirectory,
    isLoadingFriends,
    showBlockedUsers,
    handleShowBlockedUsers,
    activePopupId, // Trả ID ra ngoài UI
    handleTogglePopup, // Trả hàm toggle ra ngoài UI
    handleClosePopup, // Trả hàm close ra ngoài UI
  };
};