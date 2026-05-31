"use client";

import { useConversationHook } from "@/hooks/useConversationHook";
import { useFriendHook } from "@/hooks/useFriendHook";
import { Check, Search, Users, X } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

interface PopUpCreateGroupProps {
  onClose: () => void;
}

const PopUpCreateGroup = ({
  onClose,
}: PopUpCreateGroupProps) => {
  const { handleCreateConversation } = useConversationHook();
  const { friends } = useFriendHook();
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);

  // Tuyệt chiêu lọc bạn bè tại chỗ (Client-side filter)
  const filteredFriends = friends.filter((f) =>
    f.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleFriend = (id: number) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleCreate = () => {
    const finalName = groupName.trim() || "Những kẻ mộng mơ";
    handleCreateConversation(finalName, selectedFriends);
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/20"
      />

      {/* Modal chính */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
        exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-112.5"
      >
        <div className="w-112.5 bg-card rounded-3xl shadow-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-border bg-secondary/50 flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-primary tracking-tight">
              Tạo nhóm mới
            </h2>
            <div
              className="size-8 rounded-full bg-secondary flex items-center justify-center cursor-pointer hover:bg-accent transition-all"
              onClick={onClose}
            >
              <X className="size-4 text-primary" />
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Input tên nhóm */}
            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase px-1">
                Tên nhóm (tùy chọn)
              </label>
              <div className="relative group">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Những kẻ mộng mơ"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border border-border rounded-2xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Ô search tìm bạn bè trong list */}
            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase px-1">
                Thêm thành viên ({selectedFriends.length})
              </label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm bạn bè muốn thêm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-2xl outline-none focus:border-primary transition-all text-sm"
                />
              </div>
            </div>

            {/* List bạn bè để tích chọn */}
            <div className="flex flex-col space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {filteredFriends.length > 0 ? (
                filteredFriends.map((user) => {
                  const isSelected = selectedFriends.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => toggleFriend(user.id)}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-accent transition-all border border-transparent hover:border-border group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt="avatar"
                              className="rounded-full object-cover"
                              width={40}
                              height={40}
                            />
                          ) : (
                            <div className="size-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs uppercase">
                              {user.full_name[0]}
                            </div>
                          )}
                          {/* Dấu tích khi đã chọn - overlay lên avatar */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/40 rounded-full flex items-center justify-center">
                              <Check className="size-5 text-white stroke-[3px]" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">
                            {user.full_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            @{user.username}
                          </span>
                        </div>
                      </div>

                      {/* Custom Checkbox UI */}
                      <div
                        className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30 bg-transparent"
                        }`}
                      >
                        {isSelected && (
                          <Check className="size-3.5 text-primary-foreground stroke-[4px]" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-xs text-muted-foreground py-4 italic">
                  Không tìm thấy bạn nào để thêm...
                </p>
              )}
            </div>

            {/* Nút Submit */}
            <button
              onClick={handleCreate}
              disabled={selectedFriends.length < 2}
              className="w-full py-4 bg-primary text-primary-foreground font-extrabold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider cursor-pointer"
            >
              Phê duyệt nhóm ({selectedFriends.length})
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PopUpCreateGroup;
