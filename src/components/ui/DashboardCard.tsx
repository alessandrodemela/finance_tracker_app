import * as React from "react";
import { cn } from "@/lib/utils";

export interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function DashboardCard({ children, className, ...props }: DashboardCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--color-brand-card)] border border-white/5 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden group/card hover:border-white/10 transition-all duration-500",
        className
      )}
      {...props}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.01] rounded-full blur-3xl -mr-32 -mt-32 group-hover/card:bg-white/[0.03] transition-colors duration-500 pointer-events-none" />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
