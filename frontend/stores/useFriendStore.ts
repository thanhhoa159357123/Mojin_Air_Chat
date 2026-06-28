"use client";

import { IFriendState } from "@/types/friend";
import { create } from "zustand";

export const useFriendStore = create<IFriendState>((set) => ({
  // Giờ chỉ còn đúng 1 biến và 1 hàm điều khiển UI thuần túy
  error: null,
  setError: (msg) => set({ error: msg }),
}));