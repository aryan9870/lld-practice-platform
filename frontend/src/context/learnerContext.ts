import { createContext, useContext } from "react";

export interface Learner {
  id: string;
  name: string;
  email: string;
}

export interface LearnerContextValue {
  learner: Learner | null;
  setLearner: (learner: Learner | null) => void;
}

export const LearnerContext = createContext<LearnerContextValue | undefined>(
  undefined
);

export const useLearner = () => {
  const ctx = useContext(LearnerContext);
  if (!ctx) {
    throw new Error("useLearner must be used within a LearnerProvider");
  }
  return ctx;
};
