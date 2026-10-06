import * as React from "react"
import { cn, formatCurrency, formatDateDDMMYYYY } from "@/lib/utils"
import { Edit2, Trash2 } from "lucide-react"

export interface TransactionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle: string;
  amount: number;
  type: "income" | "expense";
  date?: string;
  icon?: React.ReactNode;
  isSensitiveVisible?: boolean;
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
  isSensitiveVisible = true, 
  onEdit, 
  onDelete, 
  ...props 
}: TransactionCardProps) {
  const isIncome = type === "income";
  const formattedAmount = formatCurrency(amount, { signedType: isIncome ? 'income' : 'expense' });
  const formattedDate = date ? formatDateDDMMYYYY(date) : null;

  return (
    <div 
      className={cn(
        "rounded-2xl border border-white/5 bg-black/40 p-3.5 flex flex-col gap-2 transition-all relative overflow-hidden group hover:border-white/10 hover:bg-white/[0.02]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              isIncome ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            )}>
              {icon}
            </div>
          )}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs font-semibold text-white truncate">{title}</span>
            <div className="flex items-center gap-1.5 text-slate-400">
               <span className="text-[10px] font-bold uppercase tracking-wider truncate">{subtitle}</span>
               {formattedDate && (
                 <>
                   <span className="text-[8px] opacity-40">•</span>
                   <span className="text-[10px] uppercase font-mono">{formattedDate}</span>
                 </>
               )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className={cn(
            "text-xs font-mono font-bold transition-all",
            isIncome ? "text-emerald-400" : "text-rose-400",
            !isSensitiveVisible && "blur-md select-none"
          )}>
            {formattedAmount}
          </div>
          
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Edit"
                >
                  <Edit2 size={12} />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-1 rounded hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
