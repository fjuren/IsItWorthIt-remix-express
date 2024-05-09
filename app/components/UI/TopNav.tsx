import { Link } from '@remix-run/react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/UI/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/UI/DropdownMenu';

function ProfileDesktopMenu({ username }: { username: string }) {
  const firstLetter = username.charAt(0).toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage
          // src=""
          />
          <AvatarFallback>{firstLetter}</AvatarFallback>
        </Avatar>
        {/* {username} */}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <Link to="/">
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopNav({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="relative">
        <nav className="h-full border-b border-black">
          {/* Desktop top navigation */}
          <ul className="hidden md:flex items-center justify-between h-16">
            <li className="grow px-3">
              <Link to="/">Home (logo)</Link>
            </li>
            {user ? (
              <li className="flex-none px-3">
                <ProfileDesktopMenu username={user.username} />
                {/* <Link to="/">{username}</Link> */}
              </li>
            ) : (
              <>
                <li className="flex-none px-3">
                  <Link to="/signup">Sign up</Link>
                </li>
                <li className="flex-none px-3">
                  <Link to="/login">Login</Link>
                </li>
              </>
            )}
          </ul>

          {/* Mobile top navigation */}
          <ul className="flex md:hidden items-center justify-between h-16">
            <button className="grow px-3" onClick={() => setOpen(!open)}>
              Hamburger menu
            </button>
            {user ? (
              <li className="flex-none px-3">
                <ProfileDesktopMenu username={user.username} />
              </li>
            ) : (
              <>
                <li className="flex-none px-3">
                  <Link to="/signup">Sign up</Link>
                </li>
                <li className="flex-none px-3">
                  <Link to="/login">Login</Link>
                </li>
              </>
            )}
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
          </ul>
        </nav>
      </aside>
    </>
  );
}
