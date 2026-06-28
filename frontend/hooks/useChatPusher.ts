/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "@/lib/pusher";
import { useChatStore } from "@/stores/useChatStore";
import { IMessage } from "@/types/message";
import { IConversation } from "@/types/conversation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConversations } from "@/hooks/useConversations"; // Gọi hàm markRead từ Hook bên kia

export const useChatPusher = (selectConversation: IConversation | null) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setTypingUser = useChatStore((state) => state.setTypingUser);
  const { handleMarkConversationRead } = useConversations();

  const readTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (
      !selectConversation?.id ||
      (selectConversation.type === "private" && selectConversation.is_virtual)
    )
      return;

    const conversationId = selectConversation.id;
    const channelName = `chat-room.${conversationId}`;
    const channel = pusherClient.subscribe(channelName);

    // // 1. NHẬN TIN NHẮN MỚI TỪ PUSHER
    // channel.bind("new-message", (data: { message: IMessage }) => {
    //   if (String(data.message.user_id) === String(user?.id)) {
    //     return;
    //   }
    //   // const incomingId = Number(data.message.id);

    //   // --- PHẦN 1: CẬP NHẬT KHUNG CHAT CHÍNH (Đã có sẵn, giữ nguyên) ---
    //   queryClient.setQueryData(["messages", conversationId], (old: any) => {
    //     if (!old || !old.pages) return old;
    //     const newPages = [...old.pages];
    //     const lastPageIndex = newPages.length - 1;
    //     newPages[lastPageIndex] = {
    //       ...newPages[lastPageIndex],
    //       data: [...newPages[lastPageIndex].data, data.message],
    //     };
    //     return { ...old, pages: newPages };
    //   });

    //   // --- 💡 PHẦN 2 (MỚI THÊM): CẬP NHẬT SIDEBAR ---
    //   // Chọc vào Cache danh sách phòng chat để cập nhật tin nhắn cuối và đẩy lên Top!
    //   queryClient.setQueryData<IConversation[]>(
    //     ["conversations"],
    //     (oldConversations = []) => {
    //       // 1. Tìm cái phòng đang nhận tin nhắn trong Sidebar
    //       const targetRoom = oldConversations.find(
    //         (c) => c.id === conversationId,
    //       );

    //       if (!targetRoom) return oldConversations; // Tránh lỗi nếu phòng bị xóa

    //       // 2. Cập nhật phòng đó với tin nhắn cuối từ Pusher
    //       const updatedRoom: IConversation = {
    //         ...targetRoom,
    //         last_message: data.message as any, // Đè tin nhắn mới vào
    //         updated_at: data.message.created_at, // Cập nhật thời gian
    //         // Nếu người gửi không phải là mình, tăng số chưa đọc lên 1 (nếu chưa xem)
    //         unread_count:
    //           String(data.message.user_id) !== String(user?.id)
    //             ? Number(targetRoom.unread_count || 0) + 1
    //             : targetRoom.unread_count,
    //       };

    //       // 3. Lọc bỏ cái phòng cũ ở vị trí cũ đi
    //       const restRooms = oldConversations.filter(
    //         (c) => c.id !== conversationId,
    //       );

    //       // 4. Nhét phòng vừa được cập nhật lên đầu mảng Sidebar!
    //       return [updatedRoom, ...restRooms];
    //     },
    //   );

    //   // DEBOUNCE báo đã xem (Giữ nguyên)
    //   if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
    //   readTimeoutRef.current = setTimeout(() => {
    //     handleMarkConversationRead(conversationId);
    //   }, 1500);
    // });

    // 2. NHẬN LỆNH XÓA TIN NHẮN
    channel.bind(
      "message-deleted",
      (data: { message_id: number; type: string; conversation_id: number }) => {
        if (data.type === "delete_for_all") {
          queryClient.setQueryData(["messages", conversationId], (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                data: page.data.filter(
                  (m: any) => Number(m.id) !== Number(data.message_id),
                ),
              })),
            };
          });
        } else if (data.type === "clear_history") {
          // Reset cache thành mảng rỗng
          queryClient.setQueryData(["messages", conversationId], () => ({
            pages: [{ data: [], hasMore: false }],
            pageParams: [1],
          }));
        }
      },
    );

    // 3. NHẬN LỆNH SỬA TIN NHẮN
    channel.bind("MessageEdited", (data: { message: IMessage }) => {
      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((m: any) =>
              Number(m.id) === Number(data.message.id)
                ? { ...m, ...data.message }
                : m,
            ),
          })),
        };
      });
    });

    // 4. AI ĐÓ ĐANG GÕ PHÍM
    channel.bind("user-typing", (data: any) => {
      if (data.user.id !== user?.id) {
        setTypingUser(data.user.full_name);
        setTimeout(() => setTypingUser(null), 3000);
      }
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectConversation?.id,
    queryClient,
    user?.id,
    handleMarkConversationRead,
    setTypingUser,
  ]);
};
