/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getMessage,
  sendMessage,
  deleteMessage,
  deleteAllMessages,
  editMessage,
} from "@/services/messageService";
import { IMessage } from "@/types/message";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConversationStore } from "@/stores/useConversationStore";
import { toast } from "sonner";
import { IConversation } from "@/types/conversation";

export const useChats = (selectConversation: IConversation | null) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // Lấy ID dùng để gọi API (Backend của bác phân biệt friend_id và conversation_id)
  const isGroup = selectConversation?.type === "group";
  const fetchId = selectConversation?.id;

  // 1. LẤY LỊCH SỬ TIN NHẮN (Cuộn vô cực)
  const {
    data: chatData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["messages", selectConversation?.id],
    queryFn: async ({ pageParam = 1 }) => {
      if (!fetchId || !selectConversation?.type)
        return { data: [], hasMore: false };
      const res = await getMessage(fetchId, selectConversation.type, pageParam);
      return res; // Trả về { data: IMessage[], hasMore: boolean }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: !!fetchId, // Chỉ chạy khi đã chọn phòng
  });

  // Duỗi mảng phân trang thành 1 mảng phẳng duy nhất cho UI dễ map
  // 💡 BÍ THUẬT DUỖI PHẲNG MẢNG THEO TRỤC THỜI GIAN TĂNG DẦN
  const messages = chatData?.pages
    ? [...chatData.pages].reverse().flatMap((page) => page?.data || [])
    : [];

  // 2. MUTATION GỬI TIN NHẮN (OPTIMISTIC UI 0ms)
  const sendMessageMutation = useMutation({
    mutationFn: ({
      content,
      parent_id,
      msgType,
    }: {
      content: string;
      parent_id?: number | null;
      msgType?: string;
    }) => {
      return sendMessage(
        fetchId!,
        isGroup ? "group" : "private",
        content,
        parent_id,
        msgType,
      );
    },
    onMutate: async (newMsgData) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", selectConversation?.id],
      });

      const fakeId = `temp-${Date.now()}`;
      const fakeMessage: IMessage = {
        id: fakeId as any,
        conversation_id: selectConversation!.id,
        user_id: user!.id,
        content: newMsgData.content,
        edit_count: 0,
        type: newMsgData.msgType || "text",
        created_at: new Date().toISOString(),
        sender: {
          id: user!.id,
          first_name: user!.first_name || "",
          last_name: user!.last_name || "",
          avatar: user!.avatar || null,
        },
      };

      // 1. Đẩy tin nhắn ảo vào Cache Khung Chat
      // Trong useChats.ts -> sendMessageMutation -> onMutate
      queryClient.setQueryData(
        ["messages", selectConversation?.id],
        (old: any) => {
          if (!old || !old.pages) return old;
          const newPages = [...old.pages];

          // 🛑 LỖI CŨ CỦA BÁC: Bác đang dùng lastPageIndex khiến tin nhắn bay lên Top
          // const lastPageIndex = newPages.length - 1;

          // ✅ CÁCH SỬA: Luôn luôn nhét tin nhắn mới vào CUỐI CỦA TRANG 0 (Trang mới nhất)
          newPages[0] = {
            ...newPages[0],
            data: [...newPages[0].data, fakeMessage],
          };
          return { ...old, pages: newPages };
        },
      );

      // 💡 ĐÃ FIX: 2. Cập nhật Sidebar lên top bằng TanStack Query (Chọc vào mảng "conversations")
      queryClient.setQueryData<IConversation[]>(
        ["conversations"],
        (oldConversations = []) => {
          // Lọc bỏ phòng chat hiện tại ra khỏi mảng cũ
          const rest = oldConversations.filter(
            (c) => c.id !== selectConversation!.id,
          );

          // Tìm phòng chat hiện tại (hoặc lấy cục selectConversation đang mở)
          const target =
            oldConversations.find((c) => c.id === selectConversation!.id) ||
            selectConversation;

          // Cập nhật tin nhắn cuối và đẩy nó lên đầu mảng
          const updatedConv = {
            ...target!,
            last_message: fakeMessage,
            updated_at: fakeMessage.created_at,
            unread_count: 0,
          };

          return [updatedConv, ...rest];
        },
      );

      // 3. Cập nhật luôn last_message vào phòng đang chọn ở Zustand Store (để Header / UI phụ mượt mà)
      useConversationStore.setState((state) => ({
        selectConversation:
          state.selectConversation?.id === selectConversation!.id
            ? {
                ...state.selectConversation,
                last_message: fakeMessage,
                updated_at: fakeMessage.created_at,
              }
            : state.selectConversation,
      }));

      return { fakeId };
    },
    // ... (Khúc onSuccess và onError ở dưới giữ nguyên như cũ)
    onSuccess: (realMsg, variables, context) => {
      // Thay thế tin nhắn ảo bằng tin nhắn thật từ Server
      queryClient.setQueryData(
        ["messages", selectConversation?.id],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.map((m: any) =>
                m.id === context.fakeId ? realMsg.data || realMsg : m,
              ),
            })),
          };
        },
      );
    },
    onError: (err, variables, context) => {
      toast.error("Gửi tin nhắn thất bại.");
      // Đánh dấu lỗi trên tin nhắn ảo
      queryClient.setQueryData(
        ["messages", selectConversation?.id],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.map((m: any) =>
                m.id === context?.fakeId ? { ...m, isError: true } : m,
              ),
            })),
          };
        },
      );
    },
  });

  // 3. MUTATION XÓA TIN NHẮN (0ms)
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: number) =>
      deleteMessage(selectConversation!.id, messageId),
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", selectConversation?.id],
      });
      // Lọc tin nhắn cho bay màu ngay lập tức
      queryClient.setQueryData(
        ["messages", selectConversation?.id],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.filter(
                (m: any) => Number(m.id) !== Number(messageId),
              ),
            })),
          };
        },
      );
    },
    onError: () => {
      toast.error("Xóa tin nhắn thất bại.");
      queryClient.invalidateQueries({
        queryKey: ["messages", selectConversation?.id],
      }); // Lỗi thì gọi API lấy lại
    },
  });

  // 4. MUTATION SỬA TIN NHẮN (0ms)
  const editMessageMutation = useMutation({
    mutationFn: ({
      messageId,
      content,
    }: {
      messageId: number;
      content: string;
    }) => editMessage(selectConversation!.id, messageId, content),
    onMutate: async ({ messageId, content }) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", selectConversation?.id],
      });
      queryClient.setQueryData(
        ["messages", selectConversation?.id],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.map((m: any) =>
                Number(m.id) === Number(messageId)
                  ? { ...m, content, edit_count: (m.edit_count || 0) + 1 }
                  : m,
              ),
            })),
          };
        },
      );
    },
    onError: () => {
      toast.error("Chỉnh sửa tin nhắn thất bại.");
      queryClient.invalidateQueries({
        queryKey: ["messages", selectConversation?.id],
      });
    },
  });

  // 5. XÓA SẠCH LỊCH SỬ
  const deleteAllMutation = useMutation({
    mutationFn: () => deleteAllMessages(selectConversation!.id),
    onSuccess: () => {
      queryClient.setQueryData(["messages", selectConversation?.id], () => ({
        pages: [{ data: [], hasMore: false }],
        pageParams: [1],
      }));
      toast.success("Đã xóa toàn bộ tin nhắn.");
    },
  });

  return {
    messages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    handleSendMessage: (
      content: string,
      parent_id?: number | null,
      msgType?: string,
    ) => sendMessageMutation.mutate({ content, parent_id, msgType }),
    handleDeleteMessage: (messageId: number) =>
      deleteMessageMutation.mutate(messageId),
    handleEditMessage: (messageId: number, content: string) =>
      editMessageMutation.mutate({ messageId, content }),
    handleAllDeleteMessages: () => deleteAllMutation.mutate(),
  };
};
