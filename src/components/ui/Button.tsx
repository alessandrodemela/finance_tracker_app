import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "icon" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", fullWidth = false, ...props }, ref) => {
    const variants = {
      primary: "rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white font-medium hover:from-[#818CF8] hover:to-[#6366F1] hover:shadow-lg active:scale-[0.98] transition-all",
      secondary: "rounded-xl border border-[#6366F1] text-[#6366F1] font-medium hover:bg-[rgba(99,102,241,0.1)] transition-all",
      ghost: "bg-transparent text-[var(--color-brand-secondary)] hover:text-white hover:bg-white/5",
      icon: "rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white",
      danger: "bg-[var(--color-brand-danger)] text-white hover:opacity-90 shadow-lg",
    };

    const sizes = {
      default: "py-4 px-6 text-base",
      sm: "py-2 px-4 text-sm",
      lg: "py-5 px-8 text-lg",
      icon: "h-12 w-12 flex items-center justify-center rounded-full p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center transition-all outline-none disabled:opacity-50 disabled:pointer-events-none",
          fullWidth && "w-full",
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
