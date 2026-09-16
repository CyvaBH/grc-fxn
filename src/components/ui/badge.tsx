import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand-teal text-white",
        secondary: "border-transparent bg-brand-mist text-brand-navy",
        destructive: "border-transparent bg-status-critBg text-status-critTx",
        outline: "text-brand-navy border-border",
        applies: "border-transparent bg-brand-navy text-white",
        likely: "border-transparent bg-status-warnBg text-status-warnTx",
        notapplies: "border-transparent bg-brand-mist text-gray-500",
        needsreview: "border-transparent bg-status-infoBg text-brand-navy",
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
