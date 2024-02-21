import { Link } from '@remix-run/react';

export function Nav() {
  return (
    <nav className="h-full">
      {/* Desktop navigation */}
      <ul className="hidden md:flex items-center justify-between h-16 bg-gray-300">
        <li className="grow px-3">
          <Link to="/">Home (logo)</Link>
        </li>
        <li className="flex-none px-3">
          <Link to="/users/johndoe">Sign up</Link>
        </li>
        <li className="flex-none px-3">
          <Link to="/users/johndoe">Login</Link>
        </li>
      </ul>

      {/* Mobile navigation */}
      <ul className="flex md:hidden items-center justify-between h-16 bg-gray-300">
        <li className="grow px-3">Menu</li>
        <li className="flex-none px-3">
          <Link to="/users/johndoe">Sign up</Link>
        </li>
        <li className="flex-none px-3">
          <Link to="/users/johndoe">Login</Link>
        </li>
      </ul>

      {/* Desktop side navigation */}
      <ul className="bg-gray-400 h-full w-72 flex-col ">
        <li>Highest rated games</li>
        <li>Most comments</li>
      </ul>
    </nav>
  );
}
