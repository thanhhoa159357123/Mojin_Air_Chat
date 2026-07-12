"use client";

import { IConversationState } from "@/types/conversation";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";


export const useConversationStore = create<IConversationState>()(
  persist(
    (set) => ({
      currentAction: null,
      targetFriend: null,
      
      // 💡 Bổ sung triển khai hàm
      setActionTarget: (action, friend) => set({ currentAction: action, targetFriend: friend }),

      selectConversation: null,
      setSelectConversation: (conversation) => set({ selectConversation: conversation }),
      reset: () => set({ selectConversation: null }),
    }),
    {
      name: "mojin-conversation-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectConversation: state.selectConversation }),
    }
  )
);