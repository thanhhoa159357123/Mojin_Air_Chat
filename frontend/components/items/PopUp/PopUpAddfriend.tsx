"use client";

import { useConversationStore } from "@/stores/useConversationStore";
import { useFriends } from "@/hooks/useFriends"; // 💡 Gọi Hook TanStack Query tổng lực
import { IConversation } from "@/types/conversation";
import { Loader2, Search, X } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface IPopUpAddFriend {
  onCloseAddFriend: () => void;
}

const PopUpAddfriend = ({ onCloseAddFriend }: IPopUpAddFriend) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const setSelectConversation = useConversationStore((state) => state.setSelectConversation);
  const currentConversations = useConversationStore((state) => state.conversations);

  // 💡 1. KÉO CÁC HÀM TÁC CHIẾN TỪ TANSTACK QUERY QUỐC DÂN
  const { addFriend, useSearchFriendsInfinite } = useFriends();

  // 💡 2. DEBOUNCE SEARCH THEO CÁCH SẠCH SẼ NHẤT
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 💡 3. TRIỆU HỒI LUỒNG TÌM KIẾM VÔ HẠN (Tự động kích hoạt khi debouncedSearch có chữ)
  const {
    data: searchData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isSearchLoading,
    error: searchError,
  } = useSearchFriendsInfinite(debouncedSearch);

  // Gom đống mảng phân trang của các page về thành 1 mảng phẳng duy nhất để map() ra UI
  const searchResults = searchData?.pages.flatMap((page) => page.data) || [];

  // Trạm thu phí tự động bằng tay
  const observerRef = useRef<HTMLDivElement | null>(null);

  // 💡 4. INTERSECTION OBSERVER BÂY GIỜ CHỈ CÒN ĐÚNG 1 NHIỆM VỤ: GỌI fetchNextPage()
  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage(); // Thần chú tự sang trang ngầm của TanStack Query
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCloseAddFriend}
        className="fixed inset-0 z-40 bg-black/20"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
        exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-112.5"
      >
        <div className="w-112.5 bg-card rounded-3xl shadow-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-border bg-secondary/50 flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-primary tracking-tight">Thêm bạn bè</h2>
            <div
              className="size-8 rounded-full bg-secondary flex items-center justify-center cursor-pointer hover:bg-accent transition-all"
              onClick={onCloseAddFriend}
            >
              <X className="size-4 text-primary" />
            </div>
          </div>

          <div className="p-6">
            {/* Search bar */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Tìm theo username hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border border-border rounded-2xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
              {isSearchLoading && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-primary animate-spin" />
              )}
            </div>

            {/* Results List */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4 px-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Gợi ý cho bác</p>
                <span className="text-[10px] bg-secondary text-primary px-2 py-0.5 rounded-full font-bold">
                  {searchResults.length} người
                </span>
              </div>

              {searchError && (
                <p className="text-sm text-red-500 px-1 mb-2">{(searchError as Error).message}</p>
              )}

              <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((user) => {
                      const renderActionButton = () => {
                        switch (Number(user.friendship_status)) {
                          case 1: // Đã là bạn bè
                            return (
                              <button
                                onClick={() => {
                                  // Tìm phòng thật chat lịch sử
                                  const realRoom = currentConversations.find((c) =>
                                    c.participants?.some((p) => p.id === user.id)
                                  );

                                  if (realRoom) {
                                    setSelectConversation(realRoom);
                                  } else {
                                    // Bạn mới chưa chat bao giờ -> Fake nhẹ cấu trúc phòng thật gửi xuống
                                    const fallbackRoom: IConversation = {
                                      id: user.id,
                                      type: "private",
                                      label: user.full_name,
                                      participants: [user],
                                      updated_at: new Date().toISOString(),
                                    };
                                    setSelectConversation(fallbackRoom);
                                  }
                                  onCloseAddFriend();
                                }}
                                className="px-4 py-2 bg-secondary text-primary hover:bg-accent border border-border text-[11px] font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                              >
                                Nhắn tin
                              </button>
                            );

                          case 0: // Đang chờ kết bạn
                            return (
                              <button
                                disabled
                                className="px-4 py-2 bg-muted text-muted-foreground text-[11px] font-bold rounded-xl opacity-70 cursor-not-allowed"
                              >
                                Đang chờ...
                              </button>
                            );

                          default: // Chưa có quan hệ -> Gọi mutate addFriend từ TanStack Query
                            return (
                              <button
                                onClick={() => addFriend(user.id)}
                                className="px-4 py-2 bg-primary text-primary-foreground text-[11px] font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                              >
                                Kết bạn
                              </button>
                            );
                        }
                      };

                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-accent transition-all border border-transparent hover:border-border group"
                        >
                          <div className="flex items-center gap-3">
                            {user?.avatar ? (
                              <div className="w-11 h-11 size-11 aspect-square rounded-full overflow-hidden shadow-sm ring-2 ring-background shrink-0 relative">
                                <Image
                                  src={user.avatar}
                                  alt="avatar"
                                  width={44}
                                  height={44}
                                  className="w-full h-full object-cover shrink-0 block"
                                />
                              </div>
                            ) : (
                              <div className="w-11 h-11 size-11 aspect-square rounded-full bg-primary shadow-sm ring-2 ring-background flex items-center justify-center text-primary-foreground font-bold text-sm uppercase shrink-0">
                                {user?.first_name?.substring(0, 2) || "U"}
                              </div>
                            )}

                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                {user.full_name}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-medium">
                                @{user.username}
                              </span>
                            </div>
                          </div>

                          {renderActionButton()}
                        </div>
                      );
                    })}

                    {/* Trạm thu phí tự động của TanStack */}
                    <div ref={observerRef} className="h-10 flex justify-center items-center mt-2">
                      {isFetchingNextPage && (
                        <Loader2 className="size-5 text-primary animate-spin" />
                      )}
                    </div>
                  </>
                ) : (
                  debouncedSearch.trim() !== "" && !isSearchLoading && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Không tìm thấy anh hào nào mang tên này.
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PopUpAddfriend;