import axiosClient from "@/lib/axios";

export const getConversation = async () => {
  const response = await axiosClient.get(`/conversations`);
  return response.data;
};

export const createConversation = async (
  label: string,
  participantIds: number[],
) => {
  const response = await axiosClient.post(`/conversations`, {
    label,
    participant_ids: participantIds,
  });
  return response.data;
};

// Gọi khi gõ phím
export const sendTypingSignal = async (conversationId: number) => {
  const response = await axiosClient.post(
    `/conversations/${conversationId}/typing`,
  );
  return response.data;
};

// Gọi khi online/offline
export const updateUserStatus = async (status: "online" | "offline") => {
  const response = await axiosClient.post(`/user/status`, { status });
  return response.data;
};

// Đánh dấu đã đọc tin nhắn trong cuộc trò chuyện
export const markConversationRead = async (conversationId: number) => {
  const response = await axiosClient.post(
    `/conversations/${conversationId}/read`,
  );
  return response.data;
};

// Thêm thành viên vào nhóm
export const addParticipants = async (
  conversationId: number,
  userIds: number[],
) => {
  const response = await axiosClient.post(
    `/conversations/${conversationId}/add-participants`,
    {
      user_ids: userIds,
    },
  );
  return response.data;
};

// Lấy danh sách thành viên trong nhóm
export const getParticipants = async (conversationId: number) => {
  const response = await axiosClient.get(
    `/conversations/${conversationId}/participants`,
  );
  return response.data;
};

// Kick thành viên khỏi nhóm
export const removeParticipants = async (
  conversationId: number,
  userIds: number[],
) => {
  const response = await axiosClient.post(
    `/conversations/${conversationId}/remove-participants`,
    {
      user_ids: userIds,
    },
  );
  return response.data;
};
