"use client";

import { extractErrorMessage } from "@/lib/errorHandler";
import {
  acceptFriend,
  addFriend,
  getFriendRequests,
  getFriends,
  rejectFriend,
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
  hasMore: false,

  // Giữ nguyên các hàm bổ trợ của bác
  getFriends: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getFriends();
      set({ friends: response.data, loading: false });
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Lỗi lấy bạn bè rồi!");
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  searchFriends: async (query: string, page: number = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await searchFriends(query, page);
      set((state) => ({
        searchResults:
          page === 1
            ? response.data
            : [...state.searchResults, ...response.data],
        hasMore: response.hasMore,
        loading: false,
      }));
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Lỗi tìm kiếm bạn bè rồi!");
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  addFriend: async (friendId: number) => {
    try {
      await addFriend(friendId);
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Lỗi gửi lời mời kết bạn rồi!",
      );
      set({ error: message });
      throw new Error(message);
    }
  },

  fetchFriendRequests: async () => {
    set({ loadingRequests: true, error: null });
    try {
      const friendRequests = await getFriendRequests();
      set({ friendRequests: friendRequests.data, loadingRequests: false });
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Lỗi lấy lời mời kết bạn rồi!",
      );
      set({ error: message, loadingRequests: false });
      throw new Error(message);
    }
  },

  acceptFriendRequest: async (friendId: number) => {
    try {
      await acceptFriend(friendId);
      set((state) => ({
        friendRequests: state.friendRequests.filter(
          (request) => request.id !== friendId,
        ),
      }));
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Lỗi chấp nhận lời mời kết bạn rồi!",
      );
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  rejectFriendRequest: async (friendId: number) => {
    try {
      await rejectFriend(friendId);
      set((state) => ({
        friendRequests: state.friendRequests.filter(
          (request) => request.id !== friendId,
        ),
      }));
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Lỗi từ từ chối lời mời kết bạn rồi!",
      );
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },
}));
