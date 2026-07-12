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
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: !!fetchId,
  });

  const messages = chatData?.pages
    ? [...chatData.pages].reverse().flatMap((page) => page?.data || [])
    : [];

  // 2. MUTATION GỬI TIN NHẮN (TRỊ TRIỆT ĐỂ LỖI TỰ KỶ CHẤM XANH)
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

      // Đẩy tin nhắn ảo vào khung chat
      queryClient.setQueryData(["messages", selectConversation?.id], (old: any) => {
        if (!old || !old.pages) return old;
        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          data: [...newPages[0].data, fakeMessage],
        };
        return { ...old, pages: newPages };
      });

      // 🌟 ÉP CHẶN ĐẦU TẠI SIDEBAR: Đổi unread_count thành my_last_read_at
      queryClient.setQueryData(["conversations"], (oldConversations: IConversation[] | undefined) => {
        const old = oldConversations || [];
        const rest = old.filter((c) => c.id !== selectConversation!.id);
        const target = old.find((c) => c.id === selectConversation!.id) || selectConversation;

        const updatedConv: IConversation = {
          ...target!,
          last_message: fakeMessage,
          updated_at: fakeMessage.created_at,
          
          // Mình là người nhắn, ép ngày đọc bằng đúng ngày tin nhắn ảo vừa sinh ra -> Cấm hiện chấm xanh!
          my_last_read_at: fakeMessage.created_at, 
        };

        return [updatedConv, ...rest];
      });

      // Cập nhật Zustand Store đồng bộ dữ liệu ảo
      useConversationStore.setState((state) => ({
        selectConversation:
          state.selectConversation?.id === selectConversation!.id
            ? {
                ...state.selectConversation,
                last_message: fakeMessage,
                updated_at: fakeMessage.created_at,
                my_last_read_at: fakeMessage.created_at,
              }
            : state.selectConversation,
      }));

      return { fakeId };
    },
    onSuccess: (realMsg, variables, context) => {
      const serverData = realMsg.data || realMsg;

      // 1. Ghi đè tin nhắn thật từ Server vào khung chat
      queryClient.setQueryData(["messages", selectConversation?.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((m: any) =>
              m.id === context.fakeId ? serverData : m,
            ),
          })),
        };
      });

      // 🌟 2. VÁ CHUẨN CHỈ SIDEBAR: Khóa cứng mốc thời gian thực từ Database
      queryClient.setQueryData(["conversations"], (oldConversations: IConversation[] | undefined) => {
        const old = oldConversations || [];
        const rest = old.filter((c) => c.id !== selectConversation!.id);
        const target = old.find((c) => c.id === selectConversation!.id) || selectConversation;

        const updatedConv: IConversation = {
          ...target!,
          last_message: serverData,
          updated_at: serverData.created_at, // Mốc thực tế Server cắn lệnh touch() nhảy lên
          
          // Đồng bộ khít kịt mốc đọc của mình bằng mốc Server, triệt tiêu 100% nguy cơ lệch mili-giây gây lóe chấm xanh
          my_last_read_at: serverData.created_at, 
        };

        return [updatedConv, ...rest];
      });

      // 3. Cập nhật Zustand Store đồng bộ dữ liệu chuẩn từ Server
      useConversationStore.setState((state) => ({
        selectConversation:
          state.selectConversation?.id === selectConversation!.id
            ? {
                ...state.selectConversation,
                last_message: serverData,
                updated_at: serverData.created_at,
                my_last_read_at: serverData.created_at,
              }
            : state.selectConversation,
      }));
    },
    onError: (err, variables, context) => {
      toast.error("Gửi tin nhắn thất bại.");
      queryClient.setQueryData(["messages", selectConversation?.id], (old: any) => {
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
      });
    },
  });

  // 3. MUTATION XÓA TIN NHẮN (FIX TYPE TS)
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: number) =>
      deleteMessage(selectConversation!.id, messageId),
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", selectConversation?.id],
      });
      queryClient.setQueryData(["messages", selectConversation?.id], (old: any) => {
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
      });
    },
    onError: () => {
      toast.error("Xóa tin nhắn thất bại.");
      queryClient.invalidateQueries({
        queryKey: ["messages", selectConversation?.id],
      });
    },
  });

  // 4. MUTATION SỬA TIN NHẮN (FIX TYPE TS)
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
      queryClient.setQueryData(["messages", selectConversation?.id], (old: any) => {
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
      });
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