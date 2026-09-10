import { prisma } from "../db/db.js";
import { RuleBasedEvaluator } from "./RuleBasedEvaluator.js";
import { LLMEvaluator } from "./LLMEvaluator.js";
import type { EvaluationInput, EvaluationResult, EvaluatorType } from "./types.js";

export class EvaluationService {
  private ruleBased = new RuleBasedEvaluator();
  private llm = new LLMEvaluator();

  async evaluateSubmission(submissionId: string): Promise<void> {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { attempt: { include: { problem: true } } },
    });

    if (!submission) {
      return;
    }

    const input: EvaluationInput = {
      problem: {
        title: submission.attempt.problem.title,
        description: submission.attempt.problem.description,
        requirements: submission.attempt.problem.requirements,
        difficulty: submission.attempt.problem.difficulty,
      },
      submission: {
        content: submission.content,
        format: submission.format,
      },
    };

    try {
      const ruleResult = await this.ruleBased.evaluate(input);

      let result: EvaluationResult = ruleResult;
      let evaluator: EvaluatorType = "RULE_BASED";

      try {
        const llmResult = await this.llm.evaluate(input);
        result = {
          score: ruleResult.score,
          summary: llmResult.summary || ruleResult.summary,
          strengths: ruleResult.strengths,
          issues: ruleResult.issues,
          suggestions: llmResult.suggestions.length
            ? llmResult.suggestions
            : ruleResult.suggestions,
          reasoning:
            ruleResult.reasoning + "\n\nLLM qualitative review:\n" + llmResult.reasoning,
        };
        evaluator = "LLM";
      } catch (llmError) {
        result.reasoning +=
          "\n\n(LLM evaluation skipped: " +
          (llmError instanceof Error ? llmError.message : "unavailable") +
          ")";
      }

      await prisma.feedback.update({
        where: { submissionId },
        data: {
          status: "COMPLETED",
          evaluator,
          score: result.score,
          summary: result.summary,
          strengths: result.strengths,
          issues: result.issues,
          suggestions: result.suggestions,
          reasoning: result.reasoning,
          evaluatedAt: new Date(),
        },
      });

      await prisma.attempt.update({
        where: { id: submission.attemptId },
        data: { status: "COMPLETED" },
      });
    } catch (error) {
      await prisma.feedback.update({
        where: { submissionId },
        data: {
          status: "FAILED",
          errorMessage:
            error instanceof Error ? error.message : "Evaluation failed",
          evaluatedAt: new Date(),
        },
      });
    }
  }
}

export const evaluationService = new EvaluationService();
