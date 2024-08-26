import { Form, Link } from '@remix-run/react';
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
import { Button } from './Button';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';

function ProfileDesktopMenu({ username }: { username: string }) {
  const firstLetter = username.charAt(0).toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-20 justify-between">
        <div>
          <Avatar>
            <AvatarImage
            // src=""
            />
            <AvatarFallback>{firstLetter}</AvatarFallback>
          </Avatar>
        </div>
        <div className="self-center">{username}</div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <a
            href={`/users/${username}`}
            className="bg-none text-current border-none h-auto w-full justify-start p-0 font-inherit cursor-pointer outline-inherit"
          >
            Profile
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a
            href={`/settings/account`}
            className="bg-none text-current border-none h-auto w-full justify-start p-0 font-inherit cursor-pointer outline-inherit"
          >
            Settings
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Form method="POST" action="/logout" className="p-0 w-full">
            <AuthenticityTokenInput />
            <Button
              type="submit"
              variant="ghost"
              className="bg-none text-current border-none h-auto w-full justify-start p-0 font-inherit cursor-pointer outline-inherit"
              name="intent"
              value="logout"
            >
              Logout
            </Button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopNav({ loggedInUser }: { loggedInUser: any }) {
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
            {loggedInUser ? (
              <li className="flex-none px-3">
                <ProfileDesktopMenu username={loggedInUser.username} />
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
            {loggedInUser ? (
              <li className="flex-none px-3">
                <ProfileDesktopMenu username={loggedInUser.username} />
              </li>
            ) : (
              <>
                <li className="flex-none px-3">
                  <Link
                    to="/signup"
                    onClick={() => (open ? setOpen(false) : null)}
                  >
                    Sign up
                  </Link>
                </li>
                <li className="flex-none px-3">
                  <Link
                    to="/login"
                    onClick={() => (open ? setOpen(false) : null)}
                  >
                    Login
                  </Link>
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
              <Link to="/" onClick={() => setOpen(!open)}>
                Games
              </Link>
            </li>
            <li>
              <Link to="/" onClick={() => setOpen(!open)}>
                Placeholder
              </Link>
            </li>
            <li>
              <Link to="/" onClick={() => setOpen(!open)}>
                Placeholder
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
