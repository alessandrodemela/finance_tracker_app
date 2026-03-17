import * as React from "react"
import { cn } from "@/lib/utils"

export interface TabSelectorProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function TabSelector({ tabs, activeTab, onChange, className }: TabSelectorProps) {
  return (
    <div className={cn("flex space-x-1 rounded-2xl bg-white/5 p-1.5 border border-white/10", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex-1 rounded-xl px-4 py-3 text-[0.8125rem] font-bold uppercase tracking-wider transition-all duration-400",
              "focus-visible:outline-none",
              isActive 
                ? "bg-primary text-white shadow-[0_4px_12px_rgba(59,111,255,0.4)]" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  )
}
