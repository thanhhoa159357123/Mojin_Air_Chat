import { extractErrorMessage } from "@/lib/errorHandler";
import {
  acceptFriend,
  addFriend,
  getFriendRequests,
  getFriends,
  rejectFriend,
  searchFriends,
} from "@/services/friendService";
import { IFriend, IFriendState } from "@/types/friend";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useFriendStore = create<IFriendState>()(
  persist(
    (set) => ({
      friends: [],
      searchResults: [],
      friendRequests: [],
      loading: false,
      loadingRequests: false,
      error: null,
      hasMore: false, // Khởi tạo ban đầu là false

      selectedFriend: null, // Khởi tạo selectedFriend là null

      /**
       * Sets the selected friend in the store.
       * @param {IFriend | null} friend - The friend to select, or null to clear the selection.
       */
      setSelectedFriend: (friend: IFriend | null) =>
        set({ selectedFriend: friend }), // Hàm để cập nhật selectedFriend

      /**
       * Fetches the current user's friends list.
       * Sets loading state to true while fetching, updates the friends list on success,
       * and sets an error message on failure.
       */
      getFriends: async () => {
        set({ loading: true, error: null });
        try {
          const friends = await getFriends();
          set({ friends: friends, loading: false });
        } catch (error: unknown) {
          const errorMessage = extractErrorMessage(
            error,
            "Đã có lỗi xảy ra khi tải danh mục.",
          );
          set({ error: errorMessage, loading: false });
        }
      },

      /**
       * Searches for friends based on a query string and page number.
       * Appends results to existing ones if page > 1, otherwise resets results.
       * @param {string} query - The search string to look up friends.
       * @param {number} [page=1] - The page number of the search results to fetch.
       */
      searchFriends: async (query: string, page: number = 1) => {
        set({ loading: true, error: null });
        try {
          const response = await searchFriends(query, page);
          set((state) => ({
            // Cuốn bí kíp: Nếu trang 1 thì reset mảng, trang > 1 thì rải mảng cũ cộng thêm mảng mới
            searchResults:
              page === 1
                ? response.data
                : [...state.searchResults, ...response.data],
            hasMore: response.hasMore,
            loading: false,
          }));
        } catch (error: unknown) {
          const errorMessage = extractErrorMessage(
            error,
            "Đã có lỗi xảy ra khi tải danh mục.",
          );
          set({ error: errorMessage, loading: false });
        }
      },

      /**
       * Sends a friend request to a user by their ID.
       * @param {number} friendId - The ID of the user to add as a friend.
       */
      addFriend: async (friendId: number) => {
        try {
          await addFriend(friendId);
        } catch (error: unknown) {
          const errorMessage = extractErrorMessage(
            error,
            "Đã có lỗi xảy ra khi thêm bạn.",
          );
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      /**
       * Fetches pending friend requests sent to the current user.
       * Sets loadingRequests to true while fetching, updates friendRequests list on success,
       * and sets an error message on failure.
       */
      fetchFriendRequests: async () => {
        set({ loadingRequests: true, error: null });
        try {
          const friendRequests = await getFriendRequests();
          set({ friendRequests: friendRequests, loadingRequests: false });
        } catch (error: unknown) {
          const errorMessage = extractErrorMessage(
            error,
            "Đã có lỗi xảy ra khi tải danh mục.",
          );
          set({ error: errorMessage, loading: false });
        }
      },

      /**
       * Accepts a friend request from a user.
       * @param {number} friendId - The ID of the user whose friend request is being accepted.
       */
      acceptFriendRequest: async (friendId: number) => {
        try {
          await acceptFriend(friendId);
        } catch (error: unknown) {
          const errorMessage = extractErrorMessage(
            error,
            "Đã có lỗi xảy ra khi tải danh mục.",
          );
          set({ error: errorMessage, loading: false });
        }
      },

      /**
       * Rejects a friend request from a user.
       * @param {number} friendId - The ID of the user whose friend request is being rejected.
       */
      rejectFriendRequest: async (friendId: number) => {
        try {
          await rejectFriend(friendId);
        } catch (error: unknown) {
          const errorMessage = extractErrorMessage(
            error,
            "Đã có lỗi xảy ra khi tải danh mục.",
          );
          set({ error: errorMessage, loading: false });
        }
      },
    }),
    {
      name: "mojin-friend-storage", // Tên key dưới localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedFriend: state.selectedFriend }), // Chỉ lưu mỗi selectedFriend cho nhẹ máy
    },
  ),
);
