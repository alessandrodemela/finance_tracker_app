import * as React from "react"
import { cn } from "@/lib/utils"

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  left: React.ReactNode;
  content: React.ReactNode;
  right?: React.ReactNode;
  onClick?: () => void;
  interactive?: boolean;
}

export function ListItem({ 
  className, 
  left, 
  content, 
  right, 
  onClick, 
  interactive = false, 
  ...props 
}: ListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between p-4",
        "border-b border-[var(--border)] last:border-0",
        interactive && "cursor-pointer hover:bg-[var(--surface-raised)] transition-all duration-200 active:bg-[var(--surface)] active:scale-[0.99]",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-shrink-0 text-[var(--muted)]">{left}</div>
        <div className="flex-1 flex flex-col justify-center text-white">{content}</div>
      </div>
      {right && <div className="flex-shrink-0 pl-4 text-right">{right}</div>}
    </div>
  )
}
