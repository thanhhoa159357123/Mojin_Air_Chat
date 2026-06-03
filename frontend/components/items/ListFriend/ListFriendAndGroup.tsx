"use client";

import { useConversationPusher } from "@/hooks/useConversationPusher";
import { useAuthStore } from "@/stores/useAuthStore";
import { IConversation } from "@/types/conversation";
import { User as UserIcon, Users } from "lucide-react";
import Header from "./items/Header";
import { useListFriendAndGroupHook } from "./hooks/useListFriendAndGroupHook";

interface ListFriendProps {
  onToggleAddFriend: () => void;
  onToggleCreateGroup: () => void;
}

const ListFriendAndGroup = ({
  onToggleAddFriend,
  onToggleCreateGroup,
}: ListFriendProps) => {
  // 💡 GỌN GÀNG: Chỉ lấy những biến thực sự cần thiết từ Hook tối ưu mới
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
    addConversationToState,
  } = useListFriendAndGroupHook();

  const user = useAuthStore((state) => state.user);

  // Lắng nghe Pusher để tự động cập nhật danh sách phòng chat realtime
  useConversationPusher((newConv: IConversation) => {
    addConversationToState(newConv);
  });

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-lg border border-border">
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
          console.log("partner: ", partner);

          // 🌟 TÊN HIỂN THỊ CHUẨN XỊN (Không lo lỗi bốc partner)
          const displayName = isGroup
            ? item.label || "Nhóm chưa đặt tên"
            : partner
              ? partner.full_name ||
                `${partner.last_name || ""} ${partner.first_name || ""}`.trim()
              : "Người dùng Mojin";

          // 💡 KEY ĐỘC NHẤT ĐƠN GIẢN: Đập chết lỗi trùng lặp DOM render
          const itemUniqueKey = `${item.type}-${item.id}`;

          // 💡 NGUỒN CHÂN LÝ: Backend trả về chuẩn đét snake_case là last_message
          const msgObj = item.last_message;
          const unreadCount = Number(item.unread_count || 0);

          // Trạng thái active khi click chọn phòng chat
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
              className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? "bg-primary/20 text-primary font-medium"
                  : "hover:bg-accent text-foreground"
              }`}
            >
              {/* Khối Avatar */}
              <div className="relative shrink-0">
                <div className="size-10 rounded-full bg-primary flex items-center justify-center shadow-md overflow-hidden">
                  {isGroup ? (
                    <Users className="size-5 text-primary-foreground" />
                  ) : partner?.avatar ? (
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

                {/* 🟢 CHẤM ONLINE THẦN THÁNH */}
                {!isGroup && partner?.status === "online" && (
                  <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full ring-2 ring-card shadow-sm animate-in fade-in zoom-in duration-300"></span>
                )}
              </div>

              {/* Khối Thông tin Text */}
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

                {/* Đoạn xử lý tin nhắn cuối cùng Realtime */}
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-xs truncate mt-0.5 ${unreadCount > 0 ? "text-foreground font-semibold" : "opacity-70"}`}
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

                  {/* Badge số tin nhắn chưa đọc */}
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
      </div>
    </div>
  );
};

export default ListFriendAndGroup;
