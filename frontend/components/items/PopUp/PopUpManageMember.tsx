"use client";

import { useConversations } from "@/hooks/useConversations";
import { useFriends } from "@/hooks/useFriends";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConversationStore } from "@/stores/useConversationStore";
import { Check, Search, UserMinus, X } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface PopUpManageMemberProps {
  onClose: () => void;
}

const PopUpManageMember = ({ onClose }: PopUpManageMemberProps) => {

  const {
    handleAddParticipants,
    handleRemoveParticipants,
    handleFetchParticipants
  } = useConversations();
  const { friends } = useFriends();
  const user = useAuthStore((state) => state.user);
  const selectConversation = useConversationStore(
    (state) => state.selectConversation,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const existingMemberIds = useMemo(() => {
    const ids = new Set<number>();
    selectConversation?.participants?.forEach((p) => ids.add(p.id));
    if (user?.id) ids.add(user.id);
    return ids;
  }, [selectConversation, user?.id]);

  const availableFriends = friends.filter((f) => !existingMemberIds.has(f.id));
  const filteredFriends = availableFriends.filter((f) =>
    f.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleFriend = (id: number) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleAdd = () => {
    if (!selectConversation) return;
    if (selectedFriends.length === 0) return;

    handleAddParticipants(selectConversation.id, selectedFriends);
    onClose();
  };

  const isGroup = selectConversation?.type === "group";

  useEffect(() => {
    if (!selectConversation?.id || !isGroup) return;
    handleFetchParticipants(selectConversation.id);
  }, [handleFetchParticipants, isGroup, selectConversation?.id]);

  const members = selectConversation?.participants || [];

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
              Quản lý thành viên
            </h2>
            <div
              className="size-8 rounded-full bg-secondary flex items-center justify-center cursor-pointer hover:bg-accent transition-all"
              onClick={onClose}
            >
              <X className="size-4 text-primary" />
            </div>
          </div>

          <div className="p-6 space-y-4">
            {!isGroup ? (
              <p className="text-sm text-muted-foreground">
                Chỉ có thể quản lý thành viên trong nhóm.
              </p>
            ) : (
              <>
                {/* Danh sách thành viên */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase px-1">
                    Thành viên ({members.length})
                  </label>
                  <div className="flex flex-col space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {members.length > 0 ? (
                      members.map((member) => {
                        const isMe = member.id === user?.id;
                        const displayName =
                          member.full_name ||
                          `${member.last_name} ${member.first_name}`.trim();

                        return (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 rounded-2xl border border-border bg-background/40"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {member.avatar ? (
                                  <Image
                                    src={member.avatar}
                                    alt="avatar"
                                    className="rounded-full object-cover"
                                    width={36}
                                    height={36}
                                  />
                                ) : (
                                  <div className="size-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs uppercase">
                                    {displayName[0] || "U"}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground">
                                  {displayName}
                                  {isMe ? " (Bạn)" : ""}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  @{member.username || "mojin_user"}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                handleRemoveParticipants(
                                  selectConversation.id,
                                  [member.id],
                                )
                              }
                              disabled={isMe}
                              className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              title={
                                isMe
                                  ? "Không thể tự xoá chính mình"
                                  : "Đuổi khỏi nhóm"
                              }
                            >
                              <UserMinus className="size-4" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-xs text-muted-foreground py-3 italic">
                        Chưa có thành viên nào.
                      </p>
                    )}
                  </div>
                </div>

                {/* Ô search */}
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

                {/* List bạn bè */}
                <div className="flex flex-col space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredFriends.length > 0 ? (
                    filteredFriends.map((friend) => {
                      const isSelected = selectedFriends.includes(friend.id);
                      return (
                        <div
                          key={friend.id}
                          onClick={() => toggleFriend(friend.id)}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-accent transition-all border border-transparent hover:border-border group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {friend.avatar ? (
                                <Image
                                  src={friend.avatar}
                                  alt="avatar"
                                  className="rounded-full object-cover"
                                  width={40}
                                  height={40}
                                />
                              ) : (
                                <div className="size-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs uppercase">
                                  {friend.full_name[0]}
                                </div>
                              )}
                              {isSelected && (
                                <div className="absolute inset-0 bg-primary/40 rounded-full flex items-center justify-center">
                                  <Check className="size-5 text-white stroke-[3px]" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-foreground">
                                {friend.full_name}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                @{friend.username}
                              </span>
                            </div>
                          </div>

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
                      Không còn bạn nào để thêm...
                    </p>
                  )}
                </div>

                {/* Nút Submit */}
                <button
                  onClick={handleAdd}
                  disabled={selectedFriends.length === 0}
                  className="w-full py-4 bg-primary text-primary-foreground font-extrabold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider cursor-pointer"
                >
                  Thêm thành viên ({selectedFriends.length})
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PopUpManageMember;
