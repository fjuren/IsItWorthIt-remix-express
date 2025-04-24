import React from "react"
import { cn } from "~/lib/utils"
import { HeartPlus } from "lucide-react"
import { Button, ButtonProps } from "~/components/UI/Button"
import '~/styles/icon.css'

// Custom component following shadcn/ui patterns
export interface BookmarkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
  Omit<ButtonProps, "asChild"> {}

export function WishlistButton({
    className,
    variant = "iconCustom",
    size = "icon",
    ...props
  }: BookmarkButtonProps) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("relative", className)}
        {...props}
      >
        <HeartPlus  />
      </Button>
    )
  }