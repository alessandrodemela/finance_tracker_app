'use client';

import React, { useState, useMemo } from 'react';
import { useAnnualSummary } from '@/hooks/useData';
import { TrendingUp, TrendingDown, Target, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer, DashboardGrid, GridCol } from '@/components/ui/DashboardGrid';
import { YearSelector } from '@/components/ui/YearSelector';
import { MultiYearComparisonChart, MultiYearData } from '@/components/ui/MultiYearComparisonChart';
import { CategoryPieChart } from '@/components/DashboardCharts';
import { cn } from '@/lib/utils';

export function InsightsTab() {
  const [baseYear, setBaseYear] = useState<number>(new Date().getFullYear());

  // Fetch last 3 years
  const { monthlyData: year1Data, categoryData: year1Categories, loading: y1Loading } = useAnnualSummary(baseYear);
  const { monthlyData: year2Data, loading: y2Loading } = useAnnualSummary(baseYear - 1);
  const { monthlyData: year3Data, loading: y3Loading } = useAnnualSummary(baseYear - 2);

  const calculateTotal = (data: Array<Record<string, number>>, key: string) =>
    Math.round(data.reduce((sum, d) => sum + (d[key] || 0), 0) || 0);

  const { chartData, longTermTrends, loading, totalIncome, totalExpense, totalNet } = useMemo(() => {
    if (y1Loading || y2Loading || y3Loading) {
      return { 
        chartData: [], 
        longTermTrends: null, 
        loading: true, 
        totalIncome: 0, 
        totalExpense: 0, 
        totalNet: 0 
      };
    }

    // Year 1 (Current Selected)
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

    const totalIncome = inc1 + inc2 + inc3;
    const totalExpense = exp1 + exp2 + exp3;
    const totalNet = net1 + net2 + net3;

    // Long term insights
    const avgAnnualIncome = totalIncome / 3;
    const avgAnnualExpense = totalExpense / 3;
    const avgAnnualNet = totalNet / 3;

    // Growth rates
    const incomeGrowth = inc3 > 0 ? ((inc1 - inc3) / inc3) * 100 : 0;
    const expenseGrowth = exp3 > 0 ? ((exp1 - exp3) / exp3) * 100 : 0;
    const savingsGrowth = net3 !== 0 && net3 > 0 ? ((net1 - net3) / net3) * 100 : 0;
    const threeYearSavingsRate = totalIncome > 0 ? (totalNet / totalIncome) * 100 : 0;

    return {
      chartData,
      loading: false,
      totalIncome,
      totalExpense,
      totalNet,
      longTermTrends: {
        avgAnnualIncome,
        avgAnnualExpense,
        avgAnnualNet,
        incomeGrowth,
        expenseGrowth,
        savingsGrowth,
        threeYearSavingsRate,
      },
    };
  }, [year1Data, year2Data, year3Data, baseYear, y1Loading, y2Loading, y3Loading]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-brand-navy)] text-[var(--color-brand-primary)] animate-in fade-in duration-500 w-full">
      {/* 1. Page Header with Base Year Selector */}
      <PageHeader
        title="Insights & Trends"
        subtitle={`Multi-year financial intelligence and patterns (${baseYear - 2} – ${baseYear})`}
        controls={<YearSelector year={baseYear} onChange={setBaseYear} />}
      />

      {/* 2. Main Page Grid Container */}
      <PageContainer>
        {loading ? (
          <div className="text-center py-24 text-slate-500 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest">Analyzing multi-year performance...</span>
          </div>
        ) : (
          <>
            {/* 3-Year Aggregate KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 3-Year Total Income */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 relative overflow-hidden backdrop-blur-md group hover:border-slate-700/80 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">3-YEAR INCOME</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <ArrowUpRight className="text-emerald-400 w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-xl lg:text-2xl text-white font-bold font-mono tracking-tight">
                    €{totalIncome.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </span>
                  <div className={cn(
                    "flex items-center gap-1 text-[11px] font-bold tracking-wide mt-1.5",
                    (longTermTrends?.incomeGrowth ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {(longTermTrends?.incomeGrowth ?? 0) >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    <span>{Math.abs(longTermTrends?.incomeGrowth ?? 0).toFixed(1)}% 3-yr growth</span>
                  </div>
                </div>
              </div>

              {/* 3-Year Total Expense */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 relative overflow-hidden backdrop-blur-md group hover:border-slate-700/80 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">3-YEAR EXPENSES</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <ArrowDownRight className="text-rose-400 w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-xl lg:text-2xl text-white font-bold font-mono tracking-tight">
                    €{totalExpense.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </span>
                  <div className={cn(
                    "flex items-center gap-1 text-[11px] font-bold tracking-wide mt-1.5",
                    (longTermTrends?.expenseGrowth ?? 0) <= 0 ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {(longTermTrends?.expenseGrowth ?? 0) >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    <span>{Math.abs(longTermTrends?.expenseGrowth ?? 0).toFixed(1)}% 3-yr shift</span>
                  </div>
                </div>
              </div>

              {/* 3-Year Net Savings */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 relative overflow-hidden backdrop-blur-md group hover:border-slate-700/80 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">3-YEAR NET SAVINGS</span>
                  <div className={cn(
                    "w-8 h-8 rounded-xl border flex items-center justify-center",
                    totalNet >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
                  )}>
                    <Target className={cn("w-4 h-4", totalNet >= 0 ? "text-emerald-400" : "text-rose-400")} />
                  </div>
                </div>
                <div>
                  <span className={cn(
                    "text-xl lg:text-2xl font-bold font-mono tracking-tight",
                    totalNet >= 0 ? "text-white" : "text-rose-400"
                  )}>
                    {totalNet < 0 ? '-' : ''}€{Math.abs(totalNet).toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </span>
                  <div className="text-[11px] font-semibold text-slate-400 mt-1.5">
                    Avg €{(longTermTrends?.avgAnnualNet ?? 0).toLocaleString('it-IT', { maximumFractionDigits: 0 })}/yr
                  </div>
                </div>
              </div>

              {/* Overall Savings Rate */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 lg:p-5 relative overflow-hidden backdrop-blur-md group hover:border-slate-700/80 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">AVG SAVINGS RATE</span>
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Zap className="text-cyan-400 w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className={cn(
                    "text-xl lg:text-2xl font-bold font-mono tracking-tight",
                    (longTermTrends?.threeYearSavingsRate ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {(longTermTrends?.threeYearSavingsRate ?? 0) >= 0 ? '+' : ''}
                    {(longTermTrends?.threeYearSavingsRate ?? 0).toFixed(1)}%
                  </span>
                  <div className="text-[11px] font-semibold text-slate-400 mt-1.5">
                    Across 3-year window
                  </div>
                </div>
              </div>
            </div>

            {/* 12-Column Responsive Dashboard Layout */}
            <DashboardGrid>
              {/* Main Column (8 cols): 3-Year Comparison Chart */}
              <GridCol span={8} className="space-y-6">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 lg:p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-base font-semibold text-white tracking-tight">3-Year Trend Comparison</h3>
                      <p className="text-xs text-slate-400">Income vs expense totals from {baseYear - 2} to {baseYear}</p>
                    </div>
                  </div>
                  <div className="h-[280px] w-full">
                    <MultiYearComparisonChart data={chartData} />
                  </div>
                </div>
              </GridCol>

              {/* Secondary Column (4 cols): Category Distribution & Summary Stats */}
              <GridCol span={4} className="space-y-6">
                {/* Year Category Distribution */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 lg:p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-white tracking-tight">Category Distribution</h3>
                      <p className="text-xs text-slate-400">Expense breakdown for {baseYear}</p>
                    </div>
                  </div>
                  <div className="h-[220px] w-full flex items-center justify-center">
                    {year1Categories.length === 0 ? (
                      <div className="text-slate-500 text-xs">No category data for {baseYear}</div>
                    ) : (
                      <CategoryPieChart data={year1Categories} />
                    )}
                  </div>
                </div>

                {/* Annual Financial Health Metric */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 lg:p-6 backdrop-blur-md">
                  <h3 className="text-base font-semibold text-white tracking-tight mb-3">Long-term Velocity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-xs text-slate-400">Net Savings Growth</span>
                      <span className={cn(
                        "text-xs font-mono font-bold",
                        (longTermTrends?.savingsGrowth ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {(longTermTrends?.savingsGrowth ?? 0) >= 0 ? '+' : ''}
                        {(longTermTrends?.savingsGrowth ?? 0).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-xs text-slate-400">Annual Average Net</span>
                      <span className="text-xs font-mono font-bold text-white">
                        €{(longTermTrends?.avgAnnualNet ?? 0).toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>
              </GridCol>
            </DashboardGrid>
          </>
        )}
      </PageContainer>
    </div>
  );
}
