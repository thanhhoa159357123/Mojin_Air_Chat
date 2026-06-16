"use client";

import { useConversationPusher } from "@/hooks/useConversationPusher";
import { useAuthStore } from "@/stores/useAuthStore";
import { IConversation } from "@/types/conversation";
import { User as UserIcon, Users } from "lucide-react";
import Header from "./items/Header";
import { useListFriendAndGroupHook } from "./hooks/useListFriendAndGroupHook";
import Image from "next/image";

interface ListFriendProps {
  onToggleAddFriend: () => void;
  onToggleCreateGroup: () => void;
}

const ListFriendAndGroup = ({
  onToggleAddFriend,
  onToggleCreateGroup,
}: ListFriendProps) => {
  const {
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    getPrivateChatPartner,
    filteredData,
    selectConversation,
    setSelectConversation,
    markConversationRead,
  } = useListFriendAndGroupHook();

  const user = useAuthStore((state) => state.user);

  useConversationPusher();

  return (
    // 💡 TỐI ƯU: Đảm bảo sidebar co giãn mượt mà theo cha, bg-card sạch sẽ
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-lg border border-border overflow-hidden w-full transition-[width,flex] duration-300">
      {/* Khung tìm kiếm và Tabs bộ lọc */}
      <Header
        onToggleAddFriend={onToggleAddFriend}
        onToggleCreateGroup={onToggleCreateGroup}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Vùng hiển thị danh sách phòng chat */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filteredData.map((item) => {
          const isGroup = item.type === "group";
          const partner = getPrivateChatPartner(item);

          const displayName = isGroup
            ? item.label || "Nhóm chưa đặt tên"
            : partner
              ? partner.full_name ||
                `${partner.last_name || ""} ${partner.first_name || ""}`.trim()
              : "Người dùng Mojin";

          const itemUniqueKey = `${item.type}-${item.id}`;
          const msgObj = item.last_message;
          const unreadCount = Number(item.unread_count || 0);

          const isSelected =
            selectConversation?.id === item.id &&
            selectConversation?.type === item.type;

          return (
            <div
              key={itemUniqueKey}
              onClick={() => {
                setSelectConversation(item);
                if (unreadCount > 0) {
                  markConversationRead(item.id).catch(() => {});
                }
              }}
              // 💡 TỐI ƯU: Căn giữa items khi sidebar bị thu nhỏ (`justify-center md:justify-start`)
              className={`flex items-center justify-center xl:justify-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? "bg-primary/20 text-primary font-medium"
                  : "hover:bg-accent text-foreground"
              }`}
              title={displayName} // Hiện tooltip tên khi rê chuột vào chế độ thu nhỏ
            >
              {/* Khối Avatar (LUÔN HIỆN) */}
              <div className="relative shrink-0">
                <div className="size-10 rounded-full bg-primary flex items-center justify-center shadow-md overflow-hidden ring-2 ring-transparent transition-all">
                  {isGroup ? (
                    <Users className="size-5 text-primary-foreground" />
                  ) : partner?.avatar ? (
                    <Image
                      src={partner.avatar}
                      alt="avatar"
                      width={44}
                      height={44}
                      className="w-full h-full object-cover shrink-0 block"
                    />
                  ) : (
                    <span className="text-primary-foreground font-bold text-xs uppercase">
                      {partner?.first_name?.substring(0, 2) || (
                        <UserIcon className="size-4" />
                      )}
                    </span>
                  )}
                </div>

                {/* 🟢 CHẤM ONLINE THẦN THÁNH - Đứng im bất động bóng bẩy */}
                {!isGroup && partner?.status === "online" && (
                  <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full ring-2 ring-card shadow-sm transition-all"></span>
                )}
              </div>

              {/* Khối Thông tin Text - 💡 TỐI ƯU: Ẩn sạch khi màn hình nhỏ (`hidden xl:block`) */}
              <div className="hidden xl:block flex-1 overflow-hidden min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-sm truncate">
                    {displayName}
                  </span>

                  {activeTab !== "friends" && (
                    <span className="text-[10px] opacity-60 shrink-0">
                      {msgObj?.created_at
                        ? new Date(msgObj.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  )}
                </div>

                {/* Đoạn xử lý tin nhắn cuối cùng Realtime */}
                {activeTab !== "friends" ? (
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p
                      className={`text-xs truncate ${unreadCount > 0 ? "text-foreground font-semibold" : "opacity-70"}`}
                    >
                      {msgObj
                        ? (() => {
                            const isMyLastMsg = msgObj.user_id === user?.id;
                            let contentStr = msgObj.content;

                            if (msgObj.type === "mixed") {
                              try {
                                const parsed = JSON.parse(msgObj.content);
                                contentStr =
                                  parsed.text ||
                                  (parsed.images?.length
                                    ? "[Hình ảnh]"
                                    : "[Tệp tin]");
                              } catch {
                                contentStr = msgObj.content;
                              }
                            } else if (msgObj.type === "image") {
                              contentStr = "[Hình ảnh]";
                            } else if (msgObj.type === "file") {
                              contentStr = "[Tệp tin]";
                            }

                            if (isMyLastMsg) return `Bạn: ${contentStr}`;
                            if (isGroup) {
                              const senderInGroup = item.participants?.find(
                                (p) => p.id === msgObj.user_id,
                              );
                              return `${senderInGroup?.first_name || "Thành viên"}: ${contentStr}`;
                            }
                            return contentStr;
                          })()
                        : "Chưa có tin nhắn"}
                    </p>

                    {unreadCount > 0 && (
                      <span className="min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                ) : (
                  partner?.username && (
                    <p className="text-xs truncate opacity-40 mt-0.5">
                      @{partner.username}
                    </p>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListFriendAndGroup;
