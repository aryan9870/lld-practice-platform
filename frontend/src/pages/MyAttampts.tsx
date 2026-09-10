import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAttemptsByLearnerId } from "../services/attemptService";

interface Attempt {
  id: string;
  problemId: string;
  status: string;
  startedAt: string;
  submittedAt: string | null;
  problem: {
    id: string;
    title: string;
    difficulty: string;
  };
}

const LEARNER_ID = "6b840175-dfc4-49a9-bebf-c7bea72ed015";

const statusStyles: Record<string, string> = {
  IN_PROGRESS: "bg-coral/15 text-coral",
  SUBMITTED: "bg-ocean/15 text-ocean",
  COMPLETED: "bg-green-100 text-green-700",
};

const MyAttampts = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const data = await getAttemptsByLearnerId(LEARNER_ID);
      setAttempts(data.attempts);
    } catch (err) {
      console.error(err);
      setError("Failed to load your attempts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  if (loading) {
    return <div className="p-6 text-ink/70">Loading attempts...</div>;
  }

  if (error) {
    return <div className="p-6 text-coral">{error}</div>;
  }

  if (attempts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4 text-ink">My Attempts</h1>
        <p className="text-ink/70">
          No attempts yet. Pick a problem and start practicing!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6 text-ink">My Attempts</h1>

      <div className="space-y-4">
        {attempts.map((attempt) => (
          <div
            key={attempt.id}
            onClick={() => navigate(`/attempts/${attempt.id}`)}
            className="border border-ink/10 bg-white rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div>
              <h2 className="text-lg font-semibold text-ink">
                {attempt.problem?.title ?? "Unknown Problem"}
              </h2>
              <p className="text-sm text-ink/70">
                {attempt.problem?.difficulty ?? "—"} · Started{" "}
                {new Date(attempt.startedAt).toLocaleDateString()}
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
        ))}
      </div>
    </div>
  );
};

export default MyAttampts;
