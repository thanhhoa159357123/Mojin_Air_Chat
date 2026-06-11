"use client";

import {
  createConversation,
  getConversation,
  addParticipants as addParticipantsApi,
  getParticipants as getParticipantsApi,
  removeParticipants as removeParticipantsApi,
  markConversationRead as markConversationReadApi,
} from "@/services/conversationService";
import { IConversation, IConversationState } from "@/types/conversation";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { extractErrorMessage } from "@/lib/errorHandler";

export const useConversationStore = create<IConversationState>()(
  persist(
    (set) => ({
      conversations: [],
      loading: false,
      error: null,

      selectConversation: null,
      setSelectConversation: (conversation: IConversation | null) =>
        set({ selectConversation: conversation }),

      fetchConversations: async () => {
        set({ loading: true, error: null });
        try {
          const response = await getConversation();
          const data = response.data?.data || response.data || response;
          set({
            conversations: Array.isArray(data) ? data : [],
            loading: false,
          });
        } catch (error: unknown) {
          const message = extractErrorMessage(
            error,
            "Lỗi tải danh sách cuộc trò chuyện!",
          );
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      createConversation: async (label: string, participantIds: number[]) => {
        try {
          const response = await createConversation(label, participantIds);
          // 💡 Đón cục dữ liệu room mới từ DB Laravel dội về
          const newConversation = response.data || response;

          set((state) => {
            // Check trùng để tránh lặp UI
            if (state.conversations.some((c) => c.id === newConversation.id)) {
              return { loading: false };
            }
            // 💡 Đập thẳng phòng mới tạo lên đầu danh sách Sidebar cho máu!
            return {
              conversations: [newConversation, ...state.conversations],
              selectConversation: newConversation, // Mở luôn phòng này ra
              loading: false,
            };
          });

          return newConversation;
        } catch (error: unknown) {
          const message = extractErrorMessage(
            error,
            "Lỗi tạo cuộc trò chuyện mới!",
          );
          set({ error: message });
          throw new Error(message);
        }
      },

      fetchParticipants: async (conversationId: number) => {
        try {
          const response = await getParticipantsApi(conversationId);
          const participants = response.data?.data || response.data || response;

          set((state) => {
            const updatedConversations = state.conversations.map((conv) =>
              conv.id === conversationId ? { ...conv, participants } : conv,
            );

            const updatedSelect =
              state.selectConversation?.id === conversationId
                ? { ...state.selectConversation, participants }
                : state.selectConversation;

            return {
              conversations: updatedConversations,
              selectConversation: updatedSelect,
            };
          });
        } catch (error: unknown) {
          const message = extractErrorMessage(
            error,
            "Không thể tải danh sách thành viên!",
          );
          set({ error: message });
          throw new Error(message);
        }
      },

      addParticipants: async (conversationId: number, userIds: number[]) => {
        try {
          const response = await addParticipantsApi(conversationId, userIds);
          const updatedConversation = response.data || response;

          set((state) => {
            const updatedConversations = state.conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    participants:
                      updatedConversation.participants || conv.participants,
                  }
                : conv,
            );

            const updatedSelect =
              state.selectConversation?.id === conversationId
                ? {
                    ...state.selectConversation,
                    participants:
                      updatedConversation.participants ||
                      state.selectConversation.participants,
                  }
                : state.selectConversation;

            return {
              conversations: updatedConversations,
              selectConversation: updatedSelect,
            };
          });
        } catch (error: unknown) {
          const message = extractErrorMessage(
            error,
            "Không thể thêm thành viên vào nhóm!",
          );
          set({ error: message });
          throw new Error(message);
        }
      },

      removeParticipants: async (conversationId: number, userIds: number[]) => {
        try {
          const response = await removeParticipantsApi(conversationId, userIds);
          const updatedConversation = response.data || response;

          set((state) => {
            const updatedConversations = state.conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    participants:
                      updatedConversation.participants || conv.participants,
                  }
                : conv,
            );

            const updatedSelect =
              state.selectConversation?.id === conversationId
                ? {
                    ...state.selectConversation,
                    participants:
                      updatedConversation.participants ||
                      state.selectConversation.participants,
                  }
                : state.selectConversation;

            return {
              conversations: updatedConversations,
              selectConversation: updatedSelect,
            };
          });
        } catch (error: unknown) {
          const message = extractErrorMessage(
            error,
            "Không thể loại thành viên khỏi nhóm!",
          );
          set({ error: message });
          throw new Error(message);
        }
      },

      markConversationRead: async (conversationId: number) => {
        set((state) => {
          const updatedConversations = state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, unread_count: 0 } : conv,
          );

          const updatedSelect =
            state.selectConversation?.id === conversationId
              ? { ...state.selectConversation, unread_count: 0 }
              : state.selectConversation;

          return {
            conversations: updatedConversations,
            selectConversation: updatedSelect,
          };
        });

        try {
          await markConversationReadApi(conversationId);
        } catch (error: unknown) {
          const message = extractErrorMessage(
            error,
            "Không thể cập nhật trạng thái đã đọc!",
          );
          set({ error: message });
          throw new Error(message);
        }
      },

      reset: () =>
        set({ conversations: [], selectConversation: null, error: null }),

      addConversationToState: (newConversation) =>
        set((state) => {
          // Check trùng ID để không bị render 2 lần
          if (state.conversations.some((c) => c.id === newConversation.id)) {
            return state;
          }
          // Nhét cái mới lên đầu mảng
          return { conversations: [newConversation, ...state.conversations] };
        }),

      updateParticipantStatus: (userId, status, lastActiveAt) =>
        set((state) => {
          // 1. Cập nhật trong mảng danh sách
          const updatedConversations = state.conversations.map((conv) => ({
            ...conv,
            participants: conv.participants?.map((p) =>
              p.id === userId
                ? { ...p, status, last_active_at: lastActiveAt }
                : p,
            ),
          }));

          // 2. Cập nhật luôn trong phòng đang mở (nếu có) để Header đổi chữ ngay lập tức
          const updatedSelect = state.selectConversation
            ? {
                ...state.selectConversation,
                participants: state.selectConversation.participants?.map((p) =>
                  p.id === userId
                    ? { ...p, status, last_active_at: lastActiveAt }
                    : p,
                ),
              }
            : null;

          return {
            conversations: updatedConversations,
            selectConversation: updatedSelect,
          };
        }),
    }),
    {
      name: "mojin-conversation-storage", // Tên key lưu trong LocalStorage của bác
      storage: createJSONStorage(() => localStorage),
      // 💡 BÍ THUẬT PARTIALIZE: Chỉ lưu duy nhất phòng chat đang mở, không lưu mảng danh sách tĩnh
      partialize: (state) => ({ selectConversation: state.selectConversation }),
    },
  ),
);
