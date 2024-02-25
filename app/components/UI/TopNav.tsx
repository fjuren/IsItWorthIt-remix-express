import { Link } from '@remix-run/react';
import { useState } from 'react';

export function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="relative">
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
          <ul className="flex md:hidden items-center justify-between h-16 bg-gray-300 z">
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
      </header>

      {/* Mobile menu (same as sidenav but for mobile) */}
      <aside
        className={`md:hidden ${
          open
            ? 'z-10 flex flex-col bg-gray-300 w-full h-full fixed overflow-x-hidden'
            : 'hidden'
        } `}
      >
        {/* <aside
        // style={{ top: '10%' }}
        className={`md:hidden z-10 fixed h-full bg-gray-300 ${
          open ? 'w-full' : 'hidden'
        } `}
      > */}
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
