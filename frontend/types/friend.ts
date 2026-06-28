export interface ILastMessage {
  content: string;
  time: string; // Chuỗi thân thiện đọc được từ diffForHumans() (e.g., "1 hour ago")
  user_id: number; // ID người gửi tin nhắn cuối
  created_at: string; // Chuỗi ISO 8601 từ backend gửi qua để FE quản lý thời gian chuẩn hơn
}

export interface IFriend {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  username: string;
  friendship_status: number | string; // Đồng bộ với users.status (hoặc pivot status) trả về từ Resource
  avatar: string | null;
  status: number | string | null; // Đồng bộ với users.status (hoặc pivot status) trả về từ Resource
  last_message: ILastMessage | null; // Cần có | null vì nếu chưa bao giờ nhắn tin thì subquery nhả ra null
  pivot?: {
    last_read_at?: string | null;
  };
  created_at?: string;
  updated_at?: string;
}

// 💡 KIỂU DỮ LIỆU ĐÃ ĐƯỢC TINH GIẢN: Chỉ giữ lại các state phục vụ UI (nếu có)
export interface IFriendState {
  error: string | null;
  setError: (msg: string | null) => void;
}