import type {
  Evaluator,
  EvaluationInput,
  EvaluationResult,
} from "./types.js";

export class LLMEvaluator implements Evaluator {
  readonly type = "LLM";

  async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const systemPrompt = `You are a senior software engineer reviewing a Low-Level Design solution.
Provide concise, actionable, qualitative feedback. There can be more than one valid design, so focus on
coherence, responsibilities, abstractions, relationships, and trade-offs.
Respond ONLY with valid JSON in exactly this shape:
{ "summary": string, "strengths": string[], "issues": string[], "suggestions": string[], "reasoning": string }`;

    const userPrompt = [
      `Problem: ${input.problem.title}`,
      input.problem.description,
      "",
      "Requirements:",
      ...(input.problem.requirements ?? []).map((r) => `- ${r}`),
      "",
      `Solution (${input.submission.format}):`,
      input.submission.content,
    ].join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const raw = data.choices?.[0]?.message?.content;
    if (!raw) {
      throw new Error("LLM API returned an empty response");
    }

    const parsed = JSON.parse(raw) as Partial<EvaluationResult>;

    return {
      score: 0,
      summary: parsed.summary ?? "",
      strengths: parsed.strengths ?? [],
      issues: parsed.issues ?? [],
      suggestions: parsed.suggestions ?? [],
      reasoning: parsed.reasoning ?? "",
    };
  }
}
