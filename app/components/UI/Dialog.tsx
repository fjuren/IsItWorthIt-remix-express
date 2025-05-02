// custom shadcn dialog from community with additional modifications: https://github.com/shadcn-ui/ui/issues/16
'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { cn } from '~/lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

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
import { Form, useSearchParams } from 'react-router-dom';
import { useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { z } from 'zod';
import { Stores } from '~/types/store';
import { useState } from 'react';

// Define the schema for our filter form
const StoreFilterSchema = z.object({
  storeIDs: z.array(z.string()).default([]),
});

interface FilterStoreDialogProps {
  stores: Stores;
}

export function FilterStoreDialog({ stores }: FilterStoreDialogProps) {
  const [searchParams] = useSearchParams();

  // Get initial store IDs from URL
  const initialStoreIDs = searchParams.getAll('storeIDs');

  // Tracks local state/checkbox selection. Required in order to see ShadCN checkbox component UI updates on clicked
  const [selectedStoreIDs, setSelectedStoreIDs] =
    useState<string[]>(initialStoreIDs);

  const [form, fields] = useForm({
    id: 'store-filter',
    defaultValue: {
      storeIDs: initialStoreIDs,
    },
    constraint: getZodConstraint(StoreFilterSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: StoreFilterSchema });
    },
  });

  // Filter only active stores since API includes stores marked as inactive
  const activeStores = stores.filter((store) => store.isActive === 1);

  // Toggle store selection; This is to handle checkmark state and tell shadcn that its checkbox was clicked. Otherwise the checkbox UI won't change; the input field is only 'clicked' .
  const toggleStore = (storeID: string) => {
    setSelectedStoreIDs((prev) =>
      prev.includes(storeID)
        ? prev.filter((id) => id !== storeID)
        : [...prev, storeID]
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Filter</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter</DialogTitle>
          <DialogDescription>
            Modify your search results. Click save when you&apos;re done
          </DialogDescription>
        </DialogHeader>
        <Form method="get" id={form.id} onSubmit={form.onSubmit}>
          <fieldset>
            <legend className="text-md font-medium">Stores</legend>
            <div className="space-y-2 mt-2">
              {/* Handles hidden inputs for all selected store IDs*/}
              {/* Why? According to docs: Shadcn's Checkbox component doesn't automatically sync its internal state with the native checkbox — and clicking the label triggers the native input (which is visually hidden), not the Shadcn one */}
              {selectedStoreIDs.map((storeID) => (
                <input
                  key={storeID}
                  type="hidden"
                  name={fields.storeIDs.name}
                  value={storeID}
                />
              ))}

              {activeStores.map((store) => {
                const isChecked = selectedStoreIDs.includes(store.storeID);

                return (
                  <div
                    key={store.storeID}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleStore(store.storeID)}
                      id={`store-checkbox-${store.storeID}`}
                    />
                    <Label
                      htmlFor={`store-checkbox-${store.storeID}`}
                      className="cursor-pointer"
                    >
                      {store.storeName}
                    </Label>
                  </div>
                );
              })}
            </div>
          </fieldset>
          <DialogFooter>
            <DialogClose>
              <Button type="submit" className="mt-4">
                Apply Filters
              </Button>
            </DialogClose>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
