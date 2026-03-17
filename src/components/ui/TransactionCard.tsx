import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "./Card"

export interface TransactionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle: string;
  amount: number;
  type: "income" | "expense";
  icon?: React.ReactNode;
}

export function TransactionCard({ 
  className, 
  title, 
  subtitle, 
  amount, 
  type, 
  icon,
  ...props 
}: TransactionCardProps) {
  const isIncome = type === "income";
  const formattedAmount = `${isIncome ? '+' : '-'}$${Math.abs(amount).toFixed(2)}`;

  return (
    <Card 
      className={cn(
        "flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--surface-raised)] transition-colors duration-200 group active:scale-[0.99]",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-raised)] text-[var(--muted)] group-hover:text-white transition-colors">
            {icon}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-semibold text-white tracking-wide">{title}</span>
          <span className="text-sm text-[var(--muted)]">{subtitle}</span>
        </div>
      </div>
      <div className={cn(
        "font-bold font-sans tracking-number text-lg",
        isIncome ? "text-accent-income" : "text-white"
      )}>
        {formattedAmount}
      </div>
    </Card>
  )
}
