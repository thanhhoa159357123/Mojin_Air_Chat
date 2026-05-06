"use client";

import { IFriend } from "@/types/friend";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface IPopUpAddFriend {
  addFriend: (friendId: number) => Promise<void>;
  searchResults: IFriend[]; // Thay friends bằng searchResults
  searchFriends: (query: string, page?: number) => Promise<void>;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onCloseAddFriend: () => void;
}



const PopUpAddfriend = ({
  addFriend,
  searchResults,
  searchFriends,
  loading,
  error,
  hasMore,
  onCloseAddFriend,
}: IPopUpAddFriend) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

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
    <div className="w-112.5 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-sage/20 overflow-hidden animate-scale-in">
      {/* Header - Matcha style */}
      <div className="px-5 py-3 border-b border-sage/10 bg-linear-to-r from-matcha-lighter/20 to-sage-lighter/20 flex justify-between items-center">
        <h2 className="text-xl font-extrabold text-forest dark:text-mint tracking-tight">
          Thêm bạn bè
        </h2>
        <div
          className="size-8 rounded-full bg-sage-lighter/50 dark:bg-gray-700/50 flex items-center justify-center cursor-pointer hover:bg-sage-lighter dark:hover:bg-gray-700 transition-all"
          onClick={onCloseAddFriend}
        >
          <X className="size-4 text-forest dark:text-mint" />
        </div>
      </div>

      <div className="p-6">
        {/* Search bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-sage group-focus-within:text-forest transition-colors" />
          <input
            type="text"
            placeholder="Tìm theo username hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-matcha-lighter/10 dark:bg-gray-900/40 border border-sage/20 rounded-2xl outline-none focus:border-forest dark:focus:border-mint focus:ring-2 focus:ring-forest/10 transition-all text-sm"
          />
          {loading && page === 1 && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-forest animate-spin" />
          )}
        </div>

        {/* Results List */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4 px-1">
            <p className="text-[11px] font-bold text-sage dark:text-sage-light uppercase tracking-widest">
              Gợi ý cho bác
            </p>
            <span className="text-[10px] bg-matcha-lighter dark:bg-matcha-dark/30 text-forest dark:text-mint px-2 py-0.5 rounded-full font-bold">
              {searchResults?.length || 0} người
            </span>
          </div>

          {error && <p className="text-sm text-red-500 px-1 mb-2">{error}</p>}

          <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {searchResults && searchResults.length > 0 ? (
              <>
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-matcha-lighter/20 dark:hover:bg-forest-lighter/10 transition-all border border-transparent hover:border-sage/10 group"
                  >
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="avatar"
                          className="size-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="size-11 rounded-full bg-linear-to-br from-forest to-matcha shadow-sm ring-2 ring-white dark:ring-gray-700" />
                      )}

                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground group-hover:text-forest dark:group-hover:text-mint transition-colors">
                          {user.full_name}
                        </span>
                        <span className="text-[11px] text-sage dark:text-matcha-light font-medium">
                          @{user.username}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => addFriend(user.id)}
                      className="px-4 py-2 bg-forest dark:bg-mint text-white text-[11px] font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-forest/20 cursor-pointer"
                    >
                      Kết bạn
                    </button>
                  </div>
                ))}

                {/* Trạm thu phí: Cắm cờ ở đáy danh sách */}
                {hasMore && (
                  <div
                    ref={observerRef}
                    className="h-10 flex justify-center items-center mt-2"
                  >
                    {loading && (
                      <Loader2 className="size-5 text-forest animate-spin" />
                    )}
                  </div>
                )}
              </>
            ) : (
              searchTerm.trim() !== "" &&
              !loading && (
                <p className="text-center text-sm text-sage mt-4">
                  Không tìm thấy anh hào nào mang tên này.
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopUpAddfriend;
