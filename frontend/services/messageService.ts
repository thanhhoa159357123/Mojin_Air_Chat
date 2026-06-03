import axiosClient from "@/lib/axios";

export const getMessage = async (
  id: number,
  type: "private" | "group",
  page = 1,
  byFriend = false,
) => {
  const byParam = byFriend ? "&by=friend" : "";
  const response = await axiosClient.get(
    `/messages/${id}?type=${type}&page=${page}${byParam}`,
  );
  return response.data;
};

export const sendMessage = async (
  id: number,
  chatType: "private" | "group",
  content: string,
  parent_id?: number | null,
  msgType: string = "text",
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = { content, parent_id, type: msgType };

  // Logic chia ngã rẽ cho Backend hiểu
  if (chatType === "group") {
    payload.conversation_id = id;
  } else {
    payload.friend_id = id;
  }

  const response = await axiosClient.post(`/messages/`, payload);
  return response.data;
};

export const deleteMessage = async (
  conversationId: number,
  message_id: number,
) => {
  const response = await axiosClient.delete(
    `/messages/${conversationId}/${message_id}`,
  );
  console.log(response.data);
  return response.data;
};

export const deleteAllMessages = async (conversationId: number) => {
  const response = await axiosClient.delete(`/messages/${conversationId}`);
  return response.data;
};

export const editMessage = async (
  conversationId: number,
  messageId: number,
  content: string, // 💡 BẮT BUỘC: Phải có nội dung mới để BE cập nhật
) => {
  const response = await axiosClient.post(
    `/messages/${conversationId}/${messageId}`,
    {
      content: content, // Nội dung tin nhắn đã sửa "em ngủ dữ z"
      _method: "PUT", // 💡 BÙA CHÚ: Giả lập PUT qua POST để Laravel không bị rỗng request
    },
  );
  return response.data; // Trả về data để FE húp cho tiện
};
