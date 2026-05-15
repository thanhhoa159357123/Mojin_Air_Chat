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
