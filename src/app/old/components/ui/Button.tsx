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
      primary: "rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#00A3FF] text-white font-medium hover:from-[#33DBFF] hover:to-[#00D2FF] hover:shadow-[0_0_20px_rgba(0,210,255,0.3)] active:scale-[0.98] transition-all",
      secondary: "rounded-xl border border-[#00D2FF] text-[#00D2FF] font-medium hover:bg-[rgba(0,210,255,0.1)] transition-all",
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
