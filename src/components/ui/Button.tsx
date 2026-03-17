import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "icon" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-white hover:bg-primary-hover shadow-[0_8px_20px_-4px_rgba(59,111,255,0.4)] hover:shadow-[0_12px_28px_-4px_rgba(59,111,255,0.5)] border-t border-white/15",
      secondary: "bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20",
      ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
      icon: "rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white",
      danger: "bg-destructive text-white hover:bg-destructive/90 shadow-[0_8px_20px_-4px_rgba(244,63,94,0.4)] border-t border-white/15",
    };

    const sizes = {
      default: "h-12 px-6 py-3 rounded-2xl font-bold",
      sm: "h-10 px-4 py-2 rounded-xl text-sm font-semibold",
      lg: "h-14 px-8 py-4 rounded-[1.25rem] text-lg font-extrabold",
      icon: "h-12 w-12 flex items-center justify-center rounded-full",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center transition-all active:scale-[0.97] outline-none disabled:opacity-50 disabled:pointer-events-none font-outfit tracking-wide",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
