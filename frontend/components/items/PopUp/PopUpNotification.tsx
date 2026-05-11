import { IFriend } from "@/types/friend";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface IPopUpNotification {
  friendRequests: IFriend[];
  loadingRequests: boolean;
  acceptFriendRequest: (friendId: number) => Promise<void>;
  rejectFriendRequest: (friendId: number) => Promise<void>;
}

const PopUpNotification = ({
  friendRequests,
  loadingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
}: IPopUpNotification) => {
  return (
    <div className="w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-sage/20 dark:border-sage/10 overflow-hidden animate-scale-in max-h-100 overflow-y-auto custom-scrollbar">
      {loadingRequests ? (
        // Đang call API thì cho nó xoay xoay cho user đỡ sốt ruột
        <div className="p-6 flex justify-center items-center">
          <Loader2 className="size-6 text-forest animate-spin" />
        </div>
      ) : friendRequests && friendRequests.length > 0 ? (
        // Có data thì rải map ra
        friendRequests.map((user) => (
          <div
            key={user.id}
            className="p-4 border-b border-sage/10 dark:border-sage/20 last:border-0 hover:bg-sage-lighter/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="avatar"
                    className="rounded-full object-cover shadow-md ring-2 ring-white/50"
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="size-10 rounded-full bg-linear-to-br from-forest to-matcha shadow-md ring-2 ring-white/50" />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm text-foreground dark:text-matcha-light leading-relaxed wrap-break-word">
                  <span className="font-semibold text-forest dark:text-mint">
                    {user.full_name}
                  </span>{" "}
                  đã gửi cho bạn 1 lời mời kết bạn
                </p>
                <span className="text-[10px] text-sage dark:text-sage-light mt-1 block">
                  @{user.username}
                </span>
              </div>
            </div>

            <div
              onClick={() => rejectFriendRequest(user.id)}
              className="flex items-center gap-2 mt-4 pt-2"
            >
              <button className="flex-1 px-3 py-1.5 text-sm font-medium text-sage dark:text-sage-light bg-sage-lighter/50 dark:bg-gray-700/50 rounded-lg hover:bg-sage-lighter dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer">
                Từ chối
              </button>
              <button
                onClick={() => acceptFriendRequest(user.id)}
                className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-linear-to-r from-forest to-matcha rounded-lg hover:from-forest-dark hover:to-matcha-dark shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                Đồng ý
              </button>
            </div>
          </div>
        ))
      ) : (
        // Xử lý case UI khi không có ai thèm kết bạn
        <div className="p-6 text-center">
          <p className="text-sm text-sage dark:text-sage-light">
            Hiện chưa có lời mời nào bác ạ.
          </p>
        </div>
      )}
    </div>
  );
};

export default PopUpNotification;
