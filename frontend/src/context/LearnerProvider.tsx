import { useState, type ReactNode } from "react";
import { LearnerContext, type Learner } from "./learnerContext";

const STORAGE_KEY = "lld_learner";

export const LearnerProvider = ({ children }: { children: ReactNode }) => {
  const [learner, setLearnerState] = useState<Learner | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const setLearner = (learner: Learner | null) => {
    setLearnerState(learner);

    if (learner) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(learner));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <LearnerContext.Provider value={{ learner, setLearner }}>
      {children}
    </LearnerContext.Provider>
  );
};
