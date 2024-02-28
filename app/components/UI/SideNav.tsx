import { useState } from 'react';
import { Link } from '@remix-run/react';

export function SideNav() {
  const [open, setOpen] = useState(true);
  return (
    <>
      {/* Desktop side navigation */}
      <div
        className={`hidden md:flex flex-col h-full ${
          open ? 'w-60' : 'w-20'
        } relative`}
      >
        <button className="absolute right-0" onClick={() => setOpen(!open)}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${
              open ? '' : 'rotate-180'
            } bg-slate-400 size-5 rounded-md`}
          >
            <path
              d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
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
      </div>
      {/* Mobile side nav is contained in TopNav component as full screen menu */}
    </>
  );
}
