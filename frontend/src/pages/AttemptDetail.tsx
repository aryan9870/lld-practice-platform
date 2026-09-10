import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAttemptById,
  createAttempt,
  getAttemptsByLearnerAndProblem,
} from "../services/attemptService";
import { createSubmission } from "../services/submissionService";
import { getFeedbackByAttemptId } from "../services/feedbackService";
import { useLearner } from "../context/learnerContext";
import type { Feedback } from "../types";

interface Attempt {
  id: string;
  status: string;
  startedAt: string;
  submittedAt: string | null;
  problem: {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    difficulty: string;
  };
  learner: {
    id: string;
    name: string;
    email: string;
  };
  submission: {
    id: string;
    format: string;
    content: string;
  } | null;
}

interface HistoryAttempt {
  id: string;
  status: string;
  createdAt: string;
  submission: {
    feedback: {
      score: number | null;
      status: string;
    } | null;
  } | null;
}

const statusStyles: Record<string, string> = {
  IN_PROGRESS: "bg-coral/15 text-coral",
  SUBMITTED: "bg-ocean/15 text-ocean",
  COMPLETED: "bg-green-100 text-green-700",
};

const AttemptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { learner } = useLearner();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [history, setHistory] = useState<HistoryAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tryAgainLoading, setTryAgainLoading] = useState(false);

  const [format, setFormat] = useState("TEXT");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const pollFeedback = async (attemptId: string) => {
    setFeedbackLoading(true);
    for (let i = 0; i < 30; i++) {
      try {
        const data = await getFeedbackByAttemptId(attemptId);
        const fb = data.feedback as Feedback;
        if (!mountedRef.current) return;
        setFeedback(fb);
        if (fb.status === "COMPLETED" || fb.status === "FAILED") {
          setFeedbackLoading(false);
          return;
        }
      } catch (error) {
        console.error(error);
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    if (mountedRef.current) setFeedbackLoading(false);
  };

  const loadAttempt = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getAttemptById(id);
      setAttempt(data.attempt);
      if (data.attempt.submission) {
        pollFeedback(id);
      }
      if (learner) {
        const historyData = await getAttemptsByLearnerAndProblem(
          learner.id,
          data.attempt.problem.id
        );
        setHistory(historyData.attempts ?? []);
      }
    } catch (error) {
      console.error(error);
      setLoadError("Failed to load attempt.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttempt();
  }, [id, learner]);

  const handleTryAgain = async () => {
    if (!attempt || !learner) return;
    setTryAgainLoading(true);
    try {
      const data = await createAttempt(learner.id, attempt.problem.id);
      navigate(`/attempts/${data.attempt.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setTryAgainLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!attempt) return;

    if (!content.trim()) {
      setSubmitError("Please write your solution before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      await createSubmission(attempt.id, format, content);
      setAttempt((prev) =>
        prev ? { ...prev, status: "SUBMITTED", submittedAt: new Date().toISOString() } : prev
      );
      pollFeedback(attempt.id);
    } catch (error) {
      console.error(error);
      setSubmitError("Failed to submit your solution. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="m-20 text-ink/70">Loading...</div>;
  }

  if (loadError || !attempt) {
    return <div className="m-20 text-coral">{loadError || "Attempt not found"}</div>;
  }

  const isSubmitted = !!attempt.submission || attempt.status !== "IN_PROGRESS";

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{attempt.problem.title}</h1>
          <p className="text-ink/70 mt-1">
            <span className="font-semibold">Difficulty:</span> {attempt.problem.difficulty}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            statusStyles[attempt.status] ?? "bg-ink/10 text-ink"
          }`}
        >
          {attempt.status}
        </span>
      </div>

      {/* Problem context */}
      <div className="mt-6 border border-ink/10 bg-white rounded-lg p-5">
        <h3 className="font-semibold text-ink mb-2">Description</h3>
        <p className="text-ink/80 leading-7">{attempt.problem.description}</p>

        <h3 className="font-semibold text-ink mb-2 mt-4">Requirements</h3>
        <ul className="list-disc pl-5 text-ink/80">
          {attempt.problem.requirements.map((requirement) => (
            <li key={requirement}>{requirement}</li>
          ))}
        </ul>
      </div>

      {/* Progress */}
      {history.length > 0 && (
        <div className="mt-6 border border-ink/10 bg-white rounded-lg p-5">
          <h3 className="font-semibold text-ink mb-3">Your Progress</h3>
          <div className="space-y-2">
            {history.map((h, idx) => {
              const isCurrent = h.id === attempt.id;
              const score = h.submission?.feedback?.score;
              return (
                <div
                  key={h.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isCurrent ? "bg-ocean/10 border border-ocean/20" : "bg-cream"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">Attempt {idx + 1}</span>
                    {isCurrent && (
                      <span className="text-xs text-ocean font-medium">(current)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusStyles[h.status] ?? "bg-ink/10 text-ink"
                      }`}
                    >
                      {h.status}
                    </span>
                    {score != null ? (
                      <span className="font-semibold text-ocean">{score}/100</span>
                    ) : (
                      <span className="text-ink/50">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Solution form */}
      {!isSubmitted && (
        <form onSubmit={handleSubmit} className="mt-8">
          <h2 className="text-xl font-semibold text-ink mb-4">Your Solution</h2>

          <div className="mb-4">
            <label className="block font-semibold text-ink mb-2">Solution Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="border border-ink/20 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="TEXT">Text</option>
              <option value="CODE">Code</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-semibold text-ink mb-2">Solution</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your classes, responsibilities, relationships, and trade-offs..."
              rows={15}
              className="w-full border border-ink/20 rounded-lg p-4 resize-y bg-white"
            />
          </div>

          {submitError && <p className="text-coral text-sm mb-4">{submitError}</p>}

          <div className="text-center">
            <button
              type="submit"
              disabled={submitting}
              className="bg-coral text-white py-2 px-6 rounded-lg hover:bg-coral/90 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Submitting..." : "Submit Solution"}
            </button>
          </div>
        </form>
      )}

      {/* Feedback */}
      {isSubmitted && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-ink mb-4">Feedback</h2>

          {!feedback && feedbackLoading && (
            <div className="border border-ink/10 bg-white rounded-lg p-8 text-center text-ink/70">
              Evaluating your solution...
            </div>
          )}

          {feedback && feedback.status === "PENDING" && (
            <div className="border border-ink/10 bg-white rounded-lg p-8 text-center text-ink/70">
              Evaluating your solution...
            </div>
          )}

          {feedback && feedback.status === "FAILED" && (
            <div className="border border-ink/10 bg-white rounded-lg p-6">
              <p className="text-coral font-medium">Evaluation failed.</p>
              <p className="text-ink/70 mt-2">{feedback.errorMessage}</p>
            </div>
          )}

          {feedback && feedback.status === "COMPLETED" && (
            <div className="border border-ink/10 bg-white rounded-lg p-6">
              <div className="flex items-center gap-6 mb-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-ocean">
                    {feedback.score ?? "—"}
                  </div>
                  <div className="text-sm text-ink/60">/ 100</div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-ink">{feedback.summary}</p>
                  <p className="text-sm text-ink/60 mt-1">
                    Evaluated by {feedback.evaluator === "LLM" ? "AI + rules" : "rule-based engine"}
                  </p>
                </div>
              </div>

              {feedback.strengths.length > 0 && (
                <Section title="Strengths" items={feedback.strengths} tone="ocean" />
              )}
              {feedback.issues.length > 0 && (
                <Section title="Issues" items={feedback.issues} tone="coral" />
              )}
              {feedback.suggestions.length > 0 && (
                <Section title="Suggestions" items={feedback.suggestions} tone="ink" />
              )}

              {feedback.reasoning && (
                <div className="mt-4">
                  <h4 className="font-semibold text-ink mb-2">Reasoning</h4>
                  <pre className="text-sm text-ink/80 whitespace-pre-wrap bg-cream rounded-lg p-4">
                    {feedback.reasoning}
                  </pre>
                </div>
              )}
            </div>
          )}

          {(feedback?.status === "COMPLETED" || feedback?.status === "FAILED") && (
            <div className="mt-6 text-center">
              <button
                onClick={handleTryAgain}
                disabled={tryAgainLoading}
                className="bg-ocean text-white py-2 px-6 rounded-lg hover:bg-ocean/90 disabled:opacity-50 cursor-pointer"
              >
                {tryAgainLoading ? "Starting..." : "Try Again"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Section = ({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "ocean" | "coral" | "ink";
}) => {
  const dotColor =
    tone === "ocean" ? "bg-ocean" : tone === "coral" ? "bg-coral" : "bg-ink/60";
  return (
    <div className="mt-4">
      <h4 className="font-semibold text-ink mb-2">{title}</h4>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-ink/80">
            <span className={`w-2 h-2 rounded-full mt-2 ${dotColor}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AttemptDetail;
