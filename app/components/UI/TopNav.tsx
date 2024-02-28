import { Link } from '@remix-run/react';
import { useState } from 'react';
import { Theme, useTheme } from '~/utils/theme-provider';

export function TopNav() {
  // ---- dark mode for mobile menu ----
  const [theme, setTheme] = useTheme();
  const darkModeClasses =
    theme === Theme.DARK ? 'bg-black text-white' : 'bg-white text-black';
  // ------------------------------------
  const [open, setOpen] = useState(false);

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
    );
  };

  return (
    <>
      <header className="relative">
        <nav className="h-full">
          {/* Desktop top navigation */}
          <ul className="hidden md:flex items-center justify-between h-16">
            <li className="grow px-3">
              <Link to="/">Home (logo)</Link>
            </li>
            <li>
              <button onClick={toggleTheme}>toggle</button>
            </li>
            <li className="flex-none px-3">
              <Link to="/users/johndoe">Sign up</Link>
            </li>
            <li className="flex-none px-3">
              <Link to="/users/johndoe">Login</Link>
            </li>
          </ul>

          {/* Mobile top navigation */}
          <ul className="flex md:hidden items-center justify-between h-16">
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
            ? 'z-10 flex flex-col w-full h-full fixed overflow-x-hidden'
            : 'hidden'
        } ${
          darkModeClasses // Handles mobile menu dark mode
        }`}
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
            <li>
              <button onClick={toggleTheme}>toggle</button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
