import {
  acceptFriend,
  addFriend,
  getFriendRequests,
  getFriends,
  searchFriends,
} from "@/services/friendService";
import { IFriendState } from "@/types/friend";
import { create } from "zustand";

export const useFriendStore = create<IFriendState>((set) => ({
  friends: [],
  searchResults: [],
  friendRequests: [],
  loading: false,
  loadingRequests: false,
  error: null,
  hasMore: false, // Khởi tạo ban đầu là false

  getFriends: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getFriends();
      set({ friends: response.data, loading: false });
    } catch (error: any) {
      set({ error: "Lỗi tải bạn bè rùi!", loading: false });
    }
  },

  searchFriends: async (query: string, page: number = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await searchFriends(query, page);
      set((state) => ({
        // Cuốn bí kíp: Nếu trang 1 thì reset mảng, trang > 1 thì rải mảng cũ cộng thêm mảng mới
        searchResults:
          page === 1 ? response.data : [...state.searchResults, ...response.data],
        hasMore: response.hasMore,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: "Toang rồi bác ơi! Lỗi gọi API.", loading: false });
    }
  },

  addFriend: async (friendId: number) => {
    try {
      await addFriend(friendId);
    } catch (error: any) {
      set({ error: "Thêm bạn thất bại. Thử lại nhé!" });
    }
  },

  fetchFriendRequests: async () => {
    set({ loadingRequests: true, error: null });
    try {
      const response = await getFriendRequests();
      set({ friendRequests: response.data, loadingRequests: false });
    } catch (error: any) {
      set({ error: "Lỗi tải thông báo rùi!", loadingRequests: false });
    }
  },

  acceptFriendRequest: async (friendId: number) => {
    try {
      await acceptFriend(friendId);
    } catch (error: any) {
      set({ error: "Chấp nhận bạn bè thất bại. Thử lại nhé!" });
    }
  },
}));
