import { NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `cursor-pointer transition-colors ${
    isActive ? "text-coral font-semibold" : "hover:text-cream"
  }`;

const Navbar = () => {
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
    </div>
  );
};

export default Navbar;
