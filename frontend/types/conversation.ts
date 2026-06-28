// types/conversation.ts
import { IMessage } from "./message";
import { IFriend } from "./friend";

export interface IConversation {
  id: number;
  type: "private" | "group";
  avatar?: string | null; // Chỉ có nhóm mới có avatar, còn private thì lấy avatar của partner
  label: string;
  updated_at: string;

  participants: IFriend[]; // Bọn BE trả về danh sách người tham gia (chứa thông tin friend)
  last_message?: IMessage | null; // Thông tin tin nhắn cuối cùng để làm preview
  unread_count?: number; // Số tin nhắn chưa đọc
  is_virtual?: boolean; // Phân biệt phòng ảo (friend id) và phòng thật
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
  selectConversation: IConversation | null;
  setSelectConversation: (conversation: IConversation | null) => void;
  reset: () => void;

}
