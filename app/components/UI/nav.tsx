import { Link } from '@remix-run/react';

export function Nav() {
  return (
    <nav>
      <ul className="flex items-center justify-between h-16">
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
    </nav>
  );
}
