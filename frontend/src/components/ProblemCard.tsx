import { useNavigate } from "react-router-dom";

interface ProblemCardProps {
  id: string;
  title: string;
  description: string;
}

const ProblemCard = ({ id, title, description }: ProblemCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="border border-ink/10 bg-white rounded-lg p-5 shadow-sm flex-1 flex flex-col">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="text-sm text-ink/70 mt-1 line-clamp-3">{description}</p>
      <button
        className="bg-coral text-white px-4 py-2 rounded-lg hover:bg-coral/90 mt-4 self-start cursor-pointer"
        onClick={() => navigate(`/problems/${id}`)}
      >
        View Details
      </button>
    </div>
  );
};

export default ProblemCard;
