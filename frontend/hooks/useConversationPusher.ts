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
import { toast } from "sonner";
import { updateUserStatus } from "@/services/conversationService";

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

    const userChannel = pusherClient.subscribe(userChannelName);
    const globalChannel = pusherClient.subscribe(globalChannelName);
    const sidebarChannel = pusherClient.subscribe(sidebarChannelName);

    // =========================================================
    // 🛠️ FIX LỖI 1 & 2: ĐỊNH NGHĨA HÀM CÓ TÊN ĐỂ CLEANUP BỘ NHỚ CHUẨN XÁC
    // =========================================================
    const handleBeforeUnload = () => {
      updateUserStatus("offline");
    };

    // ========================================================
    // 🟢 1. XỬ LÝ TRẠNG THÁI ONLINE/OFFLINE (USER ĐỔI TAB LÀ ĐỔI THÀNH OFFLINE)
    // ========================================================
    const handleVisibilityChange = () => {
      const isHidden = document.visibilityState === "hidden";
      const newStatus = isHidden ? "offline" : "online";

      // Bắn API lên BE để update DB
      updateUserStatus(newStatus);

      // 🌟 QUAN TRỌNG: Tự cập nhật UI của chính mình trong queryClient
      // Để đèn xanh/xám của chính mình thay đổi ngay lập tức
      queryClient.setQueryData(
        ["conversations"],
        (oldConversations: IConversation[] | undefined) => {
          const old = oldConversations || [];
          return old.map((conv) => ({
            ...conv,
            participants: conv.participants?.map((p) =>
              p.id === user?.id ? { ...p, status: newStatus } : p,
            ),
          }));
        },
      );
    };

    // 2. Chỉ đăng ký visibilitychange với hàm handleVisibilityChange thôi
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // =========================================================
    // 💡 1. XỬ LÝ SỰ KIỆN: TẠO NHÓM MỚI
    // =========================================================
    const handleNewGroup = (data: { conversation: IConversation }) => {
      const newConv = data.conversation;
      queryClient.setQueryData(
        ["conversations"],
        (oldConversations: IConversation[] | undefined) => {
          const old = oldConversations || [];
          if (old.some((c) => c.id === newConv.id)) return oldConversations;
          return [newConv, ...old];
        },
      );
    };

    // =========================================================
    // 🚀 2. XỬ LÝ SỰ KIỆN: KICK / RỜI NHÓM (VÁ TRẢ TIN NHẰN HỆ THỐNG)
    // =========================================================
    const handleGroupRemoveParticipants = (data: {
      conversation: IConversation;
      removedUserIds: number[];
      systemMessage?: IMessage;
    }) => {
      const { conversation: updatedConv, removedUserIds, systemMessage } = data;
      const currentSelect = useConversationStore.getState().selectConversation;

      if (removedUserIds.includes(Number(user.id))) {
        queryClient.setQueryData(
          ["conversations"],
          (oldConversations: IConversation[] | undefined) => {
            const old = oldConversations || [];
            return old.filter((c) => c.id !== updatedConv.id);
          },
        );
        if (currentSelect?.id === updatedConv.id) {
          useConversationStore.getState().setSelectConversation(null);
          toast.error("Bạn không còn ở trong nhóm này nữa!");
        }
      } else {
        queryClient.setQueryData(
          ["conversations"],
          (oldConversations: IConversation[] | undefined) => {
            const old = oldConversations || [];
            return old.map((c) => (c.id === updatedConv.id ? updatedConv : c));
          },
        );

        if (currentSelect?.id === updatedConv.id) {
          useConversationStore.getState().setSelectConversation(updatedConv);
          queryClient.invalidateQueries({
            queryKey: ["participants", updatedConv.id],
          });

          // 🌟 VÁ BUG 3: Đẩy tin nhắn hệ thống vào khung chat cho mọi người thấy ai bị kick
          if (systemMessage) {
            queryClient.setQueryData(
              ["messages", updatedConv.id],
              (old: any) => {
                if (!old || !old.pages) return old;
                const newPages = [...old.pages];
                if (
                  newPages[0].data?.some((m: any) => m.id === systemMessage.id)
                )
                  return old;
                newPages[0] = {
                  ...newPages[0],
                  data: [...newPages[0].data, systemMessage],
                };
                return { ...old, pages: newPages };
              },
            );
          }
        }
      }
    };

    // =========================================================
    // 🚀 3. XỬ LÝ SỰ KIỆN: THÊM THÀNH VIÊN (VÁ TRẢ TIN NHẰN HỆ THỐNG)
    // =========================================================
    const handleGroupAddParticipants = (data: {
      conversation: IConversation;
      newMemberIds: number[];
      systemMessage?: IMessage;
    }) => {
      const { conversation: updatedConv, newMemberIds, systemMessage } = data;
      const currentSelect = useConversationStore.getState().selectConversation;

      if (newMemberIds.includes(Number(user.id))) {
        queryClient.setQueryData(
          ["conversations"],
          (oldConversations: IConversation[] | undefined) => {
            const old = oldConversations || [];
            if (old.some((c) => c.id === updatedConv.id)) {
              return old.map((c) =>
                c.id === updatedConv.id ? updatedConv : c,
              );
            }
            return [updatedConv, ...old];
          },
        );
        toast.info(
          `Bạn vừa được thêm vào nhóm: ${updatedConv.label || "Nhóm mới"}`,
        );
      } else {
        queryClient.setQueryData(
          ["conversations"],
          (oldConversations: IConversation[] | undefined) => {
            const old = oldConversations || [];
            return old.map((c) => (c.id === updatedConv.id ? updatedConv : c));
          },
        );
      }

      if (currentSelect?.id === updatedConv.id) {
        useConversationStore.getState().setSelectConversation(updatedConv);
        queryClient.invalidateQueries({
          queryKey: ["participants", updatedConv.id],
        });

        // 🌟 VÁ BUG 3: Đẩy tin nhắn hệ thống thông báo có người mới vào phòng
        if (systemMessage) {
          queryClient.setQueryData(["messages", updatedConv.id], (old: any) => {
            if (!old || !old.pages) return old;
            const newPages = [...old.pages];
            if (newPages[0].data?.some((m: any) => m.id === systemMessage.id))
              return old;
            newPages[0] = {
              ...newPages[0],
              data: [...newPages[0].data, systemMessage],
            };
            return { ...old, pages: newPages };
          });
        }
      }
    };

    // =========================================================
    // 🟢 4. XỬ LÝ TRẠNG THÁI ONLINE/OFFLINE
    // =========================================================
    const handleUserStatusChanged = (data: any) => {
      const { userId, status, lastActiveAt } = data;

      queryClient.setQueryData(
        ["conversations"],
        (oldConversations: IConversation[] | undefined) => {
          const old = oldConversations || [];
          return old.map((conv) => ({
            ...conv,
            participants: conv.participants?.map((p) => {
              if (p.id === userId) {
                const isStale =
                  lastActiveAt &&
                  Date.now() - new Date(lastActiveAt).getTime() > 1000 * 60 * 5;
                const finalStatus =
                  status === "offline" || isStale ? "offline" : "online";
                return {
                  ...p,
                  status: finalStatus,
                  last_active_at: lastActiveAt,
                };
              }
              return p;
            }),
          }));
        },
      );

      const currentSelect = useConversationStore.getState().selectConversation;
      if (
        currentSelect?.type === "private" &&
        currentSelect.participants?.some((p) => p.id === userId)
      ) {
        const isStale =
          lastActiveAt &&
          Date.now() - new Date(lastActiveAt).getTime() > 1000 * 60 * 5;
        const finalStatus =
          status === "offline" || isStale ? "offline" : "online";

        useConversationStore.getState().setSelectConversation({
          ...currentSelect,
          participants: currentSelect.participants?.map((p) =>
            p.id === userId
              ? { ...p, status: finalStatus, last_active_at: lastActiveAt }
              : p,
          ),
        });
      }
    };

    // =========================================================
    // 🔥 5. XỬ LÝ TIN NHẮN MỚI (CHIẾN THUẬT DẤU CHẤM XANH)
    // =========================================================
    const handleNewMessage = (data: { message: IMessage }) => {
      const msg = data.message;
      if (msg.type !== "system" && String(msg.user_id) === String(user.id))
        return;

      const currentActiveRoom =
        useConversationStore.getState().selectConversation;
      const isLookingAtThisRoom = currentActiveRoom?.id === msg.conversation_id;

      // 🌟 LUỒNG 1: Cập nhật danh sách phòng ở Sidebar
      queryClient.setQueryData(
        ["conversations"],
        (oldConversations: IConversation[] | undefined) => {
          const old = oldConversations || [];
          const targetRoom = old.find((c) => c.id === msg.conversation_id);
          if (!targetRoom) return oldConversations;

          const updatedRoom: IConversation = {
            ...targetRoom,
            last_message: msg as any,
            updated_at: msg.created_at,
            my_last_read_at: isLookingAtThisRoom
              ? msg.created_at
              : targetRoom.my_last_read_at,
          };

          const restRooms = old.filter((c) => c.id !== msg.conversation_id);
          return [updatedRoom, ...restRooms];
        },
      );

      // 🌟 LUỒNG 2 (MỚI VÁ): Đẩy trực tiếp tin nhắn mới vào khung chat chi tiết của phòng
      queryClient.setQueryData(
        ["messages", msg.conversation_id],
        (old: any) => {
          if (!old || !old.pages) return old;
          const newPages = [...old.pages];

          // Chặn trùng lặp tin nếu lỡ dính cache ảo
          if (
            newPages.some((page: any) =>
              page.data?.some((m: any) => m.id === msg.id),
            )
          ) {
            return old;
          }

          // Nhét tin nhắn mới vào cuối trang số 0 (Trang mới nhất)
          newPages[0] = {
            ...newPages[0],
            data: [...newPages[0].data, msg],
          };

          return { ...old, pages: newPages };
        },
      );

      // Tự động báo lên Server là "Đã đọc" nếu đang mở phòng chat này
      if (isLookingAtThisRoom) {
        if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
        readTimeoutRef.current = setTimeout(() => {
          handleMarkConversationRead(msg.conversation_id);
        }, 1500);
      }
    };

    //  ========================================================
    //  ĐĂNG KÝ SỰ KIỆN PUSHER
    //  ========================================================
    userChannel.bind("new-group", handleNewGroup);
    userChannel.bind(
      "group.remove_participants",
      handleGroupRemoveParticipants,
    );
    userChannel.bind("group.add_participants", handleGroupAddParticipants);
    userChannel.bind("new-message", handleNewMessage);
    userChannel.bind("system.message_sent", handleNewMessage);
    globalChannel.bind("user-status-changed", handleUserStatusChanged);
    sidebarChannel.bind("new-message", handleNewMessage);

    //  =========================================================
    //  HỦY ĐĂNG KÝ SỰ KIỆN PUSHER
    //  =========================================================
    return () => {
      // Gỡ bỏ chính xác hàm có tên, dọn sạch tài nguyên trình duyệt
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      userChannel.unbind("new-group", handleNewGroup);
      userChannel.unbind(
        "group.remove_participants",
        handleGroupRemoveParticipants,
      );
      userChannel.unbind("new-message", handleNewMessage);
      userChannel.unbind("group.add_participants", handleGroupAddParticipants);
      userChannel.unbind("system.message_sent", handleNewMessage);
      pusherClient.unsubscribe(userChannelName);

      globalChannel.unbind("user-status-changed", handleUserStatusChanged);
      pusherClient.unsubscribe(globalChannelName);

      sidebarChannel.unbind("new-message", handleNewMessage);
      pusherClient.unsubscribe(sidebarChannelName);

      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
    };
  }, [user?.id, queryClient, handleMarkConversationRead]);
};
