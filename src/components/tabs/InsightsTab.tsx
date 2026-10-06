'use client';

import React, { useState, useMemo } from 'react';
import { useAnnualSummary } from '@/hooks/useData';
import { TrendingUp, TrendingDown, Target, Zap, ArrowUpRight, ArrowDownRight, Eye, EyeOff } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer, DashboardGrid, GridCol } from '@/components/ui/DashboardGrid';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { YearSelector } from '@/components/ui/YearSelector';
import { MultiYearComparisonChart, MultiYearData } from '@/components/ui/MultiYearComparisonChart';
import { CategoryPieChart } from '@/components/DashboardCharts';
import { cn } from '@/lib/utils';

interface InsightsTabProps {
  isSensitiveVisible?: boolean;
  setIsSensitiveVisible?: (visible: boolean) => void;
}

export function InsightsTab({ isSensitiveVisible = true, setIsSensitiveVisible }: InsightsTabProps) {
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
      {/* 1. Page Header with Base Year Selector & Eye toggle */}
      <PageHeader
        title="Insights & Trends"
        subtitle={`Multi-year financial intelligence and patterns (${baseYear - 2} – ${baseYear})`}
        controls={<YearSelector year={baseYear} onChange={setBaseYear} />}
        actions={
          setIsSensitiveVisible ? (
            <button
              onClick={() => setIsSensitiveVisible(!isSensitiveVisible)}
              className="text-[var(--color-brand-secondary)] hover:text-white transition-colors p-2.5 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10"
              title={isSensitiveVisible ? "Hide sensitive data" : "Show sensitive data"}
            >
              {isSensitiveVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          ) : undefined
        }
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 3-Year Total Income */}
              <DashboardCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-white/5 border-white/10 transition-colors">
                    <ArrowUpRight className="text-[var(--color-brand-success)] w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-[var(--color-brand-secondary)]">
                    3-Year Income
                  </p>
                  <h2 className={cn(
                    "text-2xl lg:text-3xl text-white font-bold font-mono tracking-tight block transition-all",
                    !isSensitiveVisible && "blur-lg select-none"
                  )}>
                    €{totalIncome.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </h2>
                  <div className={cn(
                    "flex items-center gap-1 text-[11px] font-bold tracking-wide mt-2",
                    (longTermTrends?.incomeGrowth ?? 0) >= 0 ? "text-[var(--color-brand-success)]" : "text-[var(--color-brand-danger)]"
                  )}>
                    {(longTermTrends?.incomeGrowth ?? 0) >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    <span>{Math.abs(longTermTrends?.incomeGrowth ?? 0).toFixed(1)}% 3-yr growth</span>
                  </div>
                </div>
              </DashboardCard>

              {/* 3-Year Total Expense */}
              <DashboardCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-white/5 border-white/10 transition-colors">
                    <ArrowDownRight className="text-[var(--color-brand-danger)] w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-[var(--color-brand-secondary)]">
                    3-Year Expenses
                  </p>
                  <h2 className={cn(
                    "text-2xl lg:text-3xl text-white font-bold font-mono tracking-tight block transition-all",
                    !isSensitiveVisible && "blur-lg select-none"
                  )}>
                    €{totalExpense.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </h2>
                  <div className={cn(
                    "flex items-center gap-1 text-[11px] font-bold tracking-wide mt-2",
                    (longTermTrends?.expenseGrowth ?? 0) <= 0 ? "text-[var(--color-brand-success)]" : "text-[var(--color-brand-danger)]"
                  )}>
                    {(longTermTrends?.expenseGrowth ?? 0) >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    <span>{Math.abs(longTermTrends?.expenseGrowth ?? 0).toFixed(1)}% 3-yr shift</span>
                  </div>
                </div>
              </DashboardCard>

              {/* 3-Year Net Savings */}
              <DashboardCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-white/5 border-white/10 transition-colors">
                    <Target className={cn("w-5 h-5", totalNet >= 0 ? "text-[var(--color-brand-success)]" : "text-[var(--color-brand-danger)]")} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-[var(--color-brand-secondary)]">
                    3-Year Net Savings
                  </p>
                  <h2 className={cn(
                    "text-2xl lg:text-3xl font-bold font-mono tracking-tight block transition-all",
                    totalNet >= 0 ? "text-white" : "text-[var(--color-brand-danger)]",
                    !isSensitiveVisible && "blur-lg select-none"
                  )}>
                    {totalNet < 0 ? '-' : ''}€{Math.abs(totalNet).toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </h2>
                  <div className={cn(
                    "text-[11px] font-semibold text-slate-400 mt-2 transition-all",
                    !isSensitiveVisible && "blur-sm select-none"
                  )}>
                    Avg €{(longTermTrends?.avgAnnualNet ?? 0).toLocaleString('it-IT', { maximumFractionDigits: 0 })}/yr
                  </div>
                </div>
              </DashboardCard>

              {/* Overall Savings Rate */}
              <DashboardCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-white/5 border-white/10 transition-colors">
                    <Zap className="text-cyan-400 w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-[var(--color-brand-secondary)]">
                    Avg Savings Rate
                  </p>
                  <h2 className={cn(
                    "text-2xl lg:text-3xl font-bold font-mono tracking-tight block transition-all",
                    (longTermTrends?.threeYearSavingsRate ?? 0) >= 0 ? "text-[var(--color-brand-success)]" : "text-[var(--color-brand-danger)]",
                    !isSensitiveVisible && "blur-lg select-none"
                  )}>
                    {(longTermTrends?.threeYearSavingsRate ?? 0) >= 0 ? '+' : ''}
                    {(longTermTrends?.threeYearSavingsRate ?? 0).toFixed(1)}%
                  </h2>
                  <div className="text-[11px] font-semibold text-slate-400 mt-2">
                    Across 3-year window
                  </div>
                </div>
              </DashboardCard>
            </div>

            {/* 12-Column Responsive Dashboard Layout */}
            <DashboardGrid>
              {/* Main Column (8 cols): 3-Year Comparison Chart */}
              <GridCol span={8} className="space-y-6">
                <DashboardCard>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-white font-bold text-lg">3-Year Trend Comparison</h3>
                      <p className="text-[var(--color-brand-secondary)] text-sm">Income vs expense totals from {baseYear - 2} to {baseYear}</p>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <MultiYearComparisonChart data={chartData} />
                  </div>
                </DashboardCard>
              </GridCol>

              {/* Secondary Column (4 cols): Category Distribution & Summary Stats */}
              <GridCol span={4} className="space-y-6">
                {/* Year Category Distribution */}
                <DashboardCard>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-white font-bold text-lg">Category Distribution</h3>
                      <p className="text-[var(--color-brand-secondary)] text-sm">Expense breakdown for {baseYear}</p>
                    </div>
                  </div>
                  <div className="h-[230px] w-full flex items-center justify-center">
                    {year1Categories.length === 0 ? (
                      <div className="text-slate-500 text-xs">No category data for {baseYear}</div>
                    ) : (
                      <CategoryPieChart data={year1Categories} />
                    )}
                  </div>
                </DashboardCard>

                {/* Annual Financial Health Metric */}
                <DashboardCard>
                  <h3 className="text-white font-bold text-lg mb-4">Long-term Velocity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5">
                      <span className="text-xs text-slate-400">Net Savings Growth</span>
                      <span className={cn(
                        "text-xs font-mono font-bold transition-all",
                        (longTermTrends?.savingsGrowth ?? 0) >= 0 ? "text-[var(--color-brand-success)]" : "text-[var(--color-brand-danger)]",
                        !isSensitiveVisible && "blur-sm select-none"
                      )}>
                        {(longTermTrends?.savingsGrowth ?? 0) >= 0 ? '+' : ''}
                        {(longTermTrends?.savingsGrowth ?? 0).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5">
                      <span className="text-xs text-slate-400">Annual Average Net</span>
                      <span className={cn(
                        "text-xs font-mono font-bold text-white transition-all",
                        !isSensitiveVisible && "blur-md select-none"
                      )}>
                        €{(longTermTrends?.avgAnnualNet ?? 0).toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </DashboardCard>
              </GridCol>
            </DashboardGrid>
          </>
        )}
      </PageContainer>
    </div>
  );
}
