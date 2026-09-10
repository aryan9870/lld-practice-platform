import api from "./api";

export const getFeedbackByAttemptId = async (attemptId: string) => {
  const response = await api.get(`/feedback/attempt/${attemptId}`);
  return response.data;
};
