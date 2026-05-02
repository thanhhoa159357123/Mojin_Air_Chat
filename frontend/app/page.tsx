"use client";

import ChatForm from "@/components/items/ChatForm";
import ListFriend from "@/components/items/ListFriend";
import OptionDetail from "@/components/items/OptionDetail";
import Sidebar from "@/components/items/Sidebar";
import { useState } from "react";

export default function Home() {
  const [isOptionOpen, setIsOptionOpen] = useState(true);

  return (
    <div className="w-full h-screen bg-slate-100 flex gap-4 px-4 py-3 overflow-hidden font-sans">
      {/* 1. Sidebar: Cố định 64px để icon hiển thị chuẩn nhất */}
      <aside className="w-16 flex-none flex flex-col">
        <Sidebar />
      </aside>

      {/* 2. List friend: Tỷ lệ 2.5, tối thiểu 320px để text không bị nghẹt */}
      <aside className="flex-[2.5] min-w-[320px] bg-white rounded-xl flex flex-col border border-slate-200 shadow-md overflow-hidden">
        <ListFriend />
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
    </div>
  );
}
