import { cn } from "~/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}
export function SkeletonCard() {
  return (
    <div className="grid h-36 w-[96%] max-w-[80rem] rounded-xl space-y-3">
      <Skeleton 
      className="h-36 w-[100%] rounded-xl"
       />
    </div>
  )
}