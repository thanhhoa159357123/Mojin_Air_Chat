"use client";

import { useState } from "react";
import { useConversationStore } from "@/stores/useConversationStore";
import Header from "./items/Header";
import OptionChatting from "./items/optionlist/OptionChatting";
import OptionFile from "./items/optionlist/OptionFile";
import OptionPrivacyAndSupport from "./items/optionlist/OptionPrivacyAndSupport";
import OptionMember from "./items/optionlist/OptionMember";

interface OptionDetailProps {
  handleAllDeleteMessages: () => void;
  setIsOpenMember: (open: boolean) => void;
}

const OptionDetail = ({
  handleAllDeleteMessages,
  setIsOpenMember,
}: OptionDetailProps) => {
  const selectConversation = useConversationStore(
    (state) => state.selectConversation,
  );
  console.log("conversation: ", selectConversation);
  const type = selectConversation?.type;
  const [isOpenSettingChat, setIsOpenSettingChat] = useState(false);
  const [isOpenMedia, setIsOpenMedia] = useState(false);
  const [isOpenPrivacy, setIsOpenPrivacy] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background/40 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-border">
      {/* Header Profile */}
      <Header selectConversation={selectConversation} />

      {/* Options List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {/* Option 1: Tùy chỉnh đoạn chat */}
        <OptionChatting
          isOpenSettingChat={isOpenSettingChat}
          setIsOpenSettingChat={() => setIsOpenSettingChat(!isOpenSettingChat)}
        />

        {/* Option 2: File phương tiện & file */}
        <OptionFile
          isOpenMedia={isOpenMedia}
          setIsOpenMedia={() => setIsOpenMedia(!isOpenMedia)}
        />

        {/* Option 3: Quyền riêng tư và hỗ trợ */}
        <OptionPrivacyAndSupport
          isOpenPrivacy={isOpenPrivacy}
          setIsOpenPrivacy={() => setIsOpenPrivacy(!isOpenPrivacy)}
          handleAllDeleteMessages={handleAllDeleteMessages}
          selectConversation={selectConversation}
        />

        {/* Option 4: Thành viên */}
        {type === "group" && (
          <OptionMember setIsOpenMember={() => setIsOpenMember(true)} />
        )}
      </div>

      {/* Footer - Thông tin thêm */}
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Hệ thống bảo mật</span>
          <span>●</span>
          <span>Mojin Air Chat v2</span>
        </div>
      </div>
    </div>
  );
};

export default OptionDetail;
