"use client";

import ChatForm from "@/components/items/ChatForm";
import ListFriend from "@/components/items/ListFriend";
import OptionDetail from "@/components/items/OptionDetail";
import PopUpAddfriend from "@/components/items/PopUp/PopUpAddfriend";
import PopUpNotification from "@/components/items/PopUp/PopUpNotification";
import Sidebar from "@/components/items/Sidebar";
import { useAuthHook } from "@/hooks/useAuthHook";
import { useFriendHook } from "@/hooks/useFriendHook";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function Home() {
  const { user } = useAuthHook();
  const {
    handleAddFriend,

    isPopUpAddFriendOpen,
    handleOpenAddFriendPopup,
    handleCloseAddFriendPopup,
    handleAcceptFriendRequest,

    isPopUpNotiOpen,
    handleOpenNotiPopup,
    handleCloseNotiPopup,

    searchFriends,
    friends,
    searchResults,
    friendRequests,
    loading,
    loadingRequests,
    error,
    hasMore,
  } = useFriendHook();
  const [isOptionOpen, setIsOptionOpen] = useState(false);

  return (
    <div className="w-full h-screen bg-slate-100 flex gap-4 px-4 py-3 overflow-hidden font-sans">
      {/* 1. Sidebar: Cố định 64px để icon hiển thị chuẩn nhất */}
      <aside className="w-16 flex-none flex flex-col">
        <Sidebar onToggleNotification={handleOpenNotiPopup} user={user} />
      </aside>

      {/* 2. List friend: Tỷ lệ 2.5, tối thiểu 320px để text không bị nghẹt */}
      <aside className="flex-[2.5] min-w-[320px] bg-white rounded-xl flex flex-col border border-slate-200 shadow-md overflow-hidden">
        <ListFriend
          onToggleAddFriend={handleOpenAddFriendPopup}
          friends={friends}
        />
      </aside>

      {/* 3. Chat Form: Tỷ lệ 5.5, chiếm phần lớn không gian màn hình */}
      <main className="flex-[5.5] min-w-112.5 bg-white rounded-xl flex flex-col border border-slate-200 shadow-md transition-all duration-300">
        <ChatForm onToggleOption={() => setIsOptionOpen(!isOptionOpen)} />
      </main>

      {/* 4. Option Detail: Tỷ lệ 2.5, thu phóng mượt mà bằng transition */}
      <aside
        className={`hidden xl:flex bg-white rounded-xl flex-col border border-slate-200 shadow-md transition-all duration-500 ease-in-out overflow-hidden ${
          isOptionOpen
            ? "flex-[2.5] min-w-[320px] opacity-100"
            : "flex-none w-0 min-w-0 border-none opacity-0 -ml-4"
        }`}
      >
        {/* Ép width bên trong để content OptionDetail không bị bóp méo khi thu nhỏ */}
        <div className="w-full h-full">
          <OptionDetail />
        </div>
      </aside>

      {/* Pop-up notification với AnimatePresence */}
      <AnimatePresence>
        {isPopUpNotiOpen && (
          <>
            {/* Tấm khiên tàng hình bao phủ toàn màn hình */}
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={handleCloseNotiPopup}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -20, y: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20, y: -20 }}
              className="fixed top-20 left-24 z-50"
            >
              <PopUpNotification
                friendRequests={friendRequests}
                loadingRequests={loadingRequests}
                acceptFriendRequest={handleAcceptFriendRequest}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Pop-up add friend (chưa có trigger) */}
      <AnimatePresence>
        {isPopUpAddFriendOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={handleCloseAddFriendPopup}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
            >
              <PopUpAddfriend
                addFriend={handleAddFriend}
                onCloseAddFriend={handleCloseAddFriendPopup}
                searchResults={searchResults}
                searchFriends={searchFriends}
                loading={loading}
                error={error}
                hasMore={hasMore}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
