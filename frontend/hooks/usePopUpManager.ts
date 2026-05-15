import { useFriendStore } from "@/stores/useFriendStore";
import { useState } from "react";

export const usePopUpManager = () => {
  const { fetchFriendRequests } = useFriendStore();
  const [popups, setPopups] = useState({
    addFriend: false,
    noti: false,
    setting: false,
    createGroup: false,
  });

  // Hàm "tổng đài" xử lý mọi loại popup
  const toggle = (name: keyof typeof popups, state: boolean) => {
    if (name === "noti" && state === true) fetchFriendRequests();
    setPopups((prev) => ({ ...prev, [name]: state }));
  };

  return {
    isOpen: popups,
    open: (name: keyof typeof popups) => toggle(name, true),
    close: (name: keyof typeof popups) => toggle(name, false),
  };
};
