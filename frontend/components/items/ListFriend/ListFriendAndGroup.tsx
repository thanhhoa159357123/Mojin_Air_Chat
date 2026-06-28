/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useConversationPusher } from "@/hooks/useConversationPusher";
import { Users } from "lucide-react";
import Header from "./items/Header";
import { useListFriendAndGroupHook } from "./hooks/useListFriendAndGroupHook";
import ListBlockUser from "./items/ListBlockUser";
import FriendItem from "./items/FriendItem";
import ConversationItem from "./items/ConversationItem";
import { IFriend } from "@/types/friend";
import { IConversation } from "@/types/conversation";
import { useAuthStore } from "@/stores/useAuthStore";

interface ListFriendProps {
  onToggleAddFriend: () => void;
  onToggleCreateGroup: () => void;
}

const ListFriendAndGroup = ({ onToggleAddFriend, onToggleCreateGroup }: ListFriendProps) => {
  const {
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    filteredData,
    selectConversation,
    setSelectConversation,
    handleMarkConversationRead,
    handleSelectFriendFromDirectory,
    isLoadingFriends,
    showBlockedUsers,
    handleShowBlockedUsers,
    activePopupId,
    handleTogglePopup,
    handleClosePopup,
  } = useListFriendAndGroupHook();
  const { user } = useAuthStore();

  useConversationPusher();

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-sm border border-border w-full transition-[width,flex] duration-300 relative">
      <Header
        onToggleAddFriend={onToggleAddFriend}
        onToggleCreateGroup={onToggleCreateGroup}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleShowBlockedUsers={handleShowBlockedUsers}
        showBlockedUsers={showBlockedUsers}
      />

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin">
        {showBlockedUsers ? (
          <ListBlockUser />
        ) : activeTab === "friends" && isLoadingFriends ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Đang tải danh bạ...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center">
              <Users className="size-6 opacity-40" />
            </div>
            <p className="text-sm font-medium">
              {activeTab === "friends" ? "Danh bạ trống" : "Không tìm thấy cuộc trò chuyện"}
            </p>
          </div>
        ) : (
          filteredData.map((dataItem: any) => {
            const isTabFriends = activeTab === "friends";

            // Tính toán trạng thái highlight chọn dòng
            const isSelected = isTabFriends
              ? selectConversation?.type === "private" &&
                (selectConversation?.id === dataItem.id || selectConversation?.participants?.[0]?.id === dataItem.id)
              : selectConversation?.id === dataItem.id && selectConversation?.type === dataItem.type;

            const itemUniqueKey = isTabFriends ? `friend-${dataItem.id}` : `${dataItem.type}-${dataItem.id}`;

            // 💡 PHÂN LUỒNG RENDER: Rõ ràng, tường minh, không gồng gánh logic chéo nhau
            if (isTabFriends) {
              return (
                <FriendItem
                  key={itemUniqueKey}
                  data={dataItem as IFriend}
                  isSelected={isSelected}
                  onClick={() => handleSelectFriendFromDirectory(dataItem as IFriend)}
                />
              );
            }

            return (
              <ConversationItem
                key={itemUniqueKey}
                data={dataItem as IConversation}
                isSelected={isSelected}
                isPopupOpen={activePopupId === dataItem.id}
                currentUserId={user?.id}
                onClick={() => {
                  setSelectConversation(dataItem as IConversation);
                  if (Number(dataItem.unread_count || 0) > 0) {
                    handleMarkConversationRead(dataItem.id);
                  }
                }}
                onTogglePopup={() => handleTogglePopup(dataItem.id)}
                onClosePopup={handleClosePopup}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default ListFriendAndGroup;