import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 border-0",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border-0",
        outline:
          "border-2 border-primary/20 bg-background/50 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:border-primary/40 backdrop-blur-md",
        secondary:
          "bg-gradient-to-r from-secondary to-muted text-secondary-foreground hover:from-secondary/80 hover:to-muted/80 border-0",
        ghost: "hover:bg-gradient-to-r hover:from-accent/20 hover:to-primary/20 backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-accent",
        elite: "bg-gradient-to-r from-primary via-accent to-primary bg-size-200 text-white hover:bg-pos-100 border-0 font-bold uppercase tracking-wide",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
