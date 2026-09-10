import { useState, type FormEvent } from "react";
import { useLearner } from "../context/learnerContext";
import {
  getLearnerByEmail,
  createLearner,
} from "../services/learnerService";

const AuthModal = () => {
  const { setLearner } = useLearner();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      let learner;

      try {
        const existing = await getLearnerByEmail(email.trim());
        learner = existing.learner;
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;

        if (status === 404) {
          const created = await createLearner(
            name.trim(),
            email.trim(),
            password.trim()
          );
          learner = created.learner;
        } else {
          throw err;
        }
      }

      setLearner(learner);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-ink mb-2">Welcome</h2>
        <p className="text-ink/70 mb-6">
          Enter your details to start practicing LLD.
        </p>

        {error && <p className="text-coral text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full border border-ink/20 rounded-lg px-3 py-2 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-ink/20 rounded-lg px-3 py-2 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border border-ink/20 rounded-lg px-3 py-2 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-coral text-white py-2 rounded-lg hover:bg-coral/90 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Please wait..." : "Get Started"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
