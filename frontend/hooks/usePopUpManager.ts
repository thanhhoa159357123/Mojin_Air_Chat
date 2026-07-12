import { useFriends } from "@/hooks/useFriends";
import { useState } from "react";

export const usePopUpManager = () => {
  // 💡 Lấy hàm refetch xịn vừa ném ra ngoài
  const { refetchFriendRequests } = useFriends();
  
  const [popups, setPopups] = useState({
    addFriend: false,
    noti: false,
    setting: false,
    createGroup: false,
    delorblock: false,
  });

  // Hàm "tổng đài" xử lý mọi loại popup
  const toggle = (name: keyof typeof popups, state: boolean) => {
    // 💡 THAY ĐỔI Ở ĐÂY: Nếu mở tab noti, gọi hàm refetch để TanStack Query kéo dữ liệu mới về
    if (name === "noti" && state === true) {
      refetchFriendRequests(); 
    }
    setPopups((prev) => ({ ...prev, [name]: state }));
  };

  return {
    isOpen: popups,
    open: (name: keyof typeof popups) => toggle(name, true),
    close: (name: keyof typeof popups) => toggle(name, false),
  };
};
