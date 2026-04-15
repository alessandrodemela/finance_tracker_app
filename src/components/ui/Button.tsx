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
      primary: "rounded-2xl bg-white text-black font-bold hover:bg-white/90 active:scale-[0.98] transition-all shadow-xl",
      secondary: "rounded-2xl border border-white/20 bg-white/5 text-white font-bold hover:bg-white/10 hover:border-white/30 transition-all",
      ghost: "bg-transparent text-[var(--color-brand-secondary)] hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[10px]",
      icon: "rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white shadow-lg",
      danger: "bg-[var(--color-brand-danger)] text-white hover:opacity-90 shadow-xl font-bold",
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
