import type * as React from "react"
import { cn } from "@/lib/utils"

function EnhancedCard({
  className,
  children,
  hover = true,
  ...props
}: React.ComponentProps<"div"> & { hover?: boolean }) {
  return (
    <div
      data-slot="enhanced-card"
      className={cn(
        "bg-card text-card-foreground relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300",
        hover && "hover:shadow-lg hover:-translate-y-1 hover:border-primary/20",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        className,
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function EnhancedCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="enhanced-card-header" className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)} {...props} />
  )
}

function EnhancedCardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="enhanced-card-title"
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
}

function EnhancedCardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p data-slot="enhanced-card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

function EnhancedCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="enhanced-card-content" className={cn("p-6 pt-0", className)} {...props} />
}

function EnhancedCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="enhanced-card-footer" className={cn("flex items-center p-6 pt-0", className)} {...props} />
}

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
}
