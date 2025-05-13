import { Form, Link } from 'react-router-dom';
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
import { GameSearch } from './GameSearch';
import { HamburgerMenu } from './HamburgerMenu'

function ProfileDesktopMenu({ username }: { username: string }) {
  const firstLetter = username.charAt(0).toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex justify-between">
        <div>
          <Avatar>
            <AvatarImage
            // src=""
            />
            <AvatarFallback>{firstLetter}</AvatarFallback>
          </Avatar>
        </div>
        {/* <div className="self-center">{username}</div> */}
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

  return (
    <>
      <header className="relative">
        <nav className="h-full border-b border-grey">
          {/* Desktop top navigation */}
          <div className="hidden md:flex justify-items-center content-center justify-between h-16">
            <div className="px-3 w-3/12 self-center">
              <Link to="/">Home (logo)</Link>
            </div>
            <div className='w-6/12 self-center'>
              <GameSearch />
            </div>
            {loggedInUser ? (
              <div className="px-3 self-center">
                <ProfileDesktopMenu username={loggedInUser.username} />
                {/* <Link to="/">{username}</Link> */}
              </div>
            ) : (
              <>
              <div className='flex self-center'>
                <div className="px-3">
                  <Link to="/signup">Sign up</Link>
                </div>
                <div className="px-3">
                  <Link to="/login">Login</Link>
                </div>
              </div>
              </>
            )}
          </div>

          {/* Mobile top navigation */}
          <div className="flex items-center flex-row md:hidden h-16">
            <div className='flex justify-center w-1/6'>
              <HamburgerMenu />
            </div>
            <div className='flex justify-center w-4/6'>
              <GameSearch />
            </div>
            {loggedInUser ? (
              <div className="w-1/6 px-3">
                <ProfileDesktopMenu username={loggedInUser.username} />
              </div>
            ) : (
              <div className='w-1/6 '>
                
              </div>
            )}
            <div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu (same as sidenav but for mobile) */}
      {/* <aside
        className={`md:hidden ${
          open
            ? 'z-10 flex flex-col w-full h-full fixed overflow-x-hidden'
            : 'hidden'
        } bg-inherit dark: bg-inherit
        `}
      >
        <nav>
          <ul className="flex-col ">
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
          </ul>
        </nav>
      </aside> */}
    </>
  );
}
