import { NavLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className="flex justify-between items-center p-4 bg-blue-500 text-white px-20">
        <NavLink to="/" className="text-2xl font-semibold">LLD Practice Website</NavLink>
        <ul className="flex gap-10 items-center">
            <NavLink to="/" className="hover:text-gray-300 cursor-pointer">Home</NavLink>
            <NavLink to="/problems" className="hover:text-gray-300 cursor-pointer">Problems</NavLink>
            <NavLink to="/my-attempts" className="hover:text-gray-300 cursor-pointer">My Attempts</NavLink>
        </ul>
    </div>
  )
}

export default Navbar