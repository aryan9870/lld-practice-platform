import { NavLink, useNavigate } from "react-router-dom";
import { useLearner } from "../context/learnerContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `cursor-pointer transition-colors ${
    isActive ? "text-coral font-semibold" : "hover:text-cream"
  }`;

const Navbar = () => {
  const { learner, setLearner } = useLearner();
  const navigate = useNavigate();

  const handleLogout = () => {
    setLearner(null);
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center p-4 bg-ocean text-white px-20 shadow-md">
      <NavLink to="/" className="text-2xl font-semibold">
        LLD Practice Platform
      </NavLink>

      <ul className="flex gap-10 items-center">
        <NavLink to="/" className={navLinkClass}>
          Home
        </NavLink>
        <NavLink to="/problems" className={navLinkClass}>
          Problems
        </NavLink>
        <NavLink to="/my-attempts" className={navLinkClass}>
          My Attempts
        </NavLink>
      </ul>

      {learner && (
        <div className="flex items-center gap-4">
          <span className="text-cream/90 text-sm">Hi, {learner.name}</span>
          <button
            onClick={handleLogout}
            className="text-cream hover:text-coral cursor-pointer text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
