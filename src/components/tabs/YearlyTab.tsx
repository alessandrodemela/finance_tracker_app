'use client';

import React, { useMemo, useState } from 'react';
import { useAnnualSummary, useBudgetCategories } from '@/hooks/useData';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { YearlyKPICards } from '@/components/ui/YearlyKPICards';
import { InsightsSection, InsightData } from '@/components/ui/InsightsSection';
import { TrendComparisonChart } from '@/components/ui/TrendComparisonChart';
import { CategoryTreemap } from '@/components/DashboardCharts';
import { MonthlyBreakdownTable, MonthlyBreakdownRow } from '@/components/ui/MonthlyBreakdownTable';

export function YearlyTab() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  
  // Fetch current year and previous year for trends
  const { monthlyData: currentYearData, categoryData, loading: cyLoading } = useAnnualSummary(year);
  const { monthlyData: prevYearData, loading: pyLoading } = useAnnualSummary(year - 1);

  const calculateTotal = (data: any[], key: string) => data.reduce((sum, d) => sum + (d[key] || 0), 0);
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // KPIs
  const { kpis, insights, chartData, tableData } = useMemo(() => {
    const curInc = calculateTotal(currentYearData, 'income');
    const curExp = calculateTotal(currentYearData, 'expense');
    const curNet = curInc - curExp;
    const curRate = curInc > 0 ? (curNet / curInc) * 100 : 0;

    const prevInc = calculateTotal(prevYearData, 'income');
    const prevExp = calculateTotal(prevYearData, 'expense');
    const prevNet = prevInc - prevExp;
    const prevRate = prevInc > 0 ? (prevNet / prevInc) * 100 : 0;

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
    const trends: any[] = [];
    
    currentYearData.forEach((d: any, i) => {
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

    return { 
      kpis, 
      insights, 
      chartData: trends, 
      tableData: breakdownRows 
    };

  }, [currentYearData, prevYearData, categoryData]);

  if (cyLoading) {
    return <div className="text-center py-10 text-[var(--color-brand-secondary)]">Loading yearly data...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-6 animate-in slide-in-from-bottom-[10px] fade-in duration-500">
      
      {/* 1. Year Selector */}
      <div className="flex items-center justify-between p-2">
        <button 
          onClick={() => setYear(y => y - 1)}
          className="p-2.5 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-display-40 text-white font-bold tracking-tight">{year}</span>
        <button 
          onClick={() => setYear(y => y + 1)}
          className="p-2.5 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 2. Yearly KPI Cards */}
      <YearlyKPICards {...kpis} />

      {/* 3. YoY Comparison Bar */}
      <div className="glass-panel py-3 px-6 text-center shadow-lg border-x-0 rounded-none bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.02)] to-transparent">
        <span className="text-xs font-semibold tracking-wider text-[var(--color-brand-secondary)] uppercase">
          Compared to {year - 1} · {kpis.net.trend >= 0 ? '+' : ''}{kpis.net.trend.toFixed(1)}% Net Growth
        </span>
      </div>

      {/* 4. Insights Section */}
      <InsightsSection data={insights} />

      {/* 5. Income vs Expense Trend Chart */}
      <div className="glass-panel p-5 mt-2 relative">
        <h3 className="text-heading-3 mb-5 px-1 tracking-wide text-white">Income vs Expense</h3>
        <div className="h-[220px] w-full">
            <TrendComparisonChart data={chartData} />
        </div>
      </div>

      {/* 6. Category Distribution */}
      <div className="glass-panel p-5 mt-2 relative overflow-hidden">
        <h3 className="text-heading-3 px-1 tracking-wide text-white">Expense Distribution</h3>
        <span className="text-xs text-[var(--color-brand-secondary)] px-1 mb-5 block">Expense intensity by category for {year}</span>
        <div className="h-[400px] w-full mt-4">
            <CategoryTreemap data={categoryData} />
        </div>
      </div>

      {/* 7. Monthly Breakdown Table */}
      <div className="flex flex-col gap-3 mt-4">
        <h3 className="text-heading-3 px-1 tracking-wide text-white">Monthly Breakdown</h3>
        <MonthlyBreakdownTable data={tableData} />
      </div>

    </div>
  );
}
