"use client";

import { useFriends } from "@/hooks/useFriends";
import { Loader2, ShieldAlert, UserMinus, Users } from "lucide-react";
import Image from "next/image";
import React from "react";

const ListBlockUser = () => {
  // 💡 Lấy data và hàm handleUnblockUser từ Hook tổng lực của bác
  const {
    blockedFriends = [],
    isBlockedFriendsLoading,
    handleUnblockFriend,
  } = useFriends();

  // 1. TRẠNG THÁI LOADING: Đang bốc dữ liệu từ Backend Render lên
  if (isBlockedFriendsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <Loader2 className="size-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-medium animate-pulse">
          Đang tải danh sách đen...
        </p>
      </div>
    );
  }

  // 2. TRẠNG THÁI TRỐNG: Chưa chặn anh hào nào cả
  if (blockedFriends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 animate-fade-in">
        <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center ring-4 ring-muted/20">
          <Users className="size-6 opacity-40" />
        </div>
        <p className="text-sm font-semibold tracking-tight">
          Danh sách chặn trống trải
        </p>
        <p className="text-xs text-muted-foreground/60 max-w-48 text-center leading-relaxed">
          Nơi đây chưa có ai bị giam giữ. Hãy giữ thế giới hòa bình bác nhé!
        </p>
      </div>
    );
  }

  // 3. TRẠNG THÁI DANH SÁCH XỊN SÒ
  return (
    <div className="flex flex-col h-full w-full max-w-150 mx-auto p-2 custom-scrollbar">
      {/* Header nhẹ đầu danh sách */}
      <div className="flex items-center gap-2 px-2 mb-4">
        <ShieldAlert className="size-4 text-red-500" />
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Đang chặn ({blockedFriends.length})
        </h3>
      </div>

      {/* Wrapper cuộn danh sách */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {blockedFriends.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3.5 bg-card border border-border/60 hover:border-border rounded-2xl hover:bg-accent/40 transition-all duration-200 group shadow-sm"
          >
            {/* Khối bên Trái: Avatar & Info */}
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <div className="size-11 rounded-full overflow-hidden shadow-sm ring-2 ring-background shrink-0 relative">
                  <Image
                    src={user.avatar}
                    alt="avatar"
                    width={44}
                    height={44}
                    className="w-full h-full object-cover shrink-0 block"
                  />
                </div>
              ) : (
                <div className="size-11 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm flex items-center justify-center font-bold text-sm uppercase shrink-0">
                  {user?.first_name?.substring(0, 2) || "U"}
                </div>
              )}

              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {user.first_name} {user.last_name}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium truncate">
                  @{user.username}
                </span>
              </div>
            </div>

            {/* Khối bên Phải: Nút Hủy Chặn */}
            <button
              onClick={() => handleUnblockFriend(user.id)}
              className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-primary hover:bg-red-500 hover:text-white border border-border/80 text-[11px] font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm cursor-pointer group/btn"
            >
              <UserMinus className="size-3.5 group-hover/btn:animate-pulse" />
              <span>Hủy chặn</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListBlockUser;
