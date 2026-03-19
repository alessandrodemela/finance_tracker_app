'use client';

import React, { useState, useMemo } from 'react';
import { useAnnualSummary } from '@/hooks/useData';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, TrendingDown, Target } from 'lucide-react';

import { MultiYearComparisonChart, MultiYearData } from '@/components/ui/MultiYearComparisonChart';

export function InsightsTab() {
  const [baseYear, setBaseYear] = useState<number>(new Date().getFullYear());
  
  // Fetch last 3 years
  const { monthlyData: year1Data, loading: y1Loading } = useAnnualSummary(baseYear);
  const { monthlyData: year2Data, loading: y2Loading } = useAnnualSummary(baseYear - 1);
  const { monthlyData: year3Data, loading: y3Loading } = useAnnualSummary(baseYear - 2);

  const calculateTotal = (data: any[], key: string) => Math.round(data.reduce((sum, d) => sum + (d[key] || 0), 0) || 0);

  const { chartData, longTermTrends, loading } = useMemo(() => {
    if (y1Loading || y2Loading || y3Loading) {
      return { chartData: [], longTermTrends: null, loading: true };
    }

    // Year 1 (Current)
    const inc1 = calculateTotal(year1Data, 'income');
    const exp1 = calculateTotal(year1Data, 'expense');
    const net1 = inc1 - exp1;

    // Year 2 (Prev)
    const inc2 = calculateTotal(year2Data, 'income');
    const exp2 = calculateTotal(year2Data, 'expense');
    const net2 = inc2 - exp2;

    // Year 3 (Older)
    const inc3 = calculateTotal(year3Data, 'income');
    const exp3 = calculateTotal(year3Data, 'expense');
    const net3 = inc3 - exp3;

    const chartData: MultiYearData[] = [
      { year: (baseYear - 2).toString(), income: inc3, expense: exp3, net: net3 },
      { year: (baseYear - 1).toString(), income: inc2, expense: exp2, net: net2 },
      { year: baseYear.toString(), income: inc1, expense: exp1, net: net1 },
    ];

    // Some long term insights
    const avgIncome = (inc1 + inc2 + inc3) / 3;
    const avgExpense = (exp1 + exp2 + exp3) / 3;
    const avgNet = (net1 + net2 + net3) / 3;
    
    // Overall growth from Year 3 to Year 1
    const overallGrowth = inc3 > 0 ? ((inc1 - inc3) / inc3) * 100 : 0;
    const savingsGrowth = net3 !== 0 && net3 > 0 ? ((net1 - net3) / net3) * 100 : 0;

    return { 
      chartData, 
      loading: false,
      longTermTrends: {
        avgIncome,
        avgExpense,
        avgNet,
        overallGrowth,
        savingsGrowth
      } 
    };
  }, [year1Data, year2Data, year3Data, baseYear, y1Loading, y2Loading, y3Loading]);

  // Derived messages
  let growthMessage = "Insufficient data for long-term trends.";
  if (longTermTrends && longTermTrends.overallGrowth > 0) {
    growthMessage = `Your income has grown by ${longTermTrends.overallGrowth.toFixed(1)}% over the last 3 years.`;
  } else if (longTermTrends && longTermTrends.overallGrowth < 0) {
    growthMessage = `Your income has seen a slight dip or remained stable over the past 3 years.`;
  } else {
    growthMessage = `Your income has been very stable over the past 3 years.`;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-6 animate-in slide-in-from-bottom-[10px] fade-in duration-500">
      
      {/* 1. Header (Selector Removed) */}
      <div className="flex items-center justify-between p-2 mb-2">
        <h1 className="text-display-40 text-white font-bold tracking-tight">Insights</h1>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[var(--color-brand-secondary)] flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-t-[var(--color-brand-accent)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          Analyzing multi-year trends...
        </div>
      ) : (
        <>
          {/* AI-like Summary Bubble - COMMENTED OUT
          <div className="glass-panel p-5 border border-[rgba(0,210,255,0.1)] bg-gradient-to-br from-[rgba(0,210,255,0.05)] to-transparent relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-brand-accent)] opacity-10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[rgba(0,210,255,0.1)] text-[var(--color-brand-accent)]">
                <Sparkles size={20} />
              </div>
              <div className="flex flex-col gap-1.5 pt-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Analysis</h3>
                <p className="text-sm text-[var(--color-brand-secondary)] leading-relaxed">
                  {growthMessage} Keep an eye on your expenses to maximize your net savings. Over the analyzed period, your average savings were 
                  <span className="text-white font-bold mx-1">
                    €{longTermTrends?.avgNet.toLocaleString('it-IT')}
                  </span> 
                  annually.
                </p>
              </div>
            </div>
          </div>
          */}

          {/* 3-Year Totals Grid */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="glass-panel p-5 flex flex-col gap-3 group hover:border-[rgba(255,255,255,0.1)] transition-colors relative overflow-hidden">
               <div className="flex items-center gap-2">
                 <TrendingUp className="text-[#10B981]" size={16} />
                 <span className="text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase">Total 3-Year Income</span>
               </div>
               <span className="text-2xl font-bold text-white">
                 €{(chartData.reduce((acc, curr) => acc + curr.income, 0)).toLocaleString('it-IT')}
               </span>
            </div>
            
            <div className="glass-panel p-5 flex flex-col gap-3 group hover:border-[rgba(255,255,255,0.1)] transition-colors relative overflow-hidden">
               <div className="flex items-center gap-2">
                 <TrendingDown className="text-[#F05A64]" size={16} />
                 <span className="text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase">Total 3-Year Expense</span>
               </div>
               <span className="text-2xl font-bold text-white">
                 €{(chartData.reduce((acc, curr) => acc + curr.expense, 0)).toLocaleString('it-IT')}
               </span>
            </div>
            
            <div className="glass-panel p-5 flex flex-col gap-3 group hover:border-[rgba(255,255,255,0.1)] transition-colors relative col-span-2 overflow-hidden items-center text-center">
               <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-accent)] opacity-[0.02] pointer-events-none" />
               <div className="flex items-center gap-2">
                 <Target className="text-[var(--color-brand-accent)]" size={16} />
                 <span className="text-[10px] font-bold tracking-wider text-[var(--color-brand-secondary)] uppercase">3-Year Net Savings Growth</span>
               </div>
               <span className={`text-3xl font-bold ${longTermTrends && longTermTrends.savingsGrowth >= 0 ? 'text-[var(--color-brand-success)]' : 'text-[var(--color-brand-danger)]'}`}>
                 {longTermTrends && longTermTrends.savingsGrowth >= 0 ? '+' : ''}{longTermTrends?.savingsGrowth.toFixed(1)}%
               </span>
               <span className="text-xs text-[var(--color-brand-secondary)] max-w-xs leading-relaxed mt-1">
                 From {baseYear - 2} to {baseYear}
               </span>
            </div>
          </div>

          {/* 3-Year Comparison Chart */}
          <div className="glass-panel p-5 mt-2 relative">
            <h3 className="text-heading-3 mb-6 px-1 tracking-wide text-white">3-Year Comparison</h3>
            <div className="h-[250px] w-full mt-2">
              <MultiYearComparisonChart data={chartData} />
            </div>
          </div>
        </>
      )}

    </div>
  );
}
