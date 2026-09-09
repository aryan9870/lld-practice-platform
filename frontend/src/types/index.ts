export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  requirements: string[];
  createdAt: string;
  updatedAt: string;
}