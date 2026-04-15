import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // Percentage 0-100
  indicatorColor?: string;
}

export function ProgressBar({ className, value, indicatorColor, ...props }: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={cn("h-2 w-full bg-[rgba(99,102,241,0.1)] rounded overflow-hidden", className)}
      {...props}
    >
      <div
        className="h-full rounded transition-all duration-500 ease-out"
        style={{
          width: `${clampedValue}%`,
          background: indicatorColor || 'var(--color-brand-accent)'
        }}
      />
    </div>
  )
}
