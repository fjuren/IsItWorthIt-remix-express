import * as React from 'react';

import { cn } from '~/lib/utils';

const GameCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'grid h-32 w-[96%] max-w-[80rem] rounded-xl border bg-card text-card-foreground shadow grid-cols-4 grid-rows-5 md:grid-cols-7 md:grid-rows-4',
      className
    )}
    {...props}
  />
));
GameCard.displayName = 'GameCard';

const GameCardImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, alt, ...props}, ref) => (
  <div className="relative col-span-1 row-span-4 md:row-span-4">
    <img ref={ref} alt={alt} className={cn("absolute inset-0 m-auto z-[1] object-contain h-[80%] w-[90%] overflow-hidden", className)} {...props} />
    <img ref={ref} alt={alt} className={cn("absolute inset-0 m-auto h-[75%] w-[75%] overflow-hidden blur-sm", className)} {...props} />
  </div>
));
GameCardImage.displayName = "CardImage";

const GameCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col col-span-2 row-span-2 m-4 gap-1', className)}
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
    className={cn('font-semibold leading-none tracking-tight', className)}
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
    className={cn('flex gap-1 flex-row text-muted-foreground', className)}
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
    className={cn('m-2 col-span-2 row-start-3 row-end-4 row-span-4', className)}
    {...props}
  />
));
GameCardSocial.displayName = 'GameCardSocial';

const GameCardContent1 = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('m-auto row-span-4', className)} {...props} />
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
    className={cn('m-4 row-span-4 hidden md:block', className)}
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
    className={cn('m-auto gap-4 flex flex-col col-start-4 col-span-1 row-span-5 md:col-start-7 md:col-span-1 md:row-span-4', className)}    {...props}
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
