import { Search } from "lucide-react";

const ListFriend = () => {
  // Dữ liệu bạn bè mẫu
  const friends = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      status: "Đang hoạt động",
      online: true,
      lastMessage: "Chào bạn, khỏe không?",
    },
    {
      id: 2,
      name: "Trần Thị B",
      status: "Offline",
      online: false,
      lastMessage: "Hẹn gặp lại sau nhé",
    },
    {
      id: 3,
      name: "Lê Văn C",
      status: "Đang nhập...",
      online: true,
      lastMessage: "Mình đang xem...",
    },
    {
      id: 4,
      name: "Phạm Thị D",
      status: "Online",
      online: true,
      lastMessage: "Cảm ơn bạn nhiều!",
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      status: "Offline",
      online: false,
      lastMessage: "Đã gửi ảnh cho bạn",
    },
    {
      id: 6,
      name: "Vũ Thị F",
      status: "Đang hoạt động",
      online: true,
      lastMessage: "Ok luôn bạn ơi",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-sage/20 dark:border-sage/10">
      {/* Header Search */}
      <div className="px-4 py-4 bg-linear-to-r from-white/50 to-sage-lighter/20 dark:from-gray-800/50 dark:to-forest-lighter/10">
        <h1 className="text-xl font-bold bg-linear-to-r from-forest to-matcha dark:from-mint dark:to-matcha bg-clip-text text-transparent">
          Bạn bè
        </h1>
        <div className="mt-3 flex items-center gap-2 bg-sage-lighter/50 dark:bg-gray-800/50 px-3 py-2 rounded-xl border border-sage/30 dark:border-sage/20 focus-within:border-matcha dark:focus-within:border-mint focus-within:ring-1 focus-within:ring-matcha dark:focus-within:ring-mint transition-all duration-200">
          <Search className="size-4 text-sage dark:text-matcha-light" />
          <input
            type="text"
            placeholder="Tìm kiếm bạn bè..."
            className="bg-transparent outline-none text-sm w-full text-foreground dark:text-matcha-light placeholder:text-sage/60 dark:placeholder:text-sage/40"
          />
        </div>
      </div>

      {/* List Friend */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-sage-lighter/30 dark:hover:bg-forest-lighter/20 group"
          >
            {/* Avatar với trạng thái online */}
            <div className="relative">
              <div className="size-11 rounded-full bg-linear-to-br from-forest to-matcha shadow-md group-hover:shadow-lg transition-shadow" />
              {friend.online && (
                <span className="absolute bottom-0 right-0 size-3 bg-matcha dark:bg-mint rounded-full ring-2 ring-white dark:ring-gray-800 animate-pulse" />
              )}
            </div>

            {/* Thông tin */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground dark:text-matcha-light group-hover:text-forest dark:group-hover:text-mint transition-colors">
                  {friend.name}
                </span>
                <span className="text-[10px] text-sage dark:text-sage-light">
                  {friend.online ? "● Vừa xong" : "○ 2 giờ trước"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`text-xs ${
                    friend.online
                      ? "text-matcha dark:text-mint"
                      : "text-sage dark:text-sage-light"
                  }`}
                >
                  {friend.status}
                </span>
                <span className="text-xs text-sage/50 dark:text-sage/30">
                  •
                </span>
                <span className="text-xs text-sage dark:text-sage-light truncate max-w-35">
                  {friend.lastMessage}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer - tổng số bạn bè */}
      <div className="px-4 py-2 text-center border-t border-sage/20 dark:border-sage/10 bg-white/30 dark:bg-gray-800/30">
        <span className="text-xs text-sage dark:text-sage-light">
          {friends.length} bạn bè • {friends.filter((f) => f.online).length}{" "}
          đang hoạt động
        </span>
      </div>
    </div>
  );
};

export default ListFriend;
