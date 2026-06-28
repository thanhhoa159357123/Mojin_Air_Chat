"use client";

import { IChatState } from "@/types/message";
import { create } from "zustand";

export const useChatStore = create<IChatState>((set) => ({
  typingUser: null,
  setTypingUser: (user) => set({ typingUser: user }),
}));