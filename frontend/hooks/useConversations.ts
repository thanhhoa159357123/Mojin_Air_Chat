"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConversation,
  createConversation,
  addParticipants,
  removeParticipants,
  markConversationRead,
  getParticipants, // 💡 Kéo hàm này từ service lên
} from "@/services/conversationService";
import { useConversationStore } from "@/stores/useConversationStore";
import { IConversation } from "@/types/conversation";
import { toast } from "sonner";

export const useConversations = () => {
  const queryClient = useQueryClient();
  const selectConversation = useConversationStore(
    (state) => state.selectConversation,
  );
  const setSelectConversation = useConversationStore(
    (state) => state.setSelectConversation,
  );

  // 1. LẤY DANH SÁCH CUỘC TRÒ CHUYỆN (Ăn cache 3 phút)
  const {
    data: conversations = [],
    isLoading,
    error,
  } = useQuery<IConversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await getConversation();
      return response.data?.data || response.data || response;
    },
    staleTime: 1000 * 60 * 3,
  });

  // 2. MUTATION TẠO PHÒNG CHAT MỚI
  const createMutation = useMutation({
    mutationFn: ({
      label,
      participantIds,
    }: {
      label: string;
      participantIds: number[];
    }) => createConversation(label, participantIds),
    onSuccess: (response) => {
      const newConv = response.data || response;
      toast.success("Cuộc trò chuyện mới đã được tạo!");

      queryClient.setQueryData<IConversation[]>(
        ["conversations"],
        (old = []) => {
          if (old.some((c) => c.id === newConv.id)) return old;
          return [newConv, ...old];
        },
      );

      setSelectConversation(newConv);
    },
    onError: () => toast.error("Lỗi tạo cuộc trò chuyện mới!"),
  });

  // 3. MUTATION THÊM THÀNH VIÊN
  const addParticipantsMutation = useMutation({
    mutationFn: ({
      conversationId,
      userIds,
    }: {
      conversationId: number;
      userIds: number[];
    }) => addParticipants(conversationId, userIds),
    onSuccess: (response, variables) => {
      toast.success("Đã thêm thành viên vào nhóm!");
      const updated = response.data || response;

      queryClient.setQueryData<IConversation[]>(["conversations"], (old = []) =>
        old.map((c) =>
          c.id === variables.conversationId
            ? { ...c, participants: updated.participants || c.participants }
            : c,
        ),
      );
    },
  });

  // 4. MUTATION LẤY DANH SÁCH THÀNH VIÊN
  const fetchParticipantsMutation = useMutation({
    mutationFn: (conversationId: number) => getParticipants(conversationId),
    onSuccess: (response, conversationId) => {
      const participants = response.data?.data || response.data || response;

      // Hành động A: Chọc ngầm vào Cache ["conversations"] để nhét đống participants tươi mới này vào đúng phòng
      queryClient.setQueryData<IConversation[]>(["conversations"], (old = []) =>
        old.map((c) => (c.id === conversationId ? { ...c, participants } : c)),
      );

      // Hành động B: Nếu đang mở đúng phòng này, đè dữ liệu mới vào Zustand Store để Header đổi avatar/số thành viên ngay lập tức!
      if (selectConversation?.id === conversationId) {
        setSelectConversation({ ...selectConversation, participants });
      }
    },
    onError: () => toast.error("Không thể tải danh sách thành viên mới!"),
  });
  // 5. MUTATION KICK THÀNH VIÊN
  const removeParticipantsMutation = useMutation({
    mutationFn: ({
      conversationId,
      userIds,
    }: {
      conversationId: number;
      userIds: number[];
    }) => removeParticipants(conversationId, userIds),
    onSuccess: (response, variables) => {
      toast.success("Đã loại thành viên khỏi nhóm!");
      const updated = response.data || response;

      queryClient.setQueryData<IConversation[]>(["conversations"], (old = []) =>
        old.map((c) =>
          c.id === variables.conversationId
            ? { ...c, participants: updated.participants || c.participants }
            : c,
        ),
      );
    },
  });

  // 6. MUTATION ĐÁNH DẤU ĐÃ ĐỌC (Mẹo hay: Trải nghiệm 0ms cho cuộc trò chuyện)
  const markReadMutation = useMutation({
    mutationFn: (conversationId: number) =>
      markConversationRead(conversationId),
    onMutate: async (conversationId) => {
      // Khi user click chọn phòng, ép số thông báo chưa đọc về 0 ngay lập tức trên UI
      queryClient.setQueryData<IConversation[]>(["conversations"], (old = []) =>
        old.map((c) =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c,
        ),
      );

      // Cập nhật luôn trạng thái phòng đang chọn trong Zustand Store
      if (selectConversation?.id === conversationId) {
        setSelectConversation({ ...selectConversation, unread_count: 0 });
      }
    },
  });

  return {
    conversations,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    handleCreateConversation: (label: string, participantIds: number[]) =>
      createMutation.mutate({ label, participantIds }),
    handleAddParticipants: (conversationId: number, userIds: number[]) =>
      addParticipantsMutation.mutate({ conversationId, userIds }),
    handleFetchParticipants: (conversationId: number) =>
      fetchParticipantsMutation.mutate(conversationId),
    handleRemoveParticipants: (conversationId: number, userIds: number[]) =>
      removeParticipantsMutation.mutate({ conversationId, userIds }),
    handleMarkConversationRead: (conversationId: number) =>
      markReadMutation.mutate(conversationId),
  };
};
