import * as React from 'react';
import UpvoteIcon from '../../assets/svgs/UpvoteIcon';
import DownvoteIcon from '~/assets/svgs/DownvoteIcon';
import CommentIcon from '~/assets/svgs/CommentIcon';
import BookmarkIcon from '~/assets/svgs/BookmarkIcon';

import { cn } from '~/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <article
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col w-full space-y-1.5 p-6',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // className={cn('flex flex-col space-y-1.5 p-6', className)}
    className={cn('flex flex-col', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <>
    {/* mobile */}
    <div
      ref={ref}
      className={cn('flex flex-col flex-1 md:hidden', className)}
      {...props}
    >
      <div className="flex flex-row">
        <div className="flex flex-row">
          <button type="button" aria-label="Upvote">
            <UpvoteIcon />
          </button>
          <button type="button" aria-label="Downvote">
            <DownvoteIcon />
          </button>
        </div>
        <a href="/" aria-label="Comment">
          <CommentIcon />
        </a>
        <button aria-label="Bookmark">
          <BookmarkIcon />
        </button>
      </div>
    </div>

    {/* desktop */}
    <div
      ref={ref}
      className={cn('hidden md:flex flex-col flex-1', className)}
      {...props}
    >
      <div className="flex flex-row">
        <div className="flex flex-row">
          <button type="button" aria-label="Upvote">
            <UpvoteIcon />
          </button>
          <button type="button" aria-label="Downvote">
            <DownvoteIcon />
          </button>
        </div>
        <a href="/" aria-label="Comment">
          <CommentIcon />
        </a>
        <button aria-label="Bookmark">
          <BookmarkIcon />
        </button>
      </div>
    </div>
  </>
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
