import api from "./api";

export const createAttempt = async (
    learnerId: string,
    problemId: string
) => {
    const response = await api.post("/attempts", {
        learnerId,
        problemId,
    });

    return response.data;
};

export const getAttemptById = async (id: string) => {
    const response = await api.get(`/attempts/${id}`);

    return response.data;
};

///learners/:learnerId/attempts
export const getAttemptsByLearnerId = async (
    learnerId: string
) => {
    const response = await api.get(
        `/attempts/learners/${learnerId}/attempts`
    );

    return response.data;
};