import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProblemById } from "../services/problemService";
import type { Problem } from "../types";

const ProblemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProblem = async () => {
    try {
      if (!id) {
        return;
      }

      const data = await getProblemById(id);

      setProblem(data.problem);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading problem...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="p-6">
        <p>Problem not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-2xl font-semibold">
            {problem.title}
          </h1>

          <span className="inline-block mt-2 px-4 py-1 rounded-full bg-gray-200 text-sm">
            {problem.difficulty}
          </span>
        </div>

        <button
          onClick={() => navigate("/problems")}
          className="px-4 py-1.5 border-2 rounded-lg hover:bg-gray-100 border-gray-400 cursor-pointer"
        >
          Back
        </button>
      </div>

      {/* Description */}
      <section className="mb-5">
        <h2 className="text-xl font-semibold mb-3">
          Problem Description
        </h2>

        <p className="text-gray-700 leading-7">
          {problem.description}
        </p>
      </section>

      {/* Requirements */}
      <section className="mb-5">
        <h2 className="text-xl font-semibold mb-3">
          Requirements
        </h2>

        <ul className="list-disc list-inside space-y-1">
          {problem.requirements.map((requirement, index) => (
            <li key={index} className="text-gray-700">
              {requirement}
            </li>
          ))}
        </ul>
      </section>

      {/* Start Attempt */}
      <button
        onClick={() => {
          // later we will create an attempt here
          console.log("Start attempt for:", problem.id);
        }}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
      >
        Start Attempt
      </button>
    </div>
  );
};

export default ProblemDetail;