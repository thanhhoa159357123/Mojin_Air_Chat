// types/conversation.ts
import { IMessage } from "./message";
import { IFriend } from "./friend";

export interface IConversation {
  id: number;
  type: "private" | "group";
  label: string;
  updated_at: string;
  participants: IFriend[]; // Bọn BE trả về danh sách người tham gia (chứa thông tin friend)
  last_message?: IMessage; // Thông tin tin nhắn cuối cùng để làm preview
  unread_count?: number; // Số tin nhắn chưa đọc
  is_virtual?: boolean; // Phân biệt phòng ảo (friend id) và phòng thật
}

export interface IConversationState {
  conversations: IConversation[]; // Mảng cuộc trò chuyện
  loading: boolean;
  error: string | null;

  selectConversation: IConversation | null; // Cuộc trò chuyện đang được chọn để hiển thị
  setSelectConversation: (conversation: IConversation | null) => void;

  fetchConversations: () => Promise<void>;
  createConversation: (
    label: string,
    participantIds: number[],
  ) => Promise<IConversation>;
  fetchParticipants: (conversationId: number) => Promise<void>;
  addParticipants: (conversationId: number, userIds: number[]) => Promise<void>;
  removeParticipants: (
    conversationId: number,
    userIds: number[],
  ) => Promise<void>;
  markConversationRead: (conversationId: number) => Promise<void>;
  reset: () => void; // Thêm hàm reset để xóa sạch state khi logout
  addConversationToState: (conversation: IConversation) => void;
  updateParticipantStatus: (
    userId: number,
    status: "online" | "offline",
    lastActiveAt?: string,
  ) => void;
}
