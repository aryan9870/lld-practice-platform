import api from "./api";

export const getProblems = async () => {
  const response = await api.get("/problems");

  return response.data;
};

export const getProblemById = async (id: string) => {
  const response = await api.get(`/problems/${id}`);

  return response.data;
};