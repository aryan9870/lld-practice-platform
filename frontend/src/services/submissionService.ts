import api from "./api";

export const createSubmission = async (
  attemptId: string,
  format: string,
  content: string
) => {
  const response = await api.post("/submissions", { attemptId, format, content });
  return response.data;
};
