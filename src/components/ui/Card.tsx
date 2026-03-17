import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "base" | "raised";
}

export function Card({ className, variant = "base", ...props }: CardProps) {
  return (
    <div
      className={cn(
        variant === "base" ? "glass-panel" : "glass-panel-raised",
        "p-6",
        className
      )}
      {...props}
    />
  )
}
