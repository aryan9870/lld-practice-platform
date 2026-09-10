import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAttemptById } from "../services/attemptService";

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


const AttemptDetail = () => {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams<{ id: string }>();

  const fetchAttempt = async () => {
    try {
        if (!id) {
          return;
        }
  
        const data = await getAttemptById(id);
        console.log(data.attempt);
        setAttempt(data.attempt);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
  }

  useEffect(() => {
    fetchAttempt();
  }, []);

  if (loading) {
    return <div className="m-20">Loading...</div>;
  
  }

  if (!attempt) {
    return <div className="m-20">Attempt not found</div>;
  }

  return (
    <>
    <div className="m-20">
      <div className=" flex justify-between">
        <div>
          <p><span className="font-semibold">Problem:</span> {attempt.problem.title}</p>
          <p><span className="font-semibold">Difficulty:</span> {attempt.problem.difficulty}</p>
        </div>
        <div><span className="font-semibold">Status:</span> {attempt.status}</div>
      </div>
      <div className="flex flex-col mt-5">
        <div className="">
          <h3 className="font-semibold mb-2">Description:</h3>
          {attempt.problem.description}
        </div>
        <div className="">
          <h3 className="font-semibold mb-2">Requirements:</h3>

          <ul className="list-disc pl-5">
              {attempt.problem.requirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
              ))}
          </ul>
        </div>
      </div>
        {/* Solution Form */}
        <div className="mt-8">

            <h2 className="text-xl font-semibold mb-4">
                Your Solution
            </h2>

            <form>

                {/* Format */}
                <div className="mb-4 flex justify-between items-center">
                    <label className="block font-semibold mb-2">
                        Solution Format
                    </label>

                    <select
                        className="border border-gray-400 rounded-sm px-3 py-1.5"
                    >
                        <option value="TEXT">Text</option>
                        <option value="MARKDOWN">Markdown</option>
                    </select>
                </div>

                {/* Solution Content */}
                <div className="mb-4">

                    <label className="block font-semibold mb-2">
                        Solution
                    </label>

                    <textarea
                        placeholder="Write your solution here..."
                        rows={15}
                        className="w-full border border-gray-400 rounded-sm p-4 resize-y"
                    />

                </div>

                {/* Submit */}
                <div className="text-center">

                    <button
                        type="submit"
                        className="border py-2 px-5 rounded-sm disabled:opacity-50 cursor-pointer"
                    >
                        Submit Solution
                    </button>

                </div>

            </form>

        </div>
      </div>
    </>
  )
}

export default AttemptDetail