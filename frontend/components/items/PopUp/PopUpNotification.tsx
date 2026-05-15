import { IFriend } from "@/types/friend";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

interface IPopUpNotification {
  onCloseNotification: () => void;
  friendRequests: IFriend[];
  loadingRequests: boolean;
  acceptFriendRequest: (friendId: number) => Promise<void>;
  rejectFriendRequest: (friendId: number) => Promise<void>;
}

const PopUpNotification = ({
  onCloseNotification,
  friendRequests,
  loadingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
}: IPopUpNotification) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCloseNotification}
        className="fixed inset-0 z-40 bg-black/20"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -20, y: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: -20, y: -20 }}
        className="fixed top-20 left-24 z-50"
      >
        <div className="w-80 bg-background/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-border overflow-hidden animate-scale-in max-h-100 overflow-y-auto custom-scrollbar">
          {loadingRequests ? (
            // Đang call API thì cho nó xoay xoay cho user đỡ sốt ruột
            <div className="p-6 flex justify-center items-center">
              <Loader2 className="size-6 text-primary animate-spin" />
            </div>
          ) : friendRequests && friendRequests.length > 0 ? (
            // Có data thì rải map ra
            friendRequests.map((user) => (
              <div
                key={user.id}
                className="p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt="avatar"
                        className="rounded-full object-cover shadow-md ring-2 ring-background/50"
                        width={32}
                        height={32}
                      />
                    ) : (
                      <div className="size-10 rounded-full bg-primary shadow-md ring-2 ring-background/50" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-foreground leading-relaxed wrap-break-word">
                      <span className="font-semibold text-primary">
                        {user.full_name}
                      </span>{" "}
                      đã gửi cho bạn 1 lời mời kết bạn
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      @{user.username}
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => rejectFriendRequest(user.id)}
                  className="flex items-center gap-2 mt-4 pt-2"
                >
                  <button className="flex-1 px-3 py-1.5 text-sm font-medium text-muted-foreground bg-secondary rounded-lg hover:bg-accent transition-all duration-200 cursor-pointer">
                    Từ chối
                  </button>
                  <button
                    onClick={() => acceptFriendRequest(user.id)}
                    className="flex-1 px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary-light shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    Đồng ý
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Xử lý case UI khi không có ai thèm kết bạn
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Hiện chưa có lời mời nào bác ạ.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default PopUpNotification;
