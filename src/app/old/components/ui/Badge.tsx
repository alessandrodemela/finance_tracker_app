import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "positive" | "negative" | "neutral";
}

export function Badge({ className, variant = "neutral", children, ...props }: BadgeProps) {
  const variants = {
    positive: "bg-accent-income bg-opacity-10 text-accent-income border-accent-income border-opacity-20",
    negative: "bg-accent-expense bg-opacity-10 text-accent-expense border-accent-expense border-opacity-20",
    neutral: "bg-[var(--surface-raised)] text-[var(--muted)] border-[var(--border)]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
