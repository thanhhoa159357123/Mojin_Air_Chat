// types/conversation.ts
import { IMessage } from "./message";
import { IFriend } from "./friend";

export interface IConversation {
  id: number;
  type: "private" | "group";
  avatar?: string | null; // Chỉ có nhóm mới có avatar, còn private thì lấy avatar của partner
  label: string;
  updated_at: string;
  is_read_only?: boolean; // Dùng để đánh dấu phòng ảo (friend id) chỉ đọc, không cho gửi tin nhắn

  participants: IFriend[]; // Bọn BE trả về danh sách người tham gia (chứa thông tin friend)
  last_message?: IMessage | null; // Thông tin tin nhắn cuối cùng để làm preview
  is_virtual?: boolean; // Phân biệt phòng ảo (friend id) và phòng thật
  
  my_last_read_at?: string | null;
}

export interface IPartner {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  username: string;
  avatar: string | null;
  status: number | string | null;
}

export interface IConversationState {
  currentAction: "unfriend" | "block" | "detail" | null;
  targetFriend: { id: number; name: string } | null;

  // 💡 Bổ sung hàm này
  setActionTarget: (
    action: "unfriend" | "block" | "detail" | null,
    friend: { id: number; name: string } | null,
  ) => void;

  selectConversation: IConversation | null;
  setSelectConversation: (conversation: IConversation | null) => void;
  reset: () => void;
}
