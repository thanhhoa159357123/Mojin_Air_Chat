import axiosClient from "@/lib/axios";

export const getConversation = async () => {
  const response = await axiosClient.get(`/conversations`);
  return response.data;
};
