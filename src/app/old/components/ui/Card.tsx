import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "base" | "raised";
}

export function Card({ className, variant = "base", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[rgba(99,102,241,0.1)] bg-[#141B35] p-5 hover:border-[rgba(99,102,241,0.2)] hover:shadow-lg transition-all relative overflow-hidden",
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
