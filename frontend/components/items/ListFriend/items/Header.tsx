import { Ellipsis, Search, UserPlus, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface HeaderProps {
  onToggleAddFriend: () => void;
  onToggleCreateGroup: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const tabs = [
  { id: "all", label: "Tất cả", shortLabel: "All" },
  { id: "friends", label: "Bạn bè", shortLabel: "Bạn" },
  { id: "groups", label: "Nhóm", shortLabel: "Nhóm" },
];

const Header = ({
  onToggleAddFriend,
  onToggleCreateGroup,
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
}: HeaderProps) => {
  const [showMenuFriend, setShowMenuFriend] = useState(false);

  return (
    <div className="px-3 py-4 bg-background border-b border-border transition-all relative">
      {/* Overlay ngầm toàn cục: Click ra ngoài bất kỳ đâu thì đóng menu (Dùng chung cho cả 2 chế độ to/nhỏ) */}
      <AnimatePresence>
        {showMenuFriend && (
          <div className="fixed inset-0 z-40" onClick={() => setShowMenuFriend(false)} />
        )}
      </AnimatePresence>

      {/* Hàng Tiêu đề & Menu ba chấm */}
      <div className="flex items-center justify-between gap-1">
        {/* CHẾ ĐỘ 1: MÀN HÌNH RỘNG (xl trở lên) */}
        <h1 className="text-lg font-bold text-primary truncate hidden xl:block">Bạn bè</h1>
        
        <div className="relative hidden xl:block z-50">
          <button
            onClick={() => setShowMenuFriend(!showMenuFriend)}
            className="p-1.5 hover:bg-muted rounded-full transition-colors cursor-pointer text-muted-foreground"
          >
            <Ellipsis className="w-5 h-5" />
          </button>
          
          {/* PopUp Menu cho màn hình TO */}
          <AnimatePresence>
            {showMenuFriend && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 mt-2 w-48 bg-card border border-border shadow-xl rounded-2xl p-2 overflow-hidden"
              >
                <button
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-200 cursor-pointer text-foreground"
                  onClick={() => {
                    onToggleAddFriend();
                    setShowMenuFriend(false);
                  }}
                >
                  <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  Thêm bạn mới
                </button>

                <button
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-200 cursor-pointer text-foreground"
                  onClick={() => {
                    onToggleCreateGroup();
                    setShowMenuFriend(false);
                  }}
                >
                  <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Users className="w-4 h-4" />
                  </div>
                  Tạo nhóm chat
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* CHẾ ĐỘ 2: MÀN HÌNH THU NHỎ/ZOOM (Dưới mốc xl) */}
        {/* 💡 BIẾN ĐỔI MA THUẬT: Biến cái khối icon tĩnh thành nút bấm mở Menu ngay tại trận! */}
        <div className="block xl:hidden relative w-full z-50">
          <button
            onClick={() => setShowMenuFriend(!showMenuFriend)}
            title="Menu tương tác"
            className="size-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary mx-auto transition-all cursor-pointer active:scale-95"
          >
            <Users className="w-5 h-5" />
          </button>

          {/* PopUp Menu thả xuống căn chính giữa hàng dọc dành riêng cho màn hình NHỎ */}
          <AnimatePresence>
            {showMenuFriend && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute left-1/2 -translate-x-1/2 mt-3 w-44 bg-card border border-border shadow-2xl rounded-2xl p-1.5"
              >
                <button
                  onClick={() => {
                    onToggleAddFriend();
                    setShowMenuFriend(false);
                  }}
                  className="flex flex-col items-center justify-center gap-1 w-full py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-all cursor-pointer text-xs font-semibold"
                >
                  <UserPlus className="w-4 h-4 text-primary" />
                  <span>Kết bạn</span>
                </button>
                
                <div className="h-px bg-border my-1 w-[80%] mx-auto" />

                <button
                  onClick={() => {
                    onToggleCreateGroup();
                    setShowMenuFriend(false);
                  }}
                  className="flex flex-col items-center justify-center gap-1 w-full py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-all cursor-pointer text-xs font-semibold"
                >
                  <Users className="w-4 h-4 text-primary" />
                  <span>Tạo nhóm</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Ô tìm kiếm - Ẩn khi nhỏ */}
      <div className="mt-3 hidden xl:flex items-center gap-2 bg-muted px-3 py-2 rounded-xl border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-200">
        <Search className="w-4 h-4 text-muted-foreground font-bold shrink-0" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent outline-none text-xs w-full text-foreground placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Cụm phân Tab */}
      <div className="flex mt-3 gap-0.5 bg-muted/50 p-1 rounded-xl justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 text-[10px] xl:text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer truncate text-center ${
              activeTab === tab.id
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="hidden xl:inline">{tab.label}</span>
            <span className="inline xl:hidden">{tab.shortLabel[0]}</span> 
          </button>
        ))}
      </div>
    </div>
  );
};

export default Header;