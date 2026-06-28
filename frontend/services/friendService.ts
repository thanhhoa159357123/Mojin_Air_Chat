import axiosClient from "@/lib/axios";
import { IFriend } from "@/types/friend";

export const getFriends = async (): Promise<{ data: IFriend[] }> => {
  const response = await axiosClient.get("/friends");
  return response.data;
};

export const searchFriends = async (
  query: string,
  page: number = 1,
): Promise<{ data: IFriend[]; hasMore: boolean }> => {
  const response = await axiosClient.get("/friends/search", {
    params: { query, page },
  });
  return response.data;
};

export const addFriend = async (friendId: number): Promise<IFriend> => {
  const response = await axiosClient.post("/friends/add", {
    friend_id: friendId,
  });
  // Trả về cục data friend thực sự chứ không trả về cái chữ "message"
  return response.data?.data || response.data; 
};

export const getFriendRequests = async (): Promise<{ data: IFriend[] }> => {
  const response = await axiosClient.get("/friends/requests");
  return response.data;
};

export const acceptFriend = async (
  friendId: number,
): Promise<{ message: string }> => {
  const response = await axiosClient.post("/friends/accept", {
    friend_id: friendId,
  });
  return response.data;
};

export const rejectFriend = async (
  friendId: number,
): Promise<{ message: string }> => {
  const response = await axiosClient.post("/friends/reject", {
    friend_id: friendId,
  });
  return response.data;
};

export const addAvatar = async (avtUrl: string) => {
  const response = await axiosClient.post("/add-avatar", {
    avatar: avtUrl,
  });
  return response.data;
};
