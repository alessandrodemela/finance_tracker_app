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
        "flex flex-col items-center justify-center relative py-1 px-4 transition-all duration-300",
        "touch-manipulation select-none outline-none",
        isActive ? "text-white" : "text-[var(--color-brand-secondary)]"
      )}
    >
      <div className={cn(
        "flex h-7 w-7 items-center justify-center transition-transform duration-300",
        isActive && "scale-110"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-[10px] font-black mt-1 uppercase tracking-[0.1em] transition-all",
        isActive ? "opacity-100" : "opacity-40"
      )}>
        {label}
      </span>
      {isActive && (
        <div className="absolute -bottom-1 w-12 h-1 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
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
        "fixed bottom-0 left-0 right-0 h-[calc(5rem+env(safe-area-inset-bottom)+8px)] bg-black/80 backdrop-blur-2xl border-t border-white/5 z-50 flex items-center justify-around px-6 pb-[calc(env(safe-area-inset-bottom)+12px)]",
        "mx-auto w-full max-w-[600px] shadow-[0_-8px_30px_rgb(0,0,0,0.8)]",
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
