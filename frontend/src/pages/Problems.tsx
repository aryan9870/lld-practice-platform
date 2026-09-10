import { useEffect, useState } from "react";
import { getProblems } from "../services/problemService";
import ProblemCard from "../components/ProblemCard";
import type { Problem } from "../types";


const Problems = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProblems = async () => {
    try {
      const data = await getProblems();
  
      console.log(data.message);
  
      setProblems(data.problems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  if (loading) {
    return <div>Loading problems...</div>;
  }

  return (
    <div className="problems-container px-20">
      <h1 className="text-2xl font-semibold mb-4 text-center my-10 text-ink">Problems</h1>
      <div className="problem-list flex gap-20 items-center justify-center flex-wrap">
      {problems.map((problem) => (
        <ProblemCard key={problem.id} id={problem.id} title={problem.title} description={problem.description} />
      ))}
      </div>
    </div>
  );
};

export default Problems;