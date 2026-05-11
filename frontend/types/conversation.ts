import { IMessage } from "./chat";
import { IFriend } from "./friend";

export interface IConversation {
  id: number;
  type: string;
  updated_at: string;
  participants: IFriend[]; // Bọn BE trả về danh sách người tham gia (chứa thông tin friend)
  last_message?: IMessage; // Thông tin tin nhắn cuối cùng để làm preview
}

export interface IConversationState {
  conversations: IConversation[]; // Mảng cuộc trò chuyện
  loading: boolean;
  error: string | null;

  fetchConversations: () => Promise<void>;
}
