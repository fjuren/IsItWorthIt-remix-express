import * as React from 'react';
import { Link } from 'react-router-dom';

import { cn } from '~/lib/utils';

interface GameCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  gameId?: string;
  dealId?: string;
}

const GameCard = React.forwardRef<HTMLAnchorElement, GameCardProps>(
  ({ className, gameId, dealId, ...props }, ref) => (
    <article
      ref={ref}
      className={cn(
        'grid h-36 w-[96%] max-w-[80rem] rounded-xl border bg-card text-card-foreground shadow grid-cols-4 grid-rows-5 md:grid-cols-7 md:grid-rows-4 hover:bg-secondary/40 transition-colors overflow-visible',
        className
      )}
    >
      <Link
        to={`/games/${gameId}/deals/${dealId}`}
        onClick={() => console.log('card')}
        // ref={ref}
        className={cn(
          // 'grid h-36 w-[96%] max-w-[80rem] rounded-xl border bg-card text-card-foreground shadow grid-cols-4 grid-rows-5 md:grid-cols-7 md:grid-rows-4 hover:bg-secondary/40 transition-colors overflow-visible',
          'contents',
          className
        )}
        {...props}
      />
    </article>
  )
);
GameCard.displayName = 'GameCard';

const GameCardImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, alt, ...props }, ref) => (
  <div className="relative col-start-1 col-span-1 row-span-4 md:row-span-4">
    <img
      ref={ref}
      alt={alt}
      className={cn(
        'absolute inset-0 m-auto z-[1] object-contain h-[80%] w-[90%] overflow-hidden',
        className
      )}
      {...props}
    />
    <img
      ref={ref}
      alt={alt}
      className={cn(
        'absolute inset-0 m-auto h-[75%] w-[75%] overflow-hidden blur-sm',
        className
      )}
      {...props}
    />
  </div>
));
GameCardImage.displayName = 'CardImage';

const GameCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col col-start-2 col-span-2 row-start-1 row-span-2 gap-1',
      className
    )}
    {...props}
  />
));
GameCardHeader.displayName = 'GameCardHeader';

const GameCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('font-semibold truncate', className)}
    {...props}
  />
));
GameCardTitle.displayName = 'GameCardTitle';

const GameCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-1 text-muted-foreground', className)}
    {...props}
  />
));
GameCardDescription.displayName = 'GameCardDescription';

const GameCardSocial = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-end col-start-1 col-span-2 row-start-5 md:col-start-2 md:col-span-3 md:row-start-4 p-1',
      className
    )}
    {...props}
  />
));
GameCardSocial.displayName = 'GameCardSocial';

const GameCardContent1 = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center gap-2 col-start-2 col-span-3 row-start-3',
      className
    )}
    {...props}
  />
));
GameCardContent1.displayName = 'GameCardContent1';

const GameCardContent2 = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('m-4 row-span-4 hidden md:block', className)}
    {...props}
  />
));
GameCardContent2.displayName = 'GameCardContent2';

const GameCardContent3 = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('col-start-4 row-start-1 md:col-start-5', className)}
    {...props}
  />
));
GameCardContent3.displayName = 'GameCardContent3';

// const GameCardContent4 = React.forwardRef<
//   HTMLDivElement,
//   React.HTMLAttributes<HTMLDivElement>
// >(({ className, ...props }, ref) => (
//   <div
//     ref={ref}
//     className={cn('m-auto gap-4 flex flex-col col-span-4 row-span-5 md:col-span-7 md:row-span-4', className)}
//     {...props}
//   />
// ));
// GameCardContent4.displayName = 'GameCardContent4';
const GameCardContent4 = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col col-start-4 row-start-4 md:col-start-6 md:row-start-4',
      className
    )}
    {...props}
  />
));
GameCardContent4.displayName = 'GameCardContent4';

export {
  GameCard,
  GameCardImage,
  GameCardHeader,
  GameCardTitle,
  GameCardDescription,
  GameCardSocial,
  GameCardContent1,
  GameCardContent2,
  GameCardContent3,
  GameCardContent4,
};
