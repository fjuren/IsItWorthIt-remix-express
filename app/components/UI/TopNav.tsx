import { Link } from '@remix-run/react';
import { useState } from 'react';
// import { Theme, useTheme } from '~/utils/theme-provider';

export function TopNav() {
  const [open, setOpen] = useState(false);

  // const toggleTheme = () => {
  //   setTheme((prevTheme) =>
  //     prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
  //   );
  // };

  return (
    <>
      <header className="relative">
        <nav className="h-full border-b border-black">
          {/* Desktop top navigation */}
          <ul className="hidden md:flex items-center justify-between h-16">
            <li className="grow px-3">
              <Link to="/">Home (logo)</Link>
            </li>
            <li>{/* <button onClick={toggleTheme}>toggle</button> */}</li>
            <li className="flex-none px-3">
              <Link to="/signup">Sign up</Link>
            </li>
            <li className="flex-none px-3">
              <Link to="/login">Login</Link>
            </li>
          </ul>

          {/* Mobile top navigation */}
          <ul className="flex md:hidden items-center justify-between h-16">
            <button className="grow px-3" onClick={() => setOpen(!open)}>
              Hamburger menu
            </button>
            <li className="flex-none px-3">
              <Link to="/signup">Sign up</Link>
            </li>
            <li className="flex-none px-3">
              <Link to="/login">Login</Link>
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
        } bg-inherit dark: bg-inherit
        `}
      >
        <nav>
          <ul className="flex-col ">
            <li>
              <Link to="/">Games</Link>
            </li>
            <li>
              <Link to="/">Placeholder</Link>
            </li>
            <li>
              <Link to="/">Placeholder</Link>
            </li>
            <li>{/* <button onClick={toggleTheme}>toggle</button> */}</li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
