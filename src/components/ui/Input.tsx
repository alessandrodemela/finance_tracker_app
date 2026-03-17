import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 transition-colors group-focus-within:text-primary pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "flex h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-[0.9375rem] font-semibold text-white outline-none placeholder:text-slate-500 transition-all",
            "hover:border-white/20 hover:bg-white/[0.08]",
            "focus:border-primary focus:bg-primary/[0.05] focus:shadow-[0_0_20px_rgba(59,111,255,0.15)]",
            "disabled:cursor-not-allowed disabled:opacity-50 font-outfit",
            icon && "pl-12",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-focus-within:opacity-100" />
      </div>
    )
  }
)
Input.displayName = "Input"
