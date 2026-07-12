/* eslint-disable @typescript-eslint/no-explicit-any */
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
  unFriend,
  blockFriend,
  unblockFriend,
  getBlockedFriends,
} from "@/services/friendService";
import { IFriend } from "@/types/friend";
import { toast } from "sonner";

export const useFriends = () => {
  const queryClient = useQueryClient();

  // ==========================================
  // 1. LẤY DANH SÁCH BẠN BÈ
  // ==========================================
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

  // ==========================================
  // 2. LẤY DANH SÁCH LỜI MỜI KẾT BẠN (fetchFriendRequests)
  // ==========================================
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

  // ==========================================
  // 3. GỬI LỜI MỜI KẾT BẠN
  // ==========================================
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

  // ==========================================
  // 4. CHẤP NHẬN LỜI MỜI KẾT BẠN
  // ==========================================
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

  // ==========================================
  // 5. TỪ CHỐI LỜI MỜI KẾT BẠN
  // ==========================================
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

  // ==========================================
  // 6. TÌM KIẾM BẠN BÈ + INFINITE SCROLL (Gom từ searchFriends)
  // ==========================================
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

  // ==========================================
  // 7. CẬP NHẬT AVATAR (addAvatar)
  // ==========================================
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

  // ==========================================
  // 8. HỦY KẾT BẠN (unFriend)
  // ==========================================
  const unFriendMutation = useMutation({
    mutationFn: (friendId: number) => unFriend(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success(
        "Một mối quan hệ vừa kết thúc...!!! Có duyên thì gặp lại, không duyên thì thôi. 😢",
      );
    },
    // 💡 SỬA CHỖ NÀY: Bắt và bung cái lỗi thật sự ra!
    onError: (err: any) => {
      console.error("🔥 Bắt quả tang lỗi API:", err.response?.data || err);
      // Lấy câu chửi từ Backend (nếu có), không thì báo lỗi chung
      const backendMessage =
        err.response?.data?.message || "Lỗi mạng hoặc server!";
      toast.error(`Xóa bạn thất bại: ${backendMessage}`);
    },
  });

  // ==========================================
  // 9. BLOCK BẠN BÈ
  // ==========================================
  const blockFriendMutation = useMutation({
    mutationFn: (friendId: number) => blockFriend(friendId),
    onSuccess: () => {
      toast.success("Không bao giờ làm bạn nữa");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["blockedFriends"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: any) => {
      console.error("🔥 Bắt quả tang lỗi API:", err.response?.data || err);
      const backendMessage =
        err.response?.data?.message || "Lỗi mạng hoặc server!";
      toast.error(`Block bạn thất bại: ${backendMessage}`);
    },
  });

  // ==========================================
  // 10. UNBLOCK BẠN BÈ
  // ==========================================
  const unblockFriendMutation = useMutation({
    mutationFn: (friendId: number) => unblockFriend(friendId),
    onSuccess: () => {
      toast.success("Đã bỏ chặn bạn!");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["blockedFriends"] });
      // queryClient.inva
    },
    onError: (err: any) => {
      console.error("🔥 Bắt quả tang lỗi API:", err.response?.data || err);
      const backendMessage =
        err.response?.data?.message || "Lỗi mạng hoặc server!";
      toast.error(`Bỏ chặn bạn thất bại: ${backendMessage}`);
    },
  });

  // ==========================================
  // 11. LẤY DANH SÁCH NGƯỜI DÙNG BỊ CHẶN (BLOCKED FRIENDS)
  // ==========================================
  const {
    data: blockedFriends = [],
    isLoading: isBlockedFriendsLoading,
    error: blockedFriendsError,
  } = useQuery<IFriend[]>({
    queryKey: ["blockedFriends"],
    queryFn: async () => {
      const response = await getBlockedFriends();
      return response.data || response;
    },
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

    handleUnFriend: (friendId: number) => unFriendMutation.mutate(friendId),
    handleBlockFriend: (friendId: number) =>
      blockFriendMutation.mutate(friendId),
    handleUnblockFriend: (friendId: number) =>
      unblockFriendMutation.mutate(friendId),

    // Blocked Friends
    blockedFriends,
    isBlockedFriendsLoading,
    blockedFriendsError: blockedFriendsError
      ? (blockedFriendsError as Error).message
      : null,

    // Avatar Action
    handleUpdateAvatar: (avtUrl: string) => addAvatarMutation.mutate(avtUrl),
    isUpdatingAvatar: addAvatarMutation.isPending,

    // Expose hàm tìm kiếm vô hạn ra ngoài
    useSearchFriendsInfinite,
  };
};
