/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "@/lib/pusher";
import { useAuthStore } from "@/stores/useAuthStore";
import { IConversation } from "@/types/conversation";
import { useConversationStore } from "@/stores/useConversationStore";
import { useConversations } from "./useConversations";
import { IMessage } from "@/types/message";

export const useConversationPusher = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const { handleMarkConversationRead } = useConversations();
  const readTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const userChannelName = `user.${user.id}`;
    const globalChannelName = "mojin-global-presence";
    const sidebarChannelName = `user-sidebar.${user.id}`;

    const channel = pusherClient.subscribe(userChannelName);
    const globalChannel = pusherClient.subscribe(globalChannelName);
    const sidebarChannel = pusherClient.subscribe(sidebarChannelName);

    // 1. LẮNG NGHE ĐƯỢC THÊM VÀO NHÓM MỚI
    channel.bind("new-group", (data: { conversation: IConversation }) => {
      const newConv = data.conversation;
      queryClient.setQueryData<IConversation[]>(["conversations"], (old = []) => {
        if (old.some((c) => c.id === newConv.id)) return old;
        return [newConv, ...old];
      });
    });

    // 2. TRẠNG THÁI ONLINE / OFFLINE
    globalChannel.bind("user-status-changed", (data: any) => {
      const { userId, status, lastActiveAt } = data;

      queryClient.setQueryData<IConversation[]>(["conversations"], (old = []) =>
        old.map((conv) => ({
          ...conv,
          participants: conv.participants?.map((p) =>
            p.id === userId ? { ...p, status, last_active_at: lastActiveAt } : p
          ),
        }))
      );

      // 💡 Lấy trực tiếp từ Store thay vì đưa vào Dependency array
      const currentSelect = useConversationStore.getState().selectConversation;
      if (currentSelect?.type === "private" && currentSelect.participants?.some((p) => p.id === userId)) {
        useConversationStore.getState().setSelectConversation({
          ...currentSelect,
          participants: currentSelect.participants?.map((p) =>
            p.id === userId ? { ...p, status, last_active_at: lastActiveAt } : p
          ),
        });
      }
    });

    // 🚀 3. TỔNG ĐÀI HỨNG TIN NHẮN MỚI TỪ MỌI PHÒNG
    sidebarChannel.bind("new-message", (data: { message: IMessage }) => {
      const msg = data.message;

      // Cờ chống lặp: Nếu là chính mình gửi thì bỏ qua (Optimistic UI đã lo rồi)
      if (String(msg.user_id) === String(user.id)) return;

      const currentActiveRoom = useConversationStore.getState().selectConversation;
      const isLookingAtThisRoom = currentActiveRoom?.id === msg.conversation_id;

      // 👉 CẬP NHẬT SIDEBAR (Đẩy phòng lên top)
      queryClient.setQueryData<IConversation[]>(["conversations"], (oldConversations = []) => {
        const targetRoom = oldConversations.find((c) => c.id === msg.conversation_id);
        if (!targetRoom) return oldConversations;

        const updatedRoom: IConversation = {
          ...targetRoom,
          last_message: msg as any,
          updated_at: msg.created_at,
          unread_count: isLookingAtThisRoom ? 0 : Number(targetRoom.unread_count || 0) + 1,
        };

        const restRooms = oldConversations.filter((c) => c.id !== msg.conversation_id);
        return [updatedRoom, ...restRooms];
      });

      // 👉 CẬP NHẬT KHUNG CHAT (Bơm thẳng vào Cache bất kể đang ở phòng nào)
      queryClient.setQueryData(["messages", msg.conversation_id], (old: any) => {
        if (!old || !old.pages) return old;
        const newPages = [...old.pages];
        
        // 💡 SỬA LỖI CHÍ MẠNG: Luôn nhét tin nhắn mới vào Trang 0 (newPages[0])
        newPages[0] = {
          ...newPages[0],
          data: [...newPages[0].data, msg],
        };
        return { ...old, pages: newPages };
      });

      // 👉 BÁO ĐÃ ĐỌC (Nếu đang mở đúng phòng)
      if (isLookingAtThisRoom) {
        if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
        readTimeoutRef.current = setTimeout(() => {
          handleMarkConversationRead(msg.conversation_id);
        }, 1500);
      }
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(userChannelName);
      
      globalChannel.unbind_all();
      pusherClient.unsubscribe(globalChannelName);
      
      // 💡 HÀM CLEANUP XÓA SẠCH LỖI DUPLICATE
      sidebarChannel.unbind_all();
      pusherClient.unsubscribe(sidebarChannelName);
      
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
    };
    
    // 💡 Gỡ sạch selectConversation ra khỏi mảng này để Pusher không bị đăng ký đi đăng ký lại!
  }, [user?.id, queryClient, handleMarkConversationRead]); 
};