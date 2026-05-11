export interface IFriend {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  username: string;
  last_message: {
    content: string;
    time: string;
    user_id: number; // Để biết ai gửi tin nhắn cuối (mình hay bạn)
  };
  avatar: string | null; // Sửa avatarUrl -> avatar, và cho phép null
  status?: "pending" | "accepted" | "rejected" | null; // Thêm ? vì API search hiện tại chưa nhét status vào
}

export interface IFriendState {
  friends: IFriend[];
  searchResults: IFriend[];
  friendRequests: IFriend[]; // Mảng này sẽ chứa các lời mời kết bạn đang chờ xử lý
  loading: boolean;
  loadingRequests: boolean; // Biến loading riêng cho việc fetch lời mời kết bạn
  error: string | null;
  hasMore: boolean; // Phải có cái này để biết còn data không mà cuộn

  selectedFriend: IFriend | null;
  setSelectedFriend: (friend: IFriend | null) => void;

  getFriends: () => Promise<void>;
  searchFriends: (query: string, page?: number) => Promise<void>;
  addFriend: (friendId: number) => Promise<void>;
  fetchFriendRequests: () => Promise<void>;
  acceptFriendRequest: (friendId: number) => Promise<void>;
  rejectFriendRequest: (friendId: number) => Promise<void>;
}
