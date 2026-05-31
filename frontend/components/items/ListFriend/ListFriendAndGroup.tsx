"use client";

import { useFriendStore } from "@/stores/useFriendStore";
import { useEffect, useMemo, useState } from "react";
import Header from "./items/Header";
import { useConversationHook } from "@/hooks/useConversationHook";
import { Users, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { IConversation } from "@/types/conversation";
import { IMessage } from "@/types/message";
import { useConversationStore } from "@/stores/useConversationStore";
import { useConversationPusher } from "@/hooks/useConversationPusher";
import { useListFriendAndGroupHook } from "./hooks/useListFriendAndGroupHook";

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
    friendIdSet,

    getPrivateChatPartner,
    filteredData,
    selectConversation,
    setSelectConversation,
    markConversationRead,

    addConversationToState,
  } = useListFriendAndGroupHook();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!selectConversation || selectConversation.type !== "private") return;

    const partner = getPrivateChatPartner(selectConversation);
    if (partner && !friendIdSet.has(partner.id)) {
      setSelectConversation(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendIdSet, selectConversation, setSelectConversation, user?.id]);

  useConversationPusher((newConv: IConversation) => {
    addConversationToState(newConv); // Chỉ 1 dòng duy nhất!
  });

  const displayList = filteredData;

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-lg border border-border">
      <Header
        onToggleAddFriend={onToggleAddFriend}
        onToggleCreateGroup={onToggleCreateGroup}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {displayList.map((item) => {
          const isGroup = item.type === "group";
          const partner = getPrivateChatPartner(item);

          // 🌟 TÍNH TOÁN TÊN HIỂN THỊ CHUẨN XỊN NGAY TẠI ĐÂY
          const displayName = isGroup
            ? item.label || "Nhóm chưa đặt tên"
            : partner
              ? partner.full_name ||
                `${partner.last_name} ${partner.first_name}`
              : "Người dùng Mojin";

          // TẠO KEY ĐỘC NHẤT: Tránh trùng lặp id giữa user và conversation
          const itemUniqueKey = isGroup
            ? `group-${item.id}`
            : `private-${item.id}-${partner?.id ?? "unknown"}-${item.last_message?.created_at || item.updated_at || "none"}`;

          const msgObj = (item.last_message ??
            (item as { lastMessage?: IMessage }).lastMessage) as
            | IMessage
            | undefined;
          const unreadCount = Number(item.unread_count || 0);
          const isPrivateSelected =
            selectConversation?.type === "private" &&
            !isGroup &&
            selectConversation.id === item.id &&
            Boolean(selectConversation.is_virtual) === Boolean(item.is_virtual);

          return (
            <div
              key={itemUniqueKey}
              onClick={() => {
                setSelectConversation(item);
                if (item.unread_count && item.unread_count > 0) {
                  markConversationRead(item.id).catch(() => {});
                }
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                (
                  isGroup
                    ? selectConversation?.id === item.id &&
                      selectConversation.type === "group"
                    : isPrivateSelected
                )
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-accent text-foreground"
              }`}
            >
              {/* Avatar Logic */}
              <div className="relative shrink-0">
                <div className="size-10 rounded-full bg-primary flex items-center justify-center shadow-md overflow-hidden">
                  {isGroup ? (
                    <Users className="size-5 text-primary-foreground" />
                  ) : partner?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={partner.avatar}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-foreground font-bold text-xs uppercase">
                      {partner?.first_name?.substring(0, 2) || (
                        <UserIcon className="size-4" />
                      )}
                    </span>
                  )}
                </div>

                {/* 💡 CỤC CHẤM ONLINE THẦN THÁNH NẰM Ở ĐÂY BÁC ƠI */}
                {!isGroup && partner?.status === "online" && (
                  <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full ring-2 ring-card shadow-sm animate-in fade-in zoom-in duration-300"></span>
                )}
              </div>

              {/* Info Logic */}
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm truncate">
                    {displayName}
                  </span>
                  <span className="text-[10px] opacity-60 shrink-0">
                    {msgObj?.created_at
                      ? new Date(msgObj.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>

                {/* 💡 ĐOẠN XỬ LÝ TIN NHẮN CUỐI CÙNG REAL-TIME SIÊU MƯỢT */}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs truncate opacity-70 mt-0.5">
                    {msgObj
                      ? (() => {
                          const isMyLastMsg = msgObj.user_id === user?.id;

                          // Phân rã nội dung hiển thị cho tin nhắn hỗn hợp hoặc file tĩnh
                          let contentStr = msgObj.content;
                          if (msgObj.type === "mixed") {
                            try {
                              const parsed = JSON.parse(msgObj.content);
                              contentStr =
                                parsed.text ||
                                (parsed.images?.length
                                  ? "[Hình ảnh]"
                                  : "[Tệp tin]");
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            } catch (e) {
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
              </div>
            </div>
          );
        })}

        {displayList.length === 0 && (
          <div className="text-center py-10 opacity-40 text-xs italic">
            Không tìm thấy kết quả nào...
          </div>
        )}
      </div>
    </div>
  );
};

export default ListFriendAndGroup;
