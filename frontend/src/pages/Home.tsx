import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProblems } from "../services/problemService";
import { getAttemptsByLearnerId } from "../services/attemptService";
import ProblemCard from "../components/ProblemCard";
import type { Problem } from "../types";

interface Attempt {
  id: string;
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

const Home = () => {
  const navigate = useNavigate();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const problemsData = await getProblems();
      const attemptsData = await getAttemptsByLearnerId(LEARNER_ID);

      setProblems(problemsData.problems ?? []);
      setAttempts(attemptsData.attempts ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-ocean text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Practice Low-Level Design</h1>
          <p className="text-lg text-cream/90 mb-8">
            Solve real design problems, submit your solution, and get clear,
            actionable feedback to improve.
          </p>

          <button
            onClick={() => navigate("/problems")}
            className="bg-coral text-white px-6 py-3 rounded-lg font-semibold hover:bg-coral/90 cursor-pointer"
          >
            Start Practicing
          </button>
        </div>
      </section>

      {loading ? (
        <div className="p-6 text-center text-ink/70">Loading...</div>
      ) : (
        <>
          {/* Problems Section */}
          <section className="max-w-4xl mx-auto px-6 py-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-ink">Problems</h2>
              <button
                onClick={() => navigate("/problems")}
                className="text-ocean hover:underline cursor-pointer"
              >
                View all →
              </button>
            </div>

            {problems.length === 0 ? (
              <p className="text-ink/70">No problems available yet.</p>
            ) : (
              <div className="flex gap-6 flex-wrap">
                {problems.slice(0, 3).map((problem) => (
                  <ProblemCard
                    key={problem.id}
                    id={problem.id}
                    title={problem.title}
                    description={problem.description}
                  />
                ))}
              </div>
            )}
          </section>

          {/* My Attempts Section */}
          <section className="max-w-4xl mx-auto px-6 py-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-ink">My Attempts</h2>
              <button
                onClick={() => navigate("/my-attempts")}
                className="text-ocean hover:underline cursor-pointer"
              >
                View all →
              </button>
            </div>

            {attempts.length === 0 ? (
              <p className="text-ink/70">
                No attempts yet. Pick a problem above and get started!
              </p>
            ) : (
              <div className="space-y-4">
                {attempts.slice(0, 3).map((attempt) => (
                  <div
                    key={attempt.id}
                    onClick={() => navigate(`/attempts/${attempt.id}`)}
                    className="border border-ink/10 bg-white rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-cream"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-ink">
                        {attempt.problem?.title ?? "Unknown Problem"}
                      </h3>
                      <p className="text-sm text-ink/70">
                        {attempt.problem?.difficulty ?? "—"} · Started{" "}
                        {new Date(attempt.startedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusStyles[attempt.status] ??
                        "bg-ink/10 text-ink"
                      }`}
                    >
                      {attempt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
