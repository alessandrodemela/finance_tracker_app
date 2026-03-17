import * as React from "react"
import { cn } from "@/lib/utils"

export interface BottomNavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export function BottomNavItem({ icon, label, isActive, onClick }: BottomNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1.5 py-3 transition-colors duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl",
        isActive ? "text-primary" : "text-[var(--muted)] hover:text-white"
      )}
    >
      <div className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300",
        isActive && "bg-primary/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-110"
      )}>
        {icon}
      </div>
      <span className={cn("text-[10px] font-medium tracking-wide", isActive && "font-semibold")}>
        {label}
      </span>
    </button>
  )
}

export interface BottomNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: BottomNavItemProps[];
}

export function BottomNav({ className, items, ...props }: BottomNavProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] pb-safe",
        "bg-[var(--surface)] backdrop-blur-2xl border-t border-[var(--border)]",
        "shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50",
        className
      )}
      {...props}
    >
      <div className="flex w-full items-center justify-around px-2 pb-2 pt-1">
        {items.map((item, index) => (
          <BottomNavItem key={index} {...item} />
        ))}
      </div>
    </div>
  )
}
