import { Users } from "lucide-react";
import React from "react";

const ListBlockUser = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
      <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center">
        <Users className="size-6 opacity-40" />
      </div>
      <p className="text-sm font-medium">Danh sách người dùng đã chặn</p>
    </div>
  );
};

export default ListBlockUser;
