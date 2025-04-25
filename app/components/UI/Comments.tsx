import React from "react"
import { cn } from "~/lib/utils"
import { MessageSquare } from "lucide-react"
import { Button, ButtonProps } from "~/components/UI/Button"
import { Textarea } from "~/components/UI/Textarea"
import '~/styles/icon.css'

// Custom component following shadcn/ui patterns
export interface CommentButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
  Omit<ButtonProps, "asChild"> {}

export function CommentButton({
  className,
  variant = "iconCustom",
  size = "icon",
  ...props
}: CommentButtonProps) {
  return (
    <Button 
      variant={variant} 
      size={size} 
      className={cn("relative", className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation(); // Stops the event from bubbling up to the gamecard
        console.log('Comment');
      }}
      {...props}
    >
      <MessageSquare />
    </Button>
  )
}

// Custom component following shadcn/ui patterns
export interface CommentInputProps extends React.ComponentProps<"textarea"> {
  onCommentSubmit?: (value: string) => void; 
}

export function CommentInput({
  className,
  onCommentSubmit, // Renamed prop
  ...props
}: CommentInputProps) {
  const [value, setValue] = React.useState<string>("")
  
  const handleSubmit = () => {
    if (onCommentSubmit && value.trim()) {
      onCommentSubmit(value)
      setValue("")
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      <Textarea 
        placeholder="Add a comment..."
        className={cn("min-h-[80px]", className)}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        {...props}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  )
}

// Comment types
export interface CommentData {
  id: string;
  author: string;
  authorAvatar?: string;
  date: string;
  content: string;
}

// Complete comment component with basic functionality
export interface CommentProps extends React.HTMLAttributes<HTMLDivElement> {
  comment?: CommentData;
}

export function Comment({
  children,
  comment,
  className,
  ...props
}: CommentProps) {
  if (comment) {
    return (
      <div className={cn("rounded-md border p-4", className)} {...props}>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-slate-200" />
          <div>
            <p className="text-sm font-medium">{comment.author}</p>
            <p className="text-xs text-slate-500">{comment.date}</p>
          </div>
        </div>
        <p className="text-sm">{comment.content}</p>
      </div>
    )
  }
  
  return (
    <div className={cn("rounded-md border p-4", className)} {...props}>
      {children}
    </div>
  )
}

// Comment list component
export interface CommentListProps extends React.HTMLAttributes<HTMLDivElement> {
  comments: CommentData[];
}

export function CommentList({
  comments = [],
  className,
  ...props
}: CommentListProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  )
}