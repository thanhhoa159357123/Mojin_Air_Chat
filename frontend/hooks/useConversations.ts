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
import { useAuthStore } from "@/stores/useAuthStore";

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

      if (selectConversation?.id === variables.conversationId) {
        setSelectConversation({
          ...selectConversation,
          participants: updated.participants || selectConversation.participants,
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["participants", variables.conversationId],
      });
    },
  });

  // 4. MUTATION LẤY DANH SÁCH THÀNH VIÊN (cache 5 phút)
  // 4. TỰ ĐỘNG LẤY DANH SÁCH THÀNH VIÊN THEO PHÒNG ĐANG MỞ
  const { data: participants = [] } = useQuery({
    // Mỗi khi selectConversation?.id thay đổi, queryKey thay đổi -> Tự động kích hoạt fetch phòng mới
    queryKey: ["participants", selectConversation?.id],
    queryFn: async () => {
      const response = await getParticipants(selectConversation!.id);
      const freshParticipants =
        response.data?.data || response.data || response;

      // 💡 Bonus: Cập nhật đồng bộ ngược lại vào Cache tổng ["conversations"] cho đồng nhất dữ liệu
      queryClient.setQueryData<IConversation[]>(["conversations"], (old = []) =>
        old.map((c) =>
          c.id === selectConversation!.id
            ? { ...c, participants: freshParticipants }
            : c,
        ),
      );

      return freshParticipants;
    },
    // 🚀 CHỐT CHẶN: Chỉ khi nào user thực sự BẤM MỞ một phòng chat (có id) thì mới gọi API
    enabled: !!selectConversation?.id,
    staleTime: 1000 * 60 * 5, // Cache 5 phút ngon lành
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
      toast.success("Thao tác thành công!");
      const updated = response.data || response;

      const myId = useAuthStore.getState().user?.id;
      const isMeLeaving =
        variables.userIds.length === 1 && variables.userIds[0] === myId;

      // Nếu id là của tôi
      if (myId) {
        // Trường hợp tôi tự rời nhóm: Xóa bỏ phòng chat khỏi cache ["conversations"] và reset selectConversation
        if (isMeLeaving) {
          queryClient.setQueryData<IConversation[]>(
            ["conversations"],
            (old = []) => old.filter((c) => c.id !== variables.conversationId),
          );
          if (selectConversation?.id === variables.conversationId) {
            setSelectConversation(null);
          }
        }
      } else {
        // Nếu là người khác bị kick: Cập nhật lại danh sách participants trong cache ["conversations"]
        queryClient.setQueryData<IConversation[]>(
          ["conversations"],
          (old = []) =>
            old.map((c) =>
              c.id === variables.conversationId
                ? { ...c, participants: updated.participants || c.participants }
                : c,
            ),
        );

        if (selectConversation?.id === variables.conversationId) {
          setSelectConversation({
            ...selectConversation,
            participants:
              updated.participants || selectConversation.participants,
          });
        }
      }
      queryClient.invalidateQueries({
        queryKey: ["participants", variables.conversationId],
      });
    },
  });

  // 6. MUTATION ĐÁNH DẤU ĐÃ ĐỌC (Mẹo hay: Trải nghiệm 0ms cho cuộc trò chuyện)
  const markReadMutation = useMutation({
    mutationFn: (conversationId: number) =>
      markConversationRead(conversationId),
    onMutate: async (conversationId) => {
      const nowIso = new Date().toISOString(); // Lấy mốc thời gian hiện tại

      // Ép mốc thời gian đọc mới nhất ngay lập tức trên UI để dập tắt chấm xanh
      queryClient.setQueryData<IConversation[]>(["conversations"], (old = []) =>
        old.map((c) =>
          c.id === conversationId ? { ...c, my_last_read_at: nowIso } : c,
        ),
      );

      // Cập nhật đồng bộ trạng thái phòng đang chọn trong Zustand Store
      if (selectConversation?.id === conversationId) {
        setSelectConversation({ ...selectConversation, my_last_read_at: nowIso });
      }
    },
  });

  return {
    conversations,
    participants,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    handleCreateConversation: (label: string, participantIds: number[]) =>
      createMutation.mutate({ label, participantIds }),
    handleAddParticipants: (conversationId: number, userIds: number[]) =>
      addParticipantsMutation.mutate({ conversationId, userIds }),

    handleRemoveParticipants: (conversationId: number, userIds: number[]) =>
      removeParticipantsMutation.mutate({ conversationId, userIds }),
    handleMarkConversationRead: (conversationId: number) =>
      markReadMutation.mutate(conversationId),
  };
};
