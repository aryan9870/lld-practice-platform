export interface Learner {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  requirements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  submissionId: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  evaluator: "RULE_BASED" | "LLM";
  score: number | null;
  summary: string | null;
  strengths: string[];
  issues: string[];
  suggestions: string[];
  reasoning: string | null;
  errorMessage: string | null;
  evaluatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}