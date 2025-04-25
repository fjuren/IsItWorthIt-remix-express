import React from "react"
import { cn } from "~/lib/utils"
import { ThumbsUp } from "lucide-react"
import { Button, ButtonProps } from "~/components/UI/Button"
import '~/styles/icon.css'

// Custom component following shadcn/ui patterns
export interface UpvoteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
  Omit<ButtonProps, "asChild"> {}

export function UpvoteButton({
    className,
    variant = "iconCustom",
    size = "icon",
    active = false,
    ...props
  }: UpvoteButtonProps & { active?: boolean }) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("relative", className)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); // Stops the event from bubbling up to the gamecard
          console.log('Upvote');
        }}
        {...props}
      >
        <ThumbsUp className={cn(
        //   "h-4 w-4 transition-colors", 
          active ? "text-primary" : "group-hover:text-primary"
        )} />
      </Button>
    )
  }