import axiosClient from "@/lib/axios";

export const getFriends = async (): Promise<any> => {
  const response = await axiosClient.get("/friends");
  return response.data;
};

export const searchFriends = async (
  query: string,
  page: number = 1,
): Promise<any> => {
  const response = await axiosClient.get("/friends/search", {
    params: { query, page },
  });
  return response.data;
};

export const addFriend = async (friendId: number): Promise<any> => {
  const response = await axiosClient.post("/friends/add", {
    friend_id: friendId,
  });
  console.log(response);
  return response.data;
};

export const getFriendRequests = async (): Promise<any> => {
  const response = await axiosClient.get("/friends/requests");
  return response.data;
};

export const acceptFriend = async (friendId: number): Promise<any> => {
  const response = await axiosClient.post("/friends/accept", {
    friend_id: friendId,
  });
  return response.data;
};
