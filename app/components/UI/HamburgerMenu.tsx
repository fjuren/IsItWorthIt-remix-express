"use client"

import * as React from "react"
import { Menu, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "~/components/UI/Button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "~/components/UI/Sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/UI/Collapsible"
import { cn } from "~/lib/utils"

type MenuItem = {
  title: string
  href?: string
  submenu?: MenuItem[]
}

              // <>
              // <div className='flex self-center'>
              //   <div className="px-3">
              //     <Link to="/signup">Sign up</Link>
              //   </div>
              //   <div className="px-3">
              //     <Link to="/login">Login</Link>
              //   </div>
              // </div>
              // </>

const menuItems: MenuItem[] = [
  { title: "Home", href: "/" },
  { title: "Sign up", href: "/signup" },
  { title: "Login", href: "/login" },
  // {
  //   title: "Services",
  //   submenu: [
  //     { title: "Web Development", href: "/services/web-development" },
  //     { title: "Mobile Apps", href: "/services/mobile-apps" },
  //     { title: "Consulting", href: "/services/consulting" },
  //   ],
  // },
  // { title: "Contact", href: "/contact" },
]

const MenuItemComponent: React.FC<{ item: MenuItem; depth?: number }> = ({ item, depth = 0 }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  if (item.submenu) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center justify-between py-2 text-lg font-medium transition-colors hover:text-primary",
              depth > 0 && "pl-4"
            )}
          >
            {item.title}
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {item.submenu.map((subItem) => (
            <MenuItemComponent key={subItem.title} item={subItem} depth={depth + 1} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <a
      href={item.href}
      className={cn(
        "block py-2 text-lg font-medium transition-colors hover:text-primary",
        depth > 0 && "pl-4",
        item.href === "/" && "text-primary"
      )}
    >
      {item.title}
    </a>
  )
}

export function HamburgerMenu() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden w-4">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <nav className="flex flex-col space-y-4">
          {menuItems.map((item) => (
            <MenuItemComponent key={item.title} item={item} />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}