import { useChatStore } from "@/stores/useChatStore";
export const useChatFormHook = () => {
  const typingUser = useChatStore((state) => state.typingUser);

  return {
    typingUser,
  };
};
