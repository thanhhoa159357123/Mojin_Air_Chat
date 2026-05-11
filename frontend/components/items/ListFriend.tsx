import { IFriend } from "@/types/friend";
import { Plus, Search } from "lucide-react";

interface ListFriendProps {
  onToggleAddFriend: () => void;
  friends: IFriend[]; // Thêm prop này để nhận danh sách bạn bè từ parent component
  selectedFriend: IFriend | null; // Thêm prop này để nhận bạn bè đang được chọn từ parent component
  setSelectedFriend: (friend: IFriend | null) => void; // Thêm prop này để cập nhật bạn bè đang được chọn lên parent component
}

const ListFriend = ({
  onToggleAddFriend,
  friends,
  selectedFriend,
  setSelectedFriend,
}: ListFriendProps) => {
  console.log(friends);
  return (
    <div className="flex flex-col h-full bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-sage/20 dark:border-sage/10">
      {/* Header Search */}
      <div className="px-4 py-4 bg-linear-to-r from-white/50 to-sage-lighter/20 dark:from-gray-800/50 dark:to-forest-lighter/10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold bg-linear-to-r from-forest to-matcha dark:from-mint dark:to-matcha bg-clip-text text-transparent">
            Bạn bè
          </h1>
          <div
            className="text-matcha-light bg-matcha-darker transition duration-300 ease-in-out hover:text-matcha-dark hover:bg-sage-light px-1 py-1 rounded-full cursor-pointer"
            onClick={onToggleAddFriend}
          >
            <Plus className="w-6 h-6" />
          </div>
        </div>
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
            onClick={() => setSelectedFriend(friend)} // Cập nhật bạn bè đang được chọn khi click vào item
            className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
              selectedFriend?.id === friend.id
                ? "bg-matcha/20 dark:bg-mint/20"
                : "hover:bg-sage-lighter/30 dark:hover:bg-forest-lighter/20"
            } group`}
          >
            {/* Avatar với trạng thái online */}
            <div className="relative group cursor-pointer">
              <div className="size-10 rounded-full bg-linear-to-br from-forest to-matcha shadow-lg ring-4 ring-white/50 dark:ring-gray-800/50 flex items-center justify-center">
                <span className="text-white font-semibold text-sm uppercase">
                  {friend?.first_name?.[0] || ""}
                  {friend?.last_name?.[0] || ""}
                </span>
              </div>
            </div>

            {/* Thông tin */}
            <div className="flex-1 overflow-hidden">
              {" "}
              {/* Thêm overflow-hidden để truncate chạy chuẩn */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground dark:text-matcha-light group-hover:text-forest dark:group-hover:text-mint transition-colors truncate">
                  {friend.full_name}
                </span>
                {/* Hiển thị thời gian từ Backend gửi về */}
                <span className="text-[10px] text-sage dark:text-sage-light whitespace-nowrap ml-2">
                  {friend.last_message?.time || ""}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {/* LOGIC HIỂN THỊ TIN NHẮN CUỐI CÙNG */}
                <span className="text-xs text-sage dark:text-sage-light truncate max-w-[200px]">
                  {friend.last_message ? (
                    <>
                      {/* Nếu user_id trong tin nhắn cuối là ID của mình thì hiện chữ "Bạn: " */}
                      {/* Lưu ý: Thay 'user?.id' bằng biến ID người dùng đang đăng nhập của bác nhé */}
                      {friend.last_message.user_id !== friend.id ? (
                        <span className="font-semibold text-forest/70 dark:text-mint/70">
                          Bạn:{" "}
                        </span>
                      ) : null}
                      {friend.last_message.content}
                    </>
                  ) : (
                    <span className="opacity-50 italic">Chưa có tin nhắn</span>
                  )}
                </span>

                {/* Giữ lại cái chấm online nếu bác muốn, hoặc bỏ qua vì đã có ở avatar */}
                {friend.status && (
                  <span className="size-1.5 bg-matcha rounded-full animate-pulse ml-1" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer - tổng số bạn bè */}
      <div className="px-4 py-2 text-center border-t border-sage/20 dark:border-sage/10 bg-white/30 dark:bg-gray-800/30">
        <span className="text-xs text-sage dark:text-sage-light">
          {friends.length} bạn bè • {friends.filter((f) => f.status).length}{" "}
          đang hoạt động
        </span>
      </div>
    </div>
  );
};

export default ListFriend;
