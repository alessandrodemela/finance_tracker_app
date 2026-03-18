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
        "flex flex-col items-center justify-center transition-all duration-200",
        isActive ? "bg-[rgba(0,210,255,0.2)] rounded-xl text-[#E8EBF4] py-2 px-3" : "text-[#5A6B8F] hover:text-[#A8AEC5]"
      )}
    >
      <div className="flex h-6 w-6 items-center justify-center">
        {icon}
      </div>
      <span className="text-label mt-1">
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
        "fixed bottom-0 left-0 right-0 h-16 bg-[rgba(10,14,39,0.95)] backdrop-blur-md border-t border-[rgba(0,210,255,0.1)] z-50 flex items-center justify-around px-6 py-3 pb-safe",
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
