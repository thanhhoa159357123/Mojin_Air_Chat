import { useFriendStore } from "@/stores/useFriendStore";
import { Smile } from "lucide-react";

const NonMessage = () => {
  const selectedFriend = useFriendStore((state) => state.selectedFriend);
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 animate-fade-in">
      <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center">
        <Smile className="size-8 text-primary animate-bounce" />
      </div>
      <div className="text-center">
        <p className="text-foreground font-medium">
          Chưa có tin nhắn nào ở đây cả...
        </p>
        <p className="text-sm text-muted-foreground">
          Hãy gửi lời chào tới{" "}
          <span className="font-bold text-primary">
            {selectedFriend?.full_name}
          </span>{" "}
          ngay đi bác!
        </p>
      </div>
    </div>
  );
};

export default NonMessage;
