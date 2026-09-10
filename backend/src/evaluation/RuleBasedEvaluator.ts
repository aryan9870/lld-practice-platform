import type {
  Evaluator,
  EvaluationInput,
  EvaluationResult,
} from "./types.js";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "for", "with", "is",
  "are", "be", "that", "this", "it", "as", "on", "at", "by", "should",
  "will", "can", "must", "each", "all", "any", "your", "you", "we",
  "design", "system", "implement", "solution",
]);

export class RuleBasedEvaluator implements Evaluator {
  readonly type = "RULE_BASED";

  async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
    const content = input.submission.content ?? "";
    const text = content.toLowerCase();
    const strengths: string[] = [];
    const issues: string[] = [];
    const suggestions: string[] = [];

    const dims = {
      content: 0,
      entities: 0,
      relationships: 0,
      responsibilities: 0,
      principles: 0,
      requirements: 0,
    };

    if (content.trim().length === 0) {
      return {
        score: 0,
        summary: "No solution was provided.",
        strengths: [],
        issues: ["Your solution is empty."],
        suggestions: ["Write out your design before submitting."],
        reasoning: "Empty submission received no points.",
      };
    }

    dims.content = 10;
    strengths.push("Provided a non-empty solution.");

    const declarations =
      content.match(
        /\b(?:class|interface|abstract\s+class|enum|record)\s+[A-Za-z_]\w*/g
      ) ?? [];
    const entityCount = new Set(declarations.map((d) => d.toLowerCase())).size;
    dims.entities = Math.min(entityCount, 5) * 4;
    if (entityCount === 0) {
      issues.push(
        "No classes or interfaces detected. Identify the key entities and their responsibilities."
      );
      suggestions.push(
        "Start by listing the main classes/interfaces from the requirements."
      );
    } else {
      strengths.push(
        `Identified ${entityCount} distinct class/interface declaration(s).`
      );
    }

    const relationshipTerms = [
      "extends", "implements", "composition", "aggregation", "association",
      "has-a", "is-a", "inheritance", "dependency",
    ];
    const foundRelationships = relationshipTerms.filter((t) => text.includes(t));
    dims.relationships = Math.min(foundRelationships.length, 3) * 5;
    if (foundRelationships.length === 0) {
      issues.push(
        "No relationships between entities were described (inheritance, composition, or interfaces)."
      );
      suggestions.push(
        "Describe how classes relate: inheritance (is-a), composition (has-a), or interfaces."
      );
    } else {
      strengths.push(
        `Described relationships: ${foundRelationships.join(", ")}.`
      );
    }

    const responsibilityTerms = [
      "method", "function", "responsib", "encapsulat", "behavior",
    ];
    const foundResponsibilities = responsibilityTerms.filter((t) =>
      text.includes(t)
    );
    dims.responsibilities = Math.min(foundResponsibilities.length, 3) * 5;
    if (foundResponsibilities.length === 0) {
      issues.push("No methods or responsibilities were described for classes.");
      suggestions.push(
        "For each class, list its key methods and what it is responsible for."
      );
    } else {
      strengths.push("Classes have defined responsibilities/methods.");
    }

    const solidTerms = [
      "single responsibility", "open/closed", "open-closed", "liskov",
      "interface segregation", "dependency inversion", "srp", "ocp", "lsp",
      "isp", "dip", "solid",
    ];
    const foundSolid = solidTerms.filter((t) => text.includes(t));
    dims.principles = Math.min(foundSolid.length, 4) * 5;
    if (foundSolid.length === 0) {
      suggestions.push(
        "Consider which SOLID principles apply (e.g., Single Responsibility, Open/Closed) and mention the trade-offs."
      );
    } else {
      strengths.push(`Referenced design principles: ${foundSolid.join(", ")}.`);
    }

    const requirements = input.problem.requirements ?? [];
    if (requirements.length > 0) {
      const covered = requirements.filter((req) =>
        this.coversRequirement(text, req)
      );
      const coverage = covered.length / requirements.length;
      dims.requirements = Math.round(coverage * 20);
      if (coverage === 1) {
        strengths.push(`Addressed all ${requirements.length} requirements.`);
      } else {
        issues.push(
          `Covered ${covered.length} of ${requirements.length} requirements.`
        );
        const missing = requirements.filter((req) => !covered.includes(req));
        suggestions.push(
          `Make sure you address: ${missing.slice(0, 3).join("; ")}`
        );
      }
    } else {
      dims.requirements = 20;
    }

    const score = Math.round(
      Object.values(dims).reduce((sum, v) => sum + v, 0)
    );

    const summary =
      score >= 70
        ? "Strong design with room to refine."
        : score >= 40
          ? "Reasonable start; several areas need work."
          : "Design is incomplete; revisit the core concepts.";

    const reasoning = [
      "Rule-based (deterministic) evaluation:",
      `- Content present: ${dims.content}/10`,
      `- Entities (classes/interfaces): ${dims.entities}/20`,
      `- Relationships: ${dims.relationships}/15`,
      `- Responsibilities/methods: ${dims.responsibilities}/15`,
      `- Design principles: ${dims.principles}/20`,
      `- Requirements coverage: ${dims.requirements}/20`,
      `Total: ${score}/100`,
    ].join("\n");

    return { score, summary, strengths, issues, suggestions, reasoning };
  }

  private coversRequirement(text: string, requirement: string): boolean {
    const keywords = requirement
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w));
    if (keywords.length === 0) return true;
    return keywords.some((k) => text.includes(k));
  }
}
