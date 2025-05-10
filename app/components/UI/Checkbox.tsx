'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import { cn } from '~/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };

// For CheckboxConform (modified Shadcn Checkbox component for campatibility with Conform)
import {
  unstable_useControl as useControl,
  type FieldMetadata,
} from '@conform-to/react';
import { useRef, type ElementRef } from 'react';

export function CheckboxConform({
  meta,
}: {
  meta: FieldMetadata<string | boolean | number | undefined>;
}) {
  const checkboxRef = useRef<ElementRef<typeof Checkbox>>(null);
  const control = useControl(meta);

  return (
    <>
      <input
        className="sr-only"
        aria-hidden
        ref={control.register}
        name={meta.name}
        tabIndex={-1}
        defaultValue={meta.initialValue}
        // onFocus={() => checkboxRef.current?.focus()}
      />
      <Checkbox
        ref={checkboxRef}
        id={meta.id}
        checked={control.value === 'on'}
        onCheckedChange={(checked) => {
          control.change(checked ? 'on' : '');
        }}
        onBlur={control.blur}
        className="focus:ring-stone-950 focus:ring-2 focus:ring-offset-2"
      />
    </>
  );
}
