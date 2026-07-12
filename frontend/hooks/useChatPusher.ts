/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "@/lib/pusher";
import { useChatStore } from "@/stores/useChatStore";
import { IMessage } from "@/types/message";
import { IConversation } from "@/types/conversation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConversations } from "@/hooks/useConversations";

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

    // ================================================================
    // 🟢 2. XỬ LÝ SỰ KIỆN TIN NHẮN (XÓA, SỬA, ĐANG GÕ)
    // ========================================================
    const handleMessageDeleted = (data: {
      message_id: number;
      type: string;
      conversation_id: number;
    }) => {
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
        queryClient.setQueryData(["messages", conversationId], () => ({
          pages: [{ data: [], hasMore: false }],
          pageParams: [1],
        }));
      }
    };

    const handleMessageEdited = (data: { message: IMessage }) => {
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
    };

    const handleUserTyping = (data: any) => {
      if (data.user.id !== user?.id) {
        setTypingUser(data.user.full_name);
        setTimeout(() => setTypingUser(null), 3000);
      }
    };

    //  ===============================================================
    //  ĐĂNG KÝ SỰ KIỆN PUSHER
    //  ===============================================================
    console.log(`🔌 Tham gia phòng chat: ${channelName}`);
    channel.bind("message-deleted", handleMessageDeleted);
    channel.bind("MessageEdited", handleMessageEdited);
    channel.bind("user-typing", handleUserTyping);

    //  ===============================================================
    //  HỦY ĐĂNG KÝ PUSHER
    //  ===============================================================
    return () => {
      console.log(`🔌 Rời phòng chat: ${channelName}`);
      channel.unbind("message-deleted", handleMessageDeleted);
      channel.unbind("MessageEdited", handleMessageEdited);
      channel.unbind("user-typing", handleUserTyping);
      pusherClient.unsubscribe(channelName);

      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
    };
  }, [
    selectConversation?.id,
    queryClient,
    user?.id,
    handleMarkConversationRead,
    setTypingUser,
  ]);
};
