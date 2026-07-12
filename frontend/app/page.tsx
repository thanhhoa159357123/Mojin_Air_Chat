"use client";

import ChatForm from "@/components/items/ChatForm/ChatForm";
import ListFriendAndGroup from "@/components/items/ListFriend/ListFriendAndGroup";
import OptionDetail from "@/components/items/OptionDetail/OptionDetail";
import PopUpAddfriend from "@/components/items/PopUp/PopUpAddfriend";
import PopUpCreateGroup from "@/components/items/PopUp/PopUpCreateGroup";
import PopUpNotification from "@/components/items/PopUp/PopUpNotification";
import PopUpNotificationDeleteMessage from "@/components/items/PopUp/PopUpNotificationDeleteMessage";
import PopUpSettingAccount from "@/components/items/PopUp/SettingAccount/PopUpSettingAccount";
import PopUpManageMember from "@/components/items/PopUp/PopUpManageMember";
import Sidebar from "@/components/items/Sidebar";
import { useChats } from "@/hooks/useChats";
import { useFriendPusher } from "@/hooks/useFriendPusher";
import { usePopUpManager } from "@/hooks/usePopUpManager";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { useConversationStore } from "@/stores/useConversationStore";
import NonConversation from "@/components/NonConversation";
import PopUpUnFriendOrBlock from "@/components/items/PopUp/PopUpUnFriendOrBlock";
import PopUpDetailFriend from "@/components/items/PopUp/PopUpDetailFriend";
import { useAuthStore } from "@/stores/useAuthStore";

export default function Home() {
  const selectConversation = useConversationStore(
    (state) => state.selectConversation,
  );

  useFriendPusher();
  const { isOpen, open, close } = usePopUpManager();

  const { handleDeleteMessage, handleSendMessage, handleAllDeleteMessages } =
    useChats(selectConversation);

  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const [chatDeleteMessageId, setChatDeleteMessageId] = useState<number | null>(
    null,
  );
  const [
    isVisibleNotificationDeleteMessage,
    setIsVisibleNotificationDeleteMessage,
  ] = useState(false);
  const [isOpenMember, setIsOpenMember] = useState(false);
  const currentAction = useConversationStore((state) => state.currentAction);
  const targetFriend = useConversationStore((state) => state.targetFriend);
  const setActionTarget = useConversationStore(
    (state) => state.setActionTarget,
  );
  const user = useAuthStore((state) => state.user);
  console.log("Trạng thái User hiện tại: ", user)
  console.log("Đã vào trang chủ");

  return (
    <div className="w-full h-screen bg-background flex gap-4 px-4 py-3 overflow-hidden font-sans">
      {/* 1. Sidebar: Cố định 64px để icon hiển thị chuẩn nhất */}
      <aside className="w-16 flex-none flex flex-col">
        <Sidebar
          onToggleNotification={() => open("noti")}
          onToggleSetting={() => open("setting")}
        />
      </aside>

      {/* 2. List friend: Tỷ lệ 2.5, tối thiểu 320px để text không bị nghẹt */}
      <aside className="w-20 xl:flex-[2.5] xl:min-w-[320px] bg-secondary rounded-xl flex flex-col border border-border shadow-md overflow-hidden transition-all duration-300">
        <ListFriendAndGroup
          onToggleAddFriend={() => open("addFriend")}
          onToggleCreateGroup={() => open("createGroup")}
        />
      </aside>

      {/* 3. Chat Form: Tỷ lệ 5.5, chiếm phần lớn không gian màn hình */}
      <main className="flex-[5.5] min-w-112.5 bg-card rounded-xl flex flex-col border border-border shadow-md transition-[flex,min-width] duration-300 overflow-hidden">
        {!selectConversation ? (
          <NonConversation />
        ) : (
          <ChatForm
            onToggleOption={() => setIsOptionOpen(!isOptionOpen)}
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
        className={`hidden xl:flex bg-secondary rounded-xl flex-col border border-border shadow-md transition-[flex,min-width,opacity,margin] duration-500 ease-in-out overflow-hidden ${
          isOptionOpen
            ? "flex-[2.5] min-w-[320px] opacity-100"
            : "flex-none w-0 min-w-0 border-none opacity-0 -ml-4"
        }`}
      >
        <div className="w-full h-full">
          <OptionDetail
            handleAllDeleteMessages={handleAllDeleteMessages}
            setIsOpenMember={setIsOpenMember}
          />
        </div>
      </aside>

      {/* Pop-up notification với AnimatePresence */}
      <AnimatePresence>
        {isOpen.noti && (
          <PopUpNotification onCloseNotification={() => close("noti")} />
        )}
      </AnimatePresence>

      {/* Pop-up add friend (chưa có trigger) */}
      <AnimatePresence>
        {isOpen.addFriend && (
          <PopUpAddfriend onCloseAddFriend={() => close("addFriend")} />
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
          <PopUpCreateGroup onClose={() => close("createGroup")} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpenMember && (
          <PopUpManageMember onClose={() => setIsOpenMember(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(currentAction === "unfriend" || currentAction === "block") &&
          targetFriend !== null && (
            <PopUpUnFriendOrBlock
              onClose={() => setActionTarget(null, null)} // Tắt popup = clear state
            />
          )}
      </AnimatePresence>

      <AnimatePresence>
        {currentAction === "detail" && targetFriend !== null && (
          <PopUpDetailFriend
            onClose={() => setActionTarget(null, null)} // Tắt popup = clear state
            partnerId={targetFriend.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
