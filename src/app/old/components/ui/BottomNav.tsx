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
        "flex flex-col items-center justify-center transition-all duration-300 relative py-1 px-4",
        isActive ? "text-[var(--color-brand-accent)]" : "text-[var(--color-brand-secondary)] hover:text-[var(--color-brand-primary)]"
      )}
    >
      <div className={cn(
        "flex h-7 w-7 items-center justify-center transition-transform",
        isActive && "scale-110"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-[10px] font-semibold mt-1 uppercase tracking-wider transition-all",
        isActive ? "opacity-100" : "opacity-60"
      )}>
        {label}
      </span>
      {isActive && (
        <div className="absolute -bottom-1 w-1 h-1 bg-[var(--color-brand-accent)] rounded-full shadow-[0_0_8px_var(--color-brand-accent)]" />
      )}
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
        "fixed bottom-0 left-0 right-0 h-[calc(4.5rem+env(safe-area-inset-bottom))] bg-[var(--color-brand-card)]/95 backdrop-blur-xl border-t border-white/5 z-50 flex items-center justify-around px-6 pb-[env(safe-area-inset-bottom)]",
        "mx-auto w-full max-w-[480px] shadow-[0_-8px_30px_rgb(0,0,0,0.5)]",
        className
      )}
      {...props}
    >
      {items.map((item, index) => (
        <BottomNavItem key={index} {...item} />
      ))}
    </div>
  )
}
