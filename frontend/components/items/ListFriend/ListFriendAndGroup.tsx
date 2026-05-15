import { useFriendStore } from "@/stores/useFriendStore";
import { useState } from "react";
import Header from "./items/Header";
import { useConversationHook } from "@/hooks/useConversationHook";
import { useFriendHook } from "@/hooks/useFriendHook";
import { Users } from "lucide-react";

interface ListFriendProps {
  onToggleAddFriend: () => void;
  onToggleCreateGroup: () => void;
}

const ListFriend = ({
  onToggleAddFriend,
  onToggleCreateGroup,
}: ListFriendProps) => {
  const { friends } = useFriendHook();
  const { conversations } = useConversationHook(); // Giả sử đây là danh sách các cuộc hội thoại/nhóm
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const selectedFriend = useFriendStore((state) => state.selectedFriend);
  const setSelectedFriend = useFriendStore((state) => state.setSelectedFriend);

  // LOGIC LỌC DỮ LIỆU
  const getFilteredData = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let baseData: any[] = [];

    if (activeTab === "all") {
      // Tab Tất cả: Hiện cả bạn bè và nhóm (conversations)
      // Lưu ý: Bác nên dùng Set hoặc Map nếu muốn tránh trùng lặp giữa friend và conversation 1-1
      baseData = [
        ...friends,
        ...conversations.filter((c) => c.type === "group"),
      ];
    } else if (activeTab === "friends") {
      baseData = friends;
    } else if (activeTab === "groups") {
      baseData = conversations.filter((c) => c.type === "group");
    }

    // Sau khi lọc theo tab, lọc tiếp theo SearchTerm
    const filtered = baseData.filter((item) => {
      const name = item.full_name || item.label || ""; // label cho group, full_name cho friend
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Sắp xếp đưa tin nhắn mới nhất lên đầu tiên
    return filtered.sort((a, b) => {
      // Xác định thời gian của từng item
      let timeA = new Date(0).getTime();
      let timeB = new Date(0).getTime();

      if (a.type === "group" && a.updated_at) {
        // Conversation / Group
        timeA = new Date(a.updated_at).getTime();
      } else if (a.last_message?.created_at) {
        // Friend có tin nhắn
        timeA = new Date(a.last_message.created_at).getTime();
      }

      if (b.type === "group" && b.updated_at) {
        // Conversation / Group
        timeB = new Date(b.updated_at).getTime();
      } else if (b.last_message?.created_at) {
        // Friend có tin nhắn
        timeB = new Date(b.last_message.created_at).getTime();
      }

      // Giảm dần (mới nhất lên đầu)
      return timeB - timeA;
    });
  };

  const displayList = getFilteredData();

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
          // Xác định xem đây là Friend hay Group để hiển thị Icon/Avatar cho đúng
          const isGroup = item.type === "group";
          const displayName = isGroup ? item.label : item.full_name;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedFriend(item)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                selectedFriend?.id === item.id
                  ? "bg-primary/20"
                  : "hover:bg-accent"
              }`}
            >
              {/* Avatar Logic */}
              <div className="size-10 rounded-full bg-primary flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-xs uppercase">
                  {isGroup ? (
                    <Users className="size-5" />
                  ) : (
                    displayName?.substring(0, 2)
                  )}
                </span>
              </div>

              {/* Info Logic */}
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm truncate">
                    {displayName}
                  </span>
                  <span className="text-[10px] opacity-60">
                    {item.last_message?.time}
                  </span>
                </div>
                <p className="text-xs truncate opacity-70">
                  {item.last_message?.content || "Chưa có tin nhắn"}
                </p>
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

export default ListFriend;
