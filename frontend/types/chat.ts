// types/chat.ts
export interface IMessage {
  id: number;
  user_id: number; // Để biết ai gửi (mình hay bạn)
  parent_id?: number | null; // Nếu là tin nhắn gốc thì parent_id sẽ là null
  content: string;
  type: string;
  created_at: string;
  sender?: {
    id: number;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
}

export interface IChatState {
  messages: IMessage[]; // Chỉ cần quản lý mảng tin nhắn
  loading: boolean;
  error: string | null;

  fetchMessages: (friendId: number, type: "private" | "group") => Promise<void>;
  sendMessage: (
    id: number,
    type: "private" | "group", // <--- Thêm cái này
    content: string,
    parent_id?: number | null,
    msgType?: string,
  ) => Promise<void>;
  deleteMessage: (messageId: number, friendId: number) => Promise<void>;
  deleteAllMessages: (friendId: number) => Promise<void>;
}
