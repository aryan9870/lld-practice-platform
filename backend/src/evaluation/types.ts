export type EvaluatorType = "RULE_BASED" | "LLM";

export interface EvaluationProblem {
  title: string;
  description: string;
  requirements: string[];
  difficulty: string;
}

export interface EvaluationSubmission {
  content: string;
  format: string;
}

export interface EvaluationInput {
  problem: EvaluationProblem;
  submission: EvaluationSubmission;
}

export interface EvaluationResult {
  score: number;
  summary: string;
  strengths: string[];
  issues: string[];
  suggestions: string[];
  reasoning: string;
}

export interface Evaluator {
  readonly type: EvaluatorType;
  evaluate(input: EvaluationInput): Promise<EvaluationResult>;
}
