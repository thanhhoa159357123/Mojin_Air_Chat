"use client";

import { useConversations } from "@/hooks/useConversations";
import { useFriends } from "@/hooks/useFriends";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConversationStore } from "@/stores/useConversationStore";
import { IFriend } from "@/types/friend";
import { Check, Search, UserMinus, X } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useMemo, useState } from "react";

interface PopUpManageMemberProps {
  onClose: () => void;
}

const PopUpManageMember = ({ onClose }: PopUpManageMemberProps) => {
  const { handleAddParticipants, handleRemoveParticipants, participants } =
    useConversations();
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

  const members = participants || [];

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/30"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[85vh] bg-card rounded-2xl border border-matcha-light/20 dark:border-matcha-dark/30 shadow-xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-matcha-light/20 dark:border-matcha-dark/30">
            <h2 className="text-base font-semibold text-foreground">
              Quản lý thành viên
            </h2>
            <button
              onClick={onClose}
              className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          {!isGroup ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Chỉ có thể quản lý thành viên trong nhóm.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Danh sách thành viên */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Thành viên ({members.length})
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {members.length > 0 ? (
                    members.map((member: IFriend) => {
                      const isMe = member.id === user?.id;
                      const actorRecord = members.find(
                        (m: IFriend) => m.id === user?.id,
                      );
                      const amICreator = actorRecord?.pivot?.role === "creator";

                      const displayName =
                        member.full_name ||
                        member.first_name + " " + member.last_name ||
                        "Người dùng";

                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/40 dark:bg-muted/20"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {member.avatar ? (
                              <Image
                                src={member.avatar}
                                alt="avatar"
                                className="size-9 rounded-full object-cover shrink-0"
                                width={36}
                                height={36}
                              />
                            ) : (
                              <div className="size-9 rounded-full bg-matcha/10 dark:bg-matcha/20 flex items-center justify-center shrink-0">
                                <span className="text-forest dark:text-matcha-light font-bold text-xs uppercase">
                                  {displayName[0] || "U"}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium text-foreground truncate">
                                  {displayName}
                                  {isMe && (
                                    <span className="text-muted-foreground">
                                      {" "}
                                      (Bạn)
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-matcha/10 dark:bg-matcha/20 text-forest dark:text-matcha-light shrink-0">
                                  {member.pivot?.role === "creator"
                                    ? "Trưởng nhóm"
                                    : "Thành viên"}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground truncate">
                                @{member.username || "mojin_user"}
                              </p>
                            </div>
                          </div>

                          {(amICreator || isMe) && (
                            <button
                              onClick={() => {
                                handleRemoveParticipants(
                                  selectConversation.id,
                                  [member.id],
                                );
                                if (isMe) onClose();
                              }}
                              className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 shrink-0 ml-2"
                              title={isMe ? "Rời nhóm" : "Xóa thành viên"}
                            >
                              <UserMinus className="size-4" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-xs text-muted-foreground py-4">
                      Chưa có thành viên nào.
                    </p>
                  )}
                </div>
              </div>

              {/* Thêm thành viên */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Thêm thành viên ({selectedFriends.length})
                </label>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tìm bạn bè..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/40 dark:bg-muted/20 border border-matcha-light/20 dark:border-matcha-dark/30 rounded-xl text-sm outline-none focus:border-forest dark:focus:border-matcha-light placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* Friends list */}
                <div className="space-y-1 max-h-52 overflow-y-auto">
                  {filteredFriends.length > 0 ? (
                    filteredFriends.map((friend) => {
                      const isSelected = selectedFriends.includes(friend.id);
                      return (
                        <div
                          key={friend.id}
                          onClick={() => toggleFriend(friend.id)}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/60 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                              {friend.avatar ? (
                                <Image
                                  src={friend.avatar}
                                  alt="avatar"
                                  className="size-9 rounded-full object-cover"
                                  width={36}
                                  height={36}
                                />
                              ) : (
                                <div className="size-9 rounded-full bg-matcha/10 dark:bg-matcha/20 flex items-center justify-center">
                                  <span className="text-forest dark:text-matcha-light font-bold text-xs uppercase">
                                    {friend.full_name[0]}
                                  </span>
                                </div>
                              )}
                              {isSelected && (
                                <div className="absolute inset-0 bg-forest/60 dark:bg-matcha/60 rounded-full flex items-center justify-center">
                                  <Check className="size-4 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {friend.full_name}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                @{friend.username}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                              isSelected
                                ? "bg-forest dark:bg-matcha-light border-forest dark:border-matcha-light"
                                : "border-muted-foreground/30"
                            }`}
                          >
                            {isSelected && (
                              <Check className="size-3 text-white" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-xs text-muted-foreground py-4">
                      Không còn bạn nào để thêm.
                    </p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleAdd}
                disabled={selectedFriends.length === 0}
                className="w-full py-3 bg-forest dark:bg-matcha text-white font-semibold rounded-xl hover:bg-forest-dark dark:hover:bg-matcha-dark disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Thêm ({selectedFriends.length})
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default PopUpManageMember;
