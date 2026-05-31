import { IConversation } from "@/types/conversation";
import { ChevronRight, Trash } from "lucide-react";
import React from "react";

interface OptionPrivacyAndSupportProps {
  isOpenPrivacy: boolean;
  setIsOpenPrivacy: () => void;
  handleAllDeleteMessages: () => void;
  selectConversation: IConversation | null; // Thêm prop selectConversation để sử dụng trong OptionPrivacyAndSupport
}

const OptionPrivacyAndSupport = ({
  isOpenPrivacy,
  setIsOpenPrivacy,
  handleAllDeleteMessages,
  selectConversation,
}: OptionPrivacyAndSupportProps) => {
  return (
    <div className="rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-accent group"
        onClick={setIsOpenPrivacy}
      >
        <span className="font-medium text-foreground group-hover:text-primary">
          Quyền riêng tư và hỗ trợ
        </span>
        <ChevronRight
          className={`size-4 text-muted-foreground transition-all duration-300 ${
            isOpenPrivacy
              ? "rotate-90 text-primary"
              : "group-hover:translate-x-0.5"
          }`}
        />
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpenPrivacy ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-2 py-1 space-y-1">
          <div
            onClick={() => selectConversation && handleAllDeleteMessages()}
            className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent group/item"
          >
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
              <Trash className="size-4 text-primary" />
            </div>
            <span className="text-sm text-foreground">Xoá tin nhắn</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionPrivacyAndSupport;
