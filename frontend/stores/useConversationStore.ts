"use client";

import { IConversationState } from "@/types/conversation";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";


export const useConversationStore = create<IConversationState>()(
  persist(
    (set) => ({
      // Giữ lại trạng thái UI duy nhất cần đồng bộ toàn cục và persist
      selectConversation: null,
      
      setSelectConversation: (conversation) => set({ selectConversation: conversation }),
      
      reset: () => set({ selectConversation: null }),
    }),
    {
      name: "mojin-conversation-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);