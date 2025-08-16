"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    orientation?: 'vertical' | 'horizontal' | 'both'
  }
>(({ className, children, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    {(orientation === 'vertical' || orientation === 'both') && <ScrollBar />}
    {(orientation === 'horizontal' || orientation === 'both') && <ScrollBar orientation="horizontal" />}
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    data-radix-scroll-area-scrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors z-50",
      orientation === "vertical" &&
        "h-full w-3 border-l border-l-transparent p-[1px] bg-border/50 hover:bg-border/80",
      orientation === "horizontal" &&
        "h-3 flex-col border-t border-t-transparent p-[1px] bg-border/50 hover:bg-border/80",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb 
      data-radix-scroll-area-thumb
      className={cn(
        "relative flex-1 rounded-full transition-colors",
        "bg-border hover:bg-border/80",
        // increase touch target for mobile and enable visibility hooks
        "before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[36px] before:w-full before:min-w-[36px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
      )} 
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
