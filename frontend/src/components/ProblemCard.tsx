import { useNavigate } from 'react-router-dom';

interface ProblemCardProps {
  id: string;
  title: string;
  description: string;
}

const ProblemCard = ({id, title, description}: ProblemCardProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="problem-card border-2 border-gray-400 p-4 rounded shadow-md flex-1">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm">{description}</p>
      <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 mt-2 cursor-pointer" onClick={() => navigate(`/problems/${id}`)}>
        View Details
      </button>
    </div>
  )
}

export default ProblemCard