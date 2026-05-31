"use client";

import { useFriendHook } from "@/hooks/useFriendHook";
import { useConversationStore } from "@/stores/useConversationStore";
import { useFriendStore } from "@/stores/useFriendStore";
import { IConversation } from "@/types/conversation";
import { Loader2, Search, X } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface IPopUpAddFriend {
  addFriend: (friendId: number) => Promise<void>;
  searchFriends: (query: string, page?: number) => Promise<void>;
  onCloseAddFriend: () => void;
}

const PopUpAddfriend = ({
  addFriend,
  searchFriends,
  onCloseAddFriend,
}: IPopUpAddFriend) => {
  const searchResults = useFriendStore((state) => state.searchResults);
  const { loading, error, hasMore } = useFriendHook();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const setSelectConversation = useConversationStore(
    (state) => state.setSelectConversation,
  );

  // Trạm thu phí: Dùng để check xem người dùng đã cuộn tới đáy chưa
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Tuyệt chiêu 1: Debounce search (luôn reset về trang 1 khi gõ từ khóa mới)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        setPage(1); // Gõ cái mới là phải múc lại từ trang 1
        searchFriends(searchTerm, 1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchFriends]);

  // Tuyệt chiêu 2: Intersection Observer xử lý cuộn vô cực
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Nếu cục ref lòi lên màn hình + còn data + không phải đang loading
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          searchFriends(searchTerm, nextPage); // Phập trang tiếp theo
        }
      },
      { threshold: 1.0 }, // Cuộn thấy 100% cục ref mới trigger
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, page, searchTerm, searchFriends]);

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
        <div className="w-112.5 bg-card rounded-3xl shadow-2xl border border-border overflow-hidden animate-scale-in">
          {/* Header - Matcha style */}
          <div className="px-5 py-3 border-b border-border bg-secondary/50 flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-primary tracking-tight">
              Thêm bạn bè
            </h2>
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
              {loading && page === 1 && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-primary animate-spin" />
              )}
            </div>

            {/* Results List */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4 px-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Gợi ý cho bác
                </p>
                <span className="text-[10px] bg-secondary text-primary px-2 py-0.5 rounded-full font-bold">
                  {searchResults?.length || 0} người
                </span>
              </div>

              {error && (
                <p className="text-sm text-red-500 px-1 mb-2">{error}</p>
              )}

              <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {searchResults && searchResults.length > 0 ? (
                  <>
                    {searchResults.map((user) => {
                      // Bí thuật dọn dẹp nút bấm động ở đây cho sạch code
                      const renderActionButton = () => {
                        switch (user.friendship_status) {
                          case 1: // Đã là bạn bè -> Hiện nút Nhắn tin (Style Outline/Secondary sang chảnh)
                            return (
                              <button
                                onClick={() => {
                                  // 💡 BƯỚC 1: Lấy danh sách phòng chat hiện tại từ kho tổng
                                  const conversationStore =
                                    useConversationStore.getState();
                                  const currentConversations =
                                    conversationStore.conversations;

                                  // 💡 BƯỚC 2: Mò xem trong lịch sử chat có phòng nào chứa khứa này chưa
                                  const realRoom = currentConversations.find(
                                    (c) =>
                                      c.participants?.some(
                                        (p) => p.id === user.id,
                                      ),
                                  );

                                  if (realRoom) {
                                    // 🎉 CÓ PHÒNG THẬT: Chọn luôn phòng thật để giữ nguyên tin nhắn cũ
                                    setSelectConversation(realRoom);
                                  } else {
                                    // 👻 CHƯA CÓ PHÒNG THẬT: Bạn mới tinh chưa chat bao giờ -> Tạo phòng ảo tạm thời
                                    const fakeRoom: IConversation = {
                                      id: user.id, // Tạm thời lấy ID khứa này làm ID phòng ảo
                                      type: "private",
                                      label: user.full_name,
                                      participants: [user],
                                      updated_at: new Date().toISOString(),
                                    };
                                    setSelectConversation(fakeRoom);
                                  }

                                  onCloseAddFriend(); // Đóng Pop-up
                                }}
                                className="px-4 py-2 bg-secondary text-primary hover:bg-accent border border-border text-[11px] font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                              >
                                Nhắn tin
                              </button>
                            );

                          case 0: // Đang chờ kết bạn -> Hiện nút Mờ (Disabled) tránh bấm lại
                            return (
                              <button
                                disabled
                                className="px-4 py-2 bg-muted text-muted-foreground text-[11px] font-bold rounded-xl opacity-70 cursor-not-allowed"
                              >
                                Đang chờ...
                              </button>
                            );

                          default: // Chưa có mối quan hệ (null) -> Nút Kết bạn gốc (Màu nổi bật thu hút)
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
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt="avatar"
                                className="rounded-full object-cover"
                                width={44}
                                height={44}
                              />
                            ) : (
                              <div className="size-11 rounded-full bg-primary shadow-sm ring-2 ring-background" />
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

                          {/* Gọi hàm render nút bấm ra đây, sạch sẽ như lau như ly */}
                          {renderActionButton()}
                        </div>
                      );
                    })}

                    {/* Trạm thu phí: Cắm cờ ở đáy danh sách */}
                    {hasMore && (
                      <div
                        ref={observerRef}
                        className="h-10 flex justify-center items-center mt-2"
                      >
                        {loading && (
                          <Loader2 className="size-5 text-primary animate-spin" />
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  searchTerm.trim() !== "" &&
                  !loading && (
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
