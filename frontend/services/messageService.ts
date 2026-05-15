import axiosClient from "@/lib/axios";

export const getMessage = async (id: number, type: "private" | "group") => {
  const response = await axiosClient.get(`/messages/${id}?type=${type}`);
  return response.data;
};

export const sendMessage = async (
  id: number,
  type: "private" | "group", // Thêm type vào đây
  content: string,
  parent_id?: number | null,
  msgType: string = "text",
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = { content, parent_id, type: msgType };

  if (type === "private") {
    payload.friend_id = id;
  } else {
    payload.conversation_id = id;
  }

  const response = await axiosClient.post(`/messages/`, payload);
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
