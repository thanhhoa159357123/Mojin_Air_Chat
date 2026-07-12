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
  const type = selectConversation?.type;
  const [isOpenSettingChat, setIsOpenSettingChat] = useState(false);
  const [isOpenMedia, setIsOpenMedia] = useState(false);
  const [isOpenPrivacy, setIsOpenPrivacy] = useState(false);

  const handleOpenMemberModal = () => {
    setIsOpenMember(true);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl overflow-hidden border border-matcha-light/20 dark:border-matcha-dark/30">
      {/* Header Profile */}
      <Header selectConversation={selectConversation} />

      {/* Options List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
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
          <OptionMember setIsOpenMember={handleOpenMemberModal} />
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-matcha-light/20 dark:border-matcha-dark/30 bg-matcha/5 dark:bg-matcha/10">
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <span>Mojin Air Chat v2</span>
          <span className="text-matcha">●</span>
          <span>Bảo mật</span>
        </div>
      </div>
    </div>
  );
};

export default OptionDetail;