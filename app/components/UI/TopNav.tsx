import { Link } from '@remix-run/react';

export function TopNav() {
  return (
    <nav className="h-full">
      {/* Desktop top navigation */}
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

      {/* Mobile top navigation */}
      <ul className="flex md:hidden items-center justify-between h-16 bg-gray-300">
        <li className="grow px-3">Menu</li>
        <li className="flex-none px-3">
          <Link to="/users/johndoe">Sign up</Link>
        </li>
        <li className="flex-none px-3">
          <Link to="/users/johndoe">Login</Link>
        </li>
      </ul>
    </nav>
  );
}
