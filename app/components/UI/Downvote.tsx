import React from "react"
import { cn } from "~/lib/utils"
import { ThumbsDown } from "lucide-react"
import { Button, ButtonProps } from "~/components/UI/Button"
import '~/styles/icon.css'

// Custom component following shadcn/ui patterns
export interface ThumbsdownButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
  Omit<ButtonProps, "asChild"> {}

export function DownvoteButton({
    className,
    variant = "iconCustom",
    size = "icon",
    ...props
  }: ThumbsdownButtonProps) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("relative", className)}
        {...props}
      >
        <ThumbsDown />
      </Button>
    )
  }