import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "base" | "raised";
}

export function Card({ className, variant = "base", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[var(--color-brand-card)] p-5 hover:border-[rgba(255,255,255,0.1)] hover:shadow-lg transition-all relative overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-black/10 pointer-events-none" />
      <div className="relative z-10 w-full h-full">
        {props.children}
      </div>
    </div>
  )
}
