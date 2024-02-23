import { Link } from '@remix-run/react';
import { useState } from 'react';

export function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
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
          <button className="grow px-3" onClick={() => setOpen(!open)}>
            Hamburger menu
          </button>
          <li className="flex-none px-3">
            <Link to="/users/johndoe">Sign up</Link>
          </li>
          <li className="flex-none px-3">
            <Link to="/users/johndoe">Login</Link>
          </li>
        </ul>
      </nav>

      {/* Mobile menu (same as sidenav but for mobile) */}
      <aside
        className={`flex md:hidden flex-col h-full bg-gray-300 ${
          open ? 'w-72' : 'hidden'
        } `}
      >
        <nav>
          <li>
            <Link to="/">Placeholder</Link>
          </li>
          <ul className="flex-col ">
            <li>
              <Link to="/">Placeholder</Link>
            </li>
            <li>
              <Link to="/">Placeholder</Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
