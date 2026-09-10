import api from "./api";

export const getLearnerByEmail = async (email: string) => {
  const response = await api.get(`/learners/email/${encodeURIComponent(email)}`);
  return response.data;
};

export const createLearner = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await api.post("/learners", { name, email, password });
  return response.data;
};
