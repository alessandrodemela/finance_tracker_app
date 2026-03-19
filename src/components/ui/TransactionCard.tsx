import * as React from "react"
import { cn } from "@/lib/utils"
import { Edit2, Trash2 } from "lucide-react"

export interface TransactionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle: string;
  amount: number;
  type: "income" | "expense";
  date?: string;
  icon?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TransactionCard({ 
  className, 
  title, 
  subtitle, 
  amount, 
  type, 
  date,
  icon,
  onEdit,
  onDelete,
  ...props 
}: TransactionCardProps) {
  const isIncome = type === "income";
  const formattedAmount = `${isIncome ? '+' : '-'}€${Math.abs(amount).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Formattazione data se presente
  const formattedDate = date ? new Date(date).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short'
  }) : null;

  return (
    <div 
      className={cn(
        "rounded-2xl border border-[rgba(99,102,241,0.1)] bg-[#141B35] p-4 flex flex-col gap-3 transition-all relative overflow-hidden group",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
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
          <div className="flex flex-col gap-0.5">
            <span className="text-body font-medium text-white transition-colors">{title}</span>
            <div className="flex items-center gap-1.5 opacity-60">
               <span className="text-[10px] font-bold uppercase tracking-wider">{subtitle}</span>
               {formattedDate && (
                 <>
                   <span className="text-[8px] opacity-40">•</span>
                   <span className="text-[10px] uppercase">{formattedDate}</span>
                 </>
               )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className={cn(
            "text-body font-bold",
            isIncome ? "text-[#10B981]" : "text-[#F05A64]"
          )}>
            {formattedAmount}
          </div>
          
          {/* Action Icons under amount */}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="p-1 rounded-md hover:bg-[rgba(255,255,255,0.08)] active:bg-[rgba(255,255,255,0.15)] text-white transition-colors"
                >
                  <Edit2 size={12} />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-1 rounded-md hover:bg-[rgba(240,90,100,0.1)] active:bg-[rgba(240,90,100,0.2)] text-[#F05A64] transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
