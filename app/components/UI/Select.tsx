"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "~/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

// export {
//   Select,
//   SelectGroup,
//   SelectValue,
//   SelectTrigger,
//   SelectContent,
//   SelectLabel,
//   SelectItem,
//   SelectSeparator,
//   SelectScrollUpButton,
//   SelectScrollDownButton,
// }

import { useState } from "react"
import { sortOptions } from "~/utils/constants"
import { useSearchParams } from "react-router"

export function SelectSort() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // API defaults sort by deal rating in desc direction
  const [sortBy, setSortBy] = useState(sortOptions.DealRating.id);

  const handleSortChange = (id: string) => {
    setSortBy(id);
    // find which option was selected from the sort list
    const selectedOption = Object.values(sortOptions).find(option => option.id === id);
    
    if (selectedOption) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("sortBy", selectedOption.value);
      newParams.set("desc", selectedOption.direction);
      setSearchParams(newParams);
    }
  };

  return (
    <Select value={sortBy} onValueChange={handleSortChange}>
      <SelectTrigger className="h-10">
        <SelectValue placeholder={sortOptions.DealRating.id} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sort Options</SelectLabel>
          {/* Deal Rating options */}
          <SelectItem value={sortOptions.DealRating.id}>{sortOptions.DealRating.label}</SelectItem>
          <SelectItem value={sortOptions.DealRatingAsc.id}>{sortOptions.DealRatingAsc.label}</SelectItem>
          {/* Price options */}
          <SelectItem value={sortOptions.Price.id}>{sortOptions.Price.label}</SelectItem>
          <SelectItem value={sortOptions.PriceDesc.id}>{sortOptions.PriceDesc.label}</SelectItem>
          {/* Title options */}
          <SelectItem value={sortOptions.Title.id}>{sortOptions.Title.label}</SelectItem>
          <SelectItem value={sortOptions.TitleDesc.id}>{sortOptions.TitleDesc.label}</SelectItem>
          {/* Release Date options */}
          <SelectItem value={sortOptions.Release.id}>{sortOptions.Release.label}</SelectItem>
          <SelectItem value={sortOptions.ReleaseAsc.id}>{sortOptions.ReleaseAsc.label}</SelectItem>
          {/* Metacritic options */}
          <SelectItem value={sortOptions.Metacritic.id}>{sortOptions.Metacritic.label}</SelectItem>
          <SelectItem value={sortOptions.MetacriticAsc.id}>{sortOptions.MetacriticAsc.label}</SelectItem>
          {/* Other single-direction options */}
          <SelectItem value={sortOptions.Savings.id}>{sortOptions.Savings.label}</SelectItem>
          <SelectItem value={sortOptions.Reviews.id}>{sortOptions.Reviews.label}</SelectItem>
          <SelectItem value={sortOptions.Store.id}>{sortOptions.Store.label}</SelectItem>
          <SelectItem value={sortOptions.Recent.id}>{sortOptions.Recent.label}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}