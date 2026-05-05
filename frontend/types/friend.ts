export interface IFriend {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  username: string;
  avatar: string | null; // Sửa avatarUrl -> avatar, và cho phép null
  status?: "pending" | "accepted" | "rejected" | null; // Thêm ? vì API search hiện tại chưa nhét status vào
}

export interface IFriendState {
  friends: IFriend[];
  friendRequests: IFriend[]; // Mảng này sẽ chứa các lời mời kết bạn đang chờ xử lý
  loading: boolean;
  loadingRequests: boolean; // Biến loading riêng cho việc fetch lời mời kết bạn
  error: string | null;
  hasMore: boolean; // Phải có cái này để biết còn data không mà cuộn

  getFriends: () => Promise<void>; // Hàm này sẽ dùng để fetch danh sách bạn bè, tạm thời để ? vì chưa chắc đã dùng ngay
  searchFriends: (query: string, page?: number) => Promise<void>;
  addFriend: (friendId: number) => Promise<void>; // Thêm hàm addFriend vào store, nhưng để ? vì chưa chắc đã dùng ngay
  fetchFriendRequests: () => Promise<void>; // Tạm thời để ? vì chưa chắc đã dùng ngay, nhưng sau này sẽ cần để fetch danh sách lời mời kết bạn
  acceptFriendRequest: (friendId: number) => Promise<void>; // Hàm này sẽ dùng để chấp nhận lời mời kết bạn, cũng để ? vì chưa chắc đã dùng ngay
}
