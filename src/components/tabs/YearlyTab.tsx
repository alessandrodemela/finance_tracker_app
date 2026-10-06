'use client';

import React, { useMemo, useState } from 'react';
import { useAnnualSummary } from '@/hooks/useData';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer, DashboardGrid, GridCol } from '@/components/ui/DashboardGrid';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { YearSelector } from '@/components/ui/YearSelector';
import { YearlyKPICards } from '@/components/ui/YearlyKPICards';
import { InsightsSection, InsightData } from '@/components/ui/InsightsSection';
import { TrendComparisonChart } from '@/components/ui/TrendComparisonChart';
import { MultiYearComparisonChart, MultiYearData } from '@/components/ui/MultiYearComparisonChart';
import { CategoryTreemap } from '@/components/DashboardCharts';
import { MonthlyBreakdownTable, MonthlyBreakdownRow } from '@/components/ui/MonthlyBreakdownTable';
import { History, BarChart2, Eye, EyeOff } from 'lucide-react';

interface MonthlyMetricItem {
  income: number;
  expense: number;
  [key: string]: number;
}

interface YearlyTabProps {
  isSensitiveVisible?: boolean;
  setIsSensitiveVisible?: (visible: boolean) => void;
}

export function YearlyTab({ isSensitiveVisible = true, setIsSensitiveVisible }: YearlyTabProps) {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [showMultiYear, setShowMultiYear] = useState<boolean>(false);
  
  // Fetch current year, prev year and two years ago for multi-year comparison
  const { monthlyData: currentYearData, categoryData, loading: cyLoading } = useAnnualSummary(year);
  const { monthlyData: prevYearData, loading: pyLoading } = useAnnualSummary(year - 1);
  const { monthlyData: prev2YearData, loading: p2yLoading } = useAnnualSummary(year - 2);

  const calculateTotal = (data: MonthlyMetricItem[], key: string) => data.reduce((sum, d) => sum + (d[key] || 0), 0);
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // KPIs & Calculations
  const { kpis, insights, chartData, tableData, multiYearData } = useMemo(() => {
    const curInc = calculateTotal(currentYearData, 'income');
    const curExp = calculateTotal(currentYearData, 'expense');
    const curNet = curInc - curExp;
    const curRate = curInc > 0 ? (curNet / curInc) * 100 : 0;

    const prevInc = calculateTotal(prevYearData, 'income');
    const prevExp = calculateTotal(prevYearData, 'expense');
    const prevNet = prevInc - prevExp;
    const prevRate = prevInc > 0 ? (prevNet / prevInc) * 100 : 0;

    const p2Inc = calculateTotal(prev2YearData, 'income');
    const p2Exp = calculateTotal(prev2YearData, 'expense');
    const p2Net = p2Inc - p2Exp;

    const kpis = {
      income: { value: curInc, trend: calculateChange(curInc, prevInc) },
      expenses: { value: curExp, trend: calculateChange(curExp, prevExp) },
      net: { value: curNet, trend: calculateChange(curNet, prevNet) },
      savingsRate: { value: curRate, trend: curRate - prevRate }
    };

    // Table & Charts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let bestMonth = { month: 'N/A', amount: -Infinity };
    const breakdownRows: MonthlyBreakdownRow[] = [];
    const trends: Array<{ month: string; income: number; expense: number }> = [];
    
    currentYearData.forEach((d: MonthlyMetricItem, i) => {
      const monthName = months[i];
      const net = d.income - d.expense;
      const rate = d.income > 0 ? (net / d.income) * 100 : 0;

      if (net > bestMonth.amount && d.income > 0) {
        bestMonth = { month: monthName, amount: net };
      }

      breakdownRows.push({
        month: monthName,
        income: d.income,
        expense: d.expense,
        net,
        savingsRate: rate
      });

      if (d.income > 0 || d.expense > 0) {
        trends.push({
          month: monthName,
          income: d.income,
          expense: d.expense
        });
      }
    });

    const highestCat = categoryData.length > 0 ? categoryData[0] : { name: 'N/A', value: 0 };

    const insights: InsightData = {
      bestMonth: bestMonth.amount === -Infinity ? { month: 'N/A', amount: 0 } : bestMonth,
      highestSpending: { category: highestCat.name, amount: highestCat.value },
      averageSavings: curNet / (trends.length || 1)
    };

    const multiYearData: MultiYearData[] = [
      { year: String(year - 2), income: p2Inc, expense: p2Exp, net: p2Net },
      { year: String(year - 1), income: prevInc, expense: prevExp, net: prevNet },
      { year: String(year), income: curInc, expense: curExp, net: curNet },
    ].filter(d => d.income > 0 || d.expense > 0);

    return { 
      kpis, 
      insights, 
      chartData: trends, 
      tableData: breakdownRows,
      multiYearData
    };
  }, [currentYearData, prevYearData, prev2YearData, categoryData, year]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-brand-navy)] text-[var(--color-brand-primary)] animate-in fade-in duration-500 w-full">
      {/* 1. Standardized Page Header with YearSelector & Historical Toggle */}
      <PageHeader
        title="Yearly Overview"
        subtitle={`Annual performance and historical comparison for ${year}`}
        controls={<YearSelector year={year} onChange={setYear} />}
        actions={
          <div className="flex items-center gap-3">
            {setIsSensitiveVisible && (
              <button
                onClick={() => setIsSensitiveVisible(!isSensitiveVisible)}
                className="text-[var(--color-brand-secondary)] hover:text-white transition-colors p-2.5 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10"
                title={isSensitiveVisible ? "Hide sensitive data" : "Show sensitive data"}
              >
                {isSensitiveVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={() => setShowMultiYear(prev => !prev)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all border ${
                showMultiYear 
                  ? 'bg-white text-black border-white shadow-lg' 
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{showMultiYear ? 'Annual View' : 'Multi-Year Compare'}</span>
            </button>
          </div>
        }
      />

      {/* 2. Main Page Grid Container */}
      <PageContainer>
        {/* Yearly KPI Cards Row */}
        <YearlyKPICards {...kpis} isSensitiveVisible={isSensitiveVisible} />

        {/* 12-Column Responsive Dashboard Layout */}
        <DashboardGrid>
          {/* Main Column (8 cols): Charts & Breakdown Table */}
          <GridCol span={8} className="space-y-6">
            {/* Trend Chart or Multi-Year Compare Chart */}
            <DashboardCard>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-white font-bold text-lg">
                    {showMultiYear ? 'Multi-Year Comparison' : 'Income vs Expense Trend'}
                  </h3>
                  <p className="text-[var(--color-brand-secondary)] text-sm">
                    {showMultiYear 
                      ? 'Annual totals comparison across recent years' 
                      : `Month-by-month cash flow trajectory for ${year}`}
                  </p>
                </div>
              </div>
              <div className="h-[280px] w-full">
                {showMultiYear ? (
                  <MultiYearComparisonChart data={multiYearData} />
                ) : (
                  <TrendComparisonChart data={chartData} />
                )}
              </div>
            </DashboardCard>

            {/* Monthly Breakdown Detailed Table */}
            <DashboardCard>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-bold text-lg">Monthly Breakdown</h3>
                  <p className="text-[var(--color-brand-secondary)] text-sm">Detailed month-by-month financial statement</p>
                </div>
              </div>
              <MonthlyBreakdownTable data={tableData} isSensitiveVisible={isSensitiveVisible} />
            </DashboardCard>
          </GridCol>

          {/* Secondary Column (4 cols): Insights & Expense Distribution */}
          <GridCol span={4} className="space-y-6">
            {/* Key Annual Insights */}
            <DashboardCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-lg">Yearly Highlights</h3>
                <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  {year}
                </span>
              </div>
              <InsightsSection data={insights} isSensitiveVisible={isSensitiveVisible} />
            </DashboardCard>

            {/* Category Expense Distribution Treemap */}
            <DashboardCard>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-bold text-lg">Expense Distribution</h3>
                  <p className="text-[var(--color-brand-secondary)] text-sm">Category breakdown for {year}</p>
                </div>
              </div>
              <div className="h-[280px] w-full mt-2">
                <CategoryTreemap data={categoryData} />
              </div>
            </DashboardCard>
          </GridCol>
        </DashboardGrid>
      </PageContainer>
    </div>
  );
}
