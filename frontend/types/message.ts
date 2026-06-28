// types/chat.ts
export interface IMessage {
  id: number;
  user_id: number; // Để biết ai gửi (mình hay bạn)
  parent_id?: number | null; // Nếu là tin nhắn gốc thì parent_id sẽ là null
  content: string;
  edit_count: number; // Số lần đã chỉnh sửa
  type: string;
  created_at: string;
  sender?: {
    id: number;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
  conversation_id: number;
  isError?: boolean;
  id_fake?: string;
}

export interface IChatState {
  typingUser: string | null;
  setTypingUser: (user: string | null) => void;
}
