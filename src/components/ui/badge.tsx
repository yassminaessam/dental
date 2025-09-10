import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-sm shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-gradient-to-r from-primary/20 to-accent/20 text-primary hover:from-primary/30 hover:to-accent/30",
        secondary:
          "border-secondary/30 bg-gradient-to-r from-secondary/20 to-muted/20 text-secondary-foreground hover:from-secondary/30 hover:to-muted/30",
        destructive:
          "border-red-500/30 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-700 dark:text-red-300 hover:from-red-500/30 hover:to-red-600/30",
        outline: "border-border/50 bg-background/50 text-foreground hover:bg-muted/50",
        success: "border-green-500/30 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 hover:from-green-500/30 hover:to-emerald-500/30",
        warning: "border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 dark:text-yellow-300 hover:from-yellow-500/30 hover:to-orange-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
