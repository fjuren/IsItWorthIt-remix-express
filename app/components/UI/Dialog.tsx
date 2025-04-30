// custom shadcn dialog from community with additional modifications: https://github.com/shadcn-ui/ui/issues/16
'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { cn } from '~/lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

// const DialogPortal = ({
//   className,
//   ...props
// }: DialogPrimitive.DialogPortalProps) => (
//   <DialogPrimitive.Portal/>
// );
// DialogPortal.displayName = DialogPrimitive.Portal.displayName;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 overflow-y-auto md:py-16 grid place-items-center',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay>
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'z-50 grid w-full max-w-lg gap-4 bg-secondary p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg md:w-full relative',
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogOverlay>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// export {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogFooter,
//   DialogTitle,
//   DialogDescription,
// };

import { Button } from './Button';
import { Label } from './Label';
import { Checkbox } from './Checkbox';
import { Form, LoaderFunctionArgs } from 'react-router-dom';
import { getFormProps, useForm } from '@conform-to/react';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  // const category = url.searchParams.getAll('category');
  console.log(url.searchParams);
}

export function FilterGames() {
  const [form] = useForm({
    id: 'filter',
    defaultValue: {},
    // constraint: getZodConstraint(LoginSchema),
    // lastResult: lastResult?.result,
    // onValidate({ formData }) {
    //   return parseWithZod(formData, { schema: LoginSchema });
    // },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Filter</Button>
      </DialogTrigger>
      <Form method="GET" {...getFormProps(form)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter</DialogTitle>
            <DialogDescription>
              Modify your search results. Click save when you&apos;re done
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 py-4">
              <h5 className="text-left">Price</h5>
              <div className="flex items-center gap-1">
                <Label htmlFor="steamworks">Add price range component</Label>
              </div>
            </div>

            <div className="grid gap-4 py-4">
              <h5 className="text-left">On Sale</h5>
              <div className="flex items-center gap-1">
                <Checkbox id="on-sale" />
                <Label htmlFor="on-sale">Only Show Discounts</Label>
              </div>
            </div>

            <div className="grid gap-4 py-4">
              <h5 className="text-left">Stores</h5>
              <div className="flex items-center gap-1">
                <Checkbox id="steam" />
                <Label htmlFor="steam">Steam</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox id="gamersgate" />
                <Label htmlFor="gamersgate">GamersGate</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox id="greenmangaming" />
                <Label htmlFor="greenmangaming">GreenManGaming</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox id="gog" />
                <Label htmlFor="gog">GOG</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox id="humble-store" />
                <Label htmlFor="humble-store">Humble Store</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox id="uplay" />
                <Label htmlFor="uplay">Uplay</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox id="fanatical" />
                <Label htmlFor="fanatical">Fanatical</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox id="wingamestore" />
                <Label htmlFor="wingamestore">WinGameStore</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox id="gamebillet" />
                <Label htmlFor="gamebillet">GameBillet</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox id="voidu" />
                <Label htmlFor="voidu">Voidu</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox id="epic-games-store" />
                <Label htmlFor="epic-games-store">Epic Games Store</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox id="gamesplanet" />
                <Label htmlFor="gamesplanet">Gamesplanet</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox id="gamesload" />
                <Label htmlFor="gamesload">Gamesload</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox id="2game" />
                <Label htmlFor="2game">2Game</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox id="indiegala" />
                <Label htmlFor="indiegala">IndieGala</Label>
              </div>
            </div>

            <div className="grid gap-4 py-4">
              <h5 className="text-left">Steamworks</h5>
              <div className="flex items-center gap-1">
                <Checkbox id="steamworks" />
                <Label htmlFor="steamworks">Requires Steam</Label>
              </div>
            </div>

            <div className="grid gap-4 py-4">
              <h5 className="text-left">AAA Titles</h5>
              <div className="flex items-center gap-1">
                <Checkbox id="aaa" />
                <Label htmlFor="aaa">Only AAA</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" name="intent" value="filter">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Form>
    </Dialog>
  );
}
