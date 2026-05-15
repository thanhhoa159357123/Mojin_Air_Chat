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
  { id: "all", label: "Tất cả" },
  { id: "friends", label: "Bạn bè" },
  { id: "groups", label: "Nhóm" },
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
    <div className="px-4 py-4 bg-background">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Bạn bè</h1>
        <div className="relative">
          <button
            onClick={() => setShowMenuFriend(!showMenuFriend)}
            className="p-2 hover:bg-muted rounded-full transition-colors cursor-pointer text-muted-foreground"
          >
            <Ellipsis className="w-6 h-6" />
          </button>
          {/* PopUp Menu */}
          <AnimatePresence>
            {showMenuFriend && (
              <>
                {/* Overlay ngầm để click ra ngoài thì đóng menu */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenuFriend(false)}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-card border border-border shadow-xl rounded-2xl p-2 z-20 overflow-hidden"
                >
                  {/* Option: Thêm bạn mới */}
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

                  {/* Option: Tạo nhóm */}
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
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 bg-muted px-3 py-2 rounded-xl border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-200">
        <Search className="w-5 h-5 text-muted-foreground font-bold" />
        <input
          type="text"
          placeholder="Tìm kiếm bạn bè..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground/50"
        />
      </div>
      <div className="flex mt-3 gap-1 bg-muted/50 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Header;
