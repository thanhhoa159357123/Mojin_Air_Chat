import axiosClient from "@/lib/axios";

export const getMessage = async (id: number) => {
  const response = await axiosClient.get(`/messages/${id}`);
  return response.data;
};

export const sendMessage = async (friend_id: number, content: string) => {
  const response = await axiosClient.post(`/messages/`, {
    friend_id,
    content,
  });
  return response.data;
};

export const deleteMessage = async (message_id: number, friend_id: number) => {
  const response = await axiosClient.delete(
    `/messages/${friend_id}/${message_id}`,
  );
  console.log(response.data);
  return response.data;
};

export const deleteAllMessages = async (friend_id: number) => {
  const response = await axiosClient.delete(`/messages/${friend_id}`);
  return response.data;
};
