import * as React from "react"
import { cn } from "@/lib/utils"

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
  const formattedAmount = `${isIncome ? '+' : '-'}€${Math.abs(amount).toFixed(2)}`;

  return (
    <div 
      className={cn(
        "rounded-2xl border border-[rgba(99,102,241,0.1)] bg-[#141B35] p-4 flex items-center justify-between gap-3 hover:border-[rgba(99,102,241,0.2)] hover:shadow-lg transition-all cursor-pointer",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-opacity-30",
            isIncome ? "bg-[#10B981]/30 text-[#10B981]" : "bg-[#F05A64]/30 text-[#F05A64]"
          )}>
            <div className="w-5 h-5 flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <span className="text-body">{title}</span>
          <span className="text-small">{subtitle}</span>
        </div>
      </div>
      <div className={cn(
        "text-body font-medium",
        isIncome ? "text-[#10B981]" : "text-[#F05A64]"
      )}>
        {formattedAmount}
      </div>
    </div>
  )
}
