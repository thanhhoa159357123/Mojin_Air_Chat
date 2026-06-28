"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  getFriends,
  addFriend,
  getFriendRequests,
  rejectFriend,
  acceptFriend,
  searchFriends,
  addAvatar,
} from "@/services/friendService";
import { IFriend } from "@/types/friend";
import { toast } from "sonner";

export const useFriends = () => {
  const queryClient = useQueryClient();

  // 1. LẤY DANH SÁCH BẠN BÈ
  const {
    data: friends = [],
    isLoading,
    error,
  } = useQuery<IFriend[]>({
    queryKey: ["friends"],
    queryFn: async () => {
      const response = await getFriends();
      return response.data || response;
    },
    staleTime: 1000 * 60 * 5,
  });

  // 2. GỬI LỜI MỜI KẾT BẠN (addFriend cũ trong store)
  const addFriendMutation = useMutation({
    mutationFn: (friendId: number) => addFriend(friendId),
    onSuccess: () => {
      toast.success("Đã gửi lời mời kết bạn!");
      // F5 lại cache lời mời hoặc danh sách nếu cần thiết
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
    onError: (err: unknown) =>
      toast.error((err as Error).message || "Lỗi gửi lời mời kết bạn!"),
  });

  // 3. LẤY DANH SÁCH LỜI MỜI KẾT BẠN (fetchFriendRequests)
  const {
    data: friendRequests = [],
    isLoading: isFriendRequestsLoading,
    error: friendRequestsError,
  } = useQuery<IFriend[]>({
    queryKey: ["friendRequests"],
    queryFn: async () => {
      const response = await getFriendRequests();
      return response.data || response;
    },
    staleTime: 1000 * 60 * 5,
  });

  // 4. CHẤP NHẬN LỜI MỜI KẾT BẠN (Bản chuẩn)
  const acceptFriendMutation = useMutation({
    // Sửa lỗi: Phải gọi acceptFriend(friendId) của service chứ không phải addFriend!
    mutationFn: (friendId: number) => acceptFriend(friendId),
    onSuccess: (response, friendId) => {
      toast.success("Đã chấp nhận lời mời kết bạn!");

      // Hành động 1: Xóa thằng này khỏi danh sách lời mời chờ (friendRequests)
      queryClient.setQueryData<IFriend[]>(["friendRequests"], (old = []) =>
        old.filter((r) => Number(r.id) !== Number(friendId)),
      );

      // Hành động 2: Kích hoạt ổ cache ["friends"] tự làm tươi để kéo ông bạn này vào list
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      // Hoặc làm tươi cả Sidebar vì kết bạn xong sẽ mở ra phòng chat mới
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: unknown) =>
      toast.error((err as Error).message || "Lỗi chấp nhận lời mời!"),
  });

  // 5. TỪ CHỐI LỜI MỜI KẾT BẠN
  const rejectFriendMutation = useMutation({
    mutationFn: (friendId: number) => rejectFriend(friendId),
    onSuccess: (response, friendId) => {
      toast.success("Đã từ chối lời mời kết bạn.");

      // Khớp key với useQuery bên trên là ["friendRequests"]
      queryClient.setQueryData<IFriend[]>(["friendRequests"], (old = []) =>
        old.filter((request) => Number(request.id) !== Number(friendId)),
      );
    },
    onError: (err: unknown) =>
      toast.error((err as Error).message || "Từ chối lời mời thất bại!"),
  });

  // 6. TÌM KIẾM BẠN BÈ + INFINITE SCROLL (Gom từ searchFriends)
  // Bác truyền vào cái `searchQuery: string` để kích hoạt nhé
  const useSearchFriendsInfinite = (searchQuery: string) => {
    return useInfiniteQuery({
      queryKey: ["friendsSearch", searchQuery],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await searchFriends(searchQuery, pageParam);
        return response; // Trả về nguyên cục { data: IFriend[], hasMore: boolean }
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        // Nếu hasMore = true thì trang tiếp theo = số trang hiện tại + 1
        return lastPage.hasMore ? allPages.length + 1 : undefined;
      },
      enabled: !!searchQuery.trim(), // Chỉ tự động chạy khi ô input có chữ
    });
  };

  // 7. CẬP NHẬT AVATAR (addAvatar)
  const addAvatarMutation = useMutation({
    mutationFn: (avtUrl: string) => addAvatar(avtUrl),
    onSuccess: () => {
      toast.success("Cập nhật ảnh đại diện thành công!");
      // Thường sẽ invalidate query của ["authUser"] hoặc ["user"] để Header đổi avatar ngay lập tức
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (err: unknown) =>
      toast.error((err as Error).message || "Lỗi cập nhật avatar!"),
  });

  return {
    // List Friends
    friends,
    isLoading,
    error: error ? (error as Error).message : null,
    addFriend: (friendId: number) => addFriendMutation.mutate(friendId),
    isAddingFriend: addFriendMutation.isPending,

    // List Requests
    friendRequests,
    isFriendRequestsLoading,
    friendRequestsError: friendRequestsError
      ? (friendRequestsError as Error).message
      : null,

    refetchFriendRequests: () =>
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] }),
    acceptFriend: (friendId: number) => acceptFriendMutation.mutate(friendId),
    rejectFriend: (friendId: number) => rejectFriendMutation.mutate(friendId),

    // Avatar Action
    handleUpdateAvatar: (avtUrl: string) => addAvatarMutation.mutate(avtUrl),
    isUpdatingAvatar: addAvatarMutation.isPending,

    // Expose hàm tìm kiếm vô hạn ra ngoài
    useSearchFriendsInfinite,
  };
};
