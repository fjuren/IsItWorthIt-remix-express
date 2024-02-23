import { Link } from '@remix-run/react';
import { useState } from 'react';

export function SideNav() {
  const [open, setOpen] = useState(true);
  return (
    <>
      {/* Desktop side navigation */}
      <aside
        className={`hidden md:flex flex-col h-full bg-gray-300 ${
          open ? 'w-72' : 'w-20'
        } `}
      >
        <button onClick={() => setOpen(!open)}>O</button>
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
      {/* Mobile side nav is contained in TopNav component as full screen menu */}
    </>
  );
}
