import * as React from "react"
import { cn } from "@/lib/utils"

export interface StatBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
}

export function StatBox({ label, value, trend, icon, className, ...props }: StatBoxProps) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-2xl bg-[var(--surface)] p-5 border border-[var(--border)]", className)} {...props}>
      <div className="flex items-center justify-between text-[var(--muted)]">
        <span className="text-sm font-medium uppercase tracking-wider">{label}</span>
        {icon && <div className="text-[var(--label)]">{icon}</div>}
      </div>
      <div className="text-3xl font-bold tracking-number text-white font-sans mt-1">
        {value}
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 mt-2">
          <span 
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              trend.isPositive ? "bg-accent-income bg-opacity-20 text-accent-income" : "bg-accent-expense bg-opacity-20 text-accent-expense"
            )}
          >
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-[var(--label)]">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
