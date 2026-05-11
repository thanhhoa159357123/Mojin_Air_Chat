// types/chat.ts
export interface IMessage {
  id: number;
  user_id: number; // Để biết ai gửi (mình hay bạn)
  content: string;
  type: string;
  created_at: string;
}

export interface IChatState {
  messages: IMessage[]; // Chỉ cần quản lý mảng tin nhắn
  loading: boolean;
  error: string | null;

  fetchMessages: (friendId: number) => Promise<void>;
  sendMessage: (friendId: number, content: string) => Promise<void>;
  deleteMessage: (messageId: number, friendId: number) => Promise<void>;
  deleteAllMessages: (friendId: number) => Promise<void>;
}
