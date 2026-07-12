import { IConversation } from "@/types/conversation";
import { ChevronRight, Trash } from "lucide-react";
import React from "react";

interface OptionPrivacyAndSupportProps {
  isOpenPrivacy: boolean;
  setIsOpenPrivacy: () => void;
  handleAllDeleteMessages: () => void;
  selectConversation: IConversation | null;
}

const OptionPrivacyAndSupport = ({
  isOpenPrivacy,
  setIsOpenPrivacy,
  handleAllDeleteMessages,
  selectConversation,
}: OptionPrivacyAndSupportProps) => {
  return (
    <div>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-matcha/5 dark:hover:bg-matcha/10 group"
        onClick={setIsOpenPrivacy}
      >
        <span className="text-sm font-medium text-foreground group-hover:text-forest dark:group-hover:text-matcha-light">
          Quyền riêng tư và hỗ trợ
        </span>
        <ChevronRight
          className={`size-4 text-muted-foreground ${isOpenPrivacy ? "rotate-90 text-forest dark:text-matcha-light" : ""}`}
        />
      </div>

      {/* Content */}
      {isOpenPrivacy && (
        <div className="px-1 pb-1 space-y-0.5">
          <div
            onClick={() => selectConversation && handleAllDeleteMessages()}
            className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-matcha/5 dark:hover:bg-matcha/10"
          >
            <div className="p-1.5 rounded-md bg-danger/10 dark:bg-danger/20">
              <Trash className="size-3.5 text-danger" />
            </div>
            <span className="text-sm text-foreground">Xoá tin nhắn</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionPrivacyAndSupport;