"use client";

import ChatForm from "@/components/items/ChatForm/ChatForm";
import ListFriend from "@/components/items/ListFriend/ListFriendAndGroup";
import OptionDetail from "@/components/items/OptionDetail";
import PopUpAddfriend from "@/components/items/PopUp/PopUpAddfriend";
import PopUpCreateGroup from "@/components/items/PopUp/PopUpCreateGroup";
import PopUpNotification from "@/components/items/PopUp/PopUpNotification";
import PopUpNotificationDeleteMessage from "@/components/items/PopUp/PopUpNotificationDeleteMessage";
import PopUpSettingAccount from "@/components/items/PopUp/PopUpSettingAccount";
import Sidebar from "@/components/items/Sidebar";
import { useAuthHook } from "@/hooks/useAuthHook";
import { useChatHook } from "@/hooks/useChatHook";
import { useConversationHook } from "@/hooks/useConversationHook";
import { useFriendHook } from "@/hooks/useFriendHook";
import { useFriendPolling } from "@/hooks/useFriendPolling";
import { useChatPolling } from "@/hooks/useChatPolling";
import { usePopUpManager } from "@/hooks/usePopUpManager";
import { useFriendStore } from "@/stores/useFriendStore";
import { ArrowLeft, MessageSquareIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function Home() {
  const selectedFriend = useFriendStore((state) => state.selectedFriend);
  useFriendPolling();
  useChatPolling(selectedFriend);
  const { handleCreateConversation } = useConversationHook();
  const { user } = useAuthHook();
  const { isOpen, open, close } = usePopUpManager();
  const {
    handleAddFriend,

    handleAcceptFriendRequest,
    handleRejectFriendRequest,

    searchFriends,
    searchResults,
    friendRequests,
    loading,
    loadingRequests,
    error,
    hasMore,
  } = useFriendHook();
  const {
    messages,
    handleSendMessage,
    handleDeleteMessage,
    handleAllDeleteMessages,
  } = useChatHook(selectedFriend);
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const [chatDeleteMessageId, setChatDeleteMessageId] = useState<number | null>(
    null,
  );
  const [
    isVisibleNotificationDeleteMessage,
    setIsVisibleNotificationDeleteMessage,
  ] = useState(false);

  return (
    <div className="w-full h-screen bg-background flex gap-4 px-4 py-3 overflow-hidden font-sans">
      {/* 1. Sidebar: Cố định 64px để icon hiển thị chuẩn nhất */}
      <aside className="w-16 flex-none flex flex-col">
        <Sidebar
          onToggleNotification={() => open("noti")}
          user={user}
          onToggleSetting={() => open("setting")}
        />
      </aside>

      {/* 2. List friend: Tỷ lệ 2.5, tối thiểu 320px để text không bị nghẹt */}
      <aside className="flex-[2.5] min-w-[320px] bg-secondary rounded-xl flex flex-col border border-border shadow-md overflow-hidden">
        <ListFriend
          onToggleAddFriend={() => open("addFriend")}
          onToggleCreateGroup={() => open("createGroup")}
        />
      </aside>

      {/* 3. Chat Form: Tỷ lệ 5.5, chiếm phần lớn không gian màn hình */}
      <main className="flex-[5.5] min-w-112.5 bg-card rounded-xl flex flex-col border border-border shadow-md transition-all duration-300 overflow-hidden">
        {!selectedFriend ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-1 flex flex-col items-center justify-center gap-4 p-8"
          >
            {/* Icon trang trí */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
              className="relative"
            >
              <div className="size-20 rounded-full bg-secondary flex items-center justify-center">
                <MessageSquareIcon className="size-10 text-muted-foreground" />
              </div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -inset-2 rounded-full bg-primary/20 blur-xl -z-10"
              />
            </motion.div>

            {/* Text */}
            <div className="text-center space-y-2">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-semibold text-foreground"
              >
                Chưa có cuộc trò chuyện nào
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-muted-foreground"
              >
                Chọn một bạn bè từ danh sách bên trái để bắt đầu chat
              </motion.p>
            </div>

            {/* Gợi ý */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/70"
            >
              <ArrowLeft className="size-3 animate-pulse" />
              <span>Chọn bạn bè bên trái</span>
            </motion.div>
          </motion.div>
        ) : (
          <ChatForm
            onToggleOption={() => setIsOptionOpen(!isOptionOpen)}
            messages={messages}
            setChatDeleteMessageId={setChatDeleteMessageId}
            handleSendMessage={handleSendMessage}
            setIsVisibleNotificationDeleteMessage={
              setIsVisibleNotificationDeleteMessage
            }
          />
        )}
      </main>

      {/* 4. Option Detail: Tỷ lệ 2.5, thu phóng mượt mà bằng transition */}
      <aside
        className={`hidden xl:flex bg-secondary rounded-xl flex-col border border-border shadow-md transition-all duration-500 ease-in-out overflow-hidden ${
          isOptionOpen
            ? "flex-[2.5] min-w-[320px] opacity-100"
            : "flex-none w-0 min-w-0 border-none opacity-0 -ml-4"
        }`}
      >
        <div className="w-full h-full">
          <OptionDetail
            selectedFriend={selectedFriend}
            handleAllDeleteMessages={handleAllDeleteMessages}
          />
        </div>
      </aside>

      {/* Pop-up notification với AnimatePresence */}
      <AnimatePresence>
        {isOpen.noti && (
          <PopUpNotification
            onCloseNotification={() => close("noti")}
            friendRequests={friendRequests}
            loadingRequests={loadingRequests}
            acceptFriendRequest={handleAcceptFriendRequest}
            rejectFriendRequest={handleRejectFriendRequest}
          />
        )}
      </AnimatePresence>

      {/* Pop-up add friend (chưa có trigger) */}
      <AnimatePresence>
        {isOpen.addFriend && (
          <PopUpAddfriend
            addFriend={handleAddFriend}
            onCloseAddFriend={() => close("addFriend")}
            searchResults={searchResults}
            searchFriends={searchFriends}
            loading={loading}
            error={error}
            hasMore={hasMore}
          />
        )}
      </AnimatePresence>

      {/* Pop-up notification delete message */}
      <AnimatePresence>
        {isVisibleNotificationDeleteMessage && (
          <>
            <div
              className="fixed inset-0 z-40 bg-background/60"
              onClick={() => setIsVisibleNotificationDeleteMessage(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
            >
              <PopUpNotificationDeleteMessage
                messageId={chatDeleteMessageId}
                handleDeleteMessage={handleDeleteMessage}
                onClose={() => setIsVisibleNotificationDeleteMessage(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen.setting && (
          <PopUpSettingAccount onCloseAddFriend={() => close("setting")} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen.createGroup && (
          <PopUpCreateGroup
            onClose={() => close("createGroup")}
            onCreateConversation={handleCreateConversation}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

