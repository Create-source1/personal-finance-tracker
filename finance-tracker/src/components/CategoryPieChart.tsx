// src/components/CategoryPieChart.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Transaction } from "../types/Transaction";

interface Props {
  filteredTransactions: Transaction[];
  othersThresholdPercent?: number; // threshold used when grouping into "Others" (mobile only)
}

// deterministic color per string
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 65%, 55%)`;
}

const CategoryPieChart: React.FC<Props> = ({
  filteredTransactions,
  othersThresholdPercent = 4,
}) => {
  // detect mobile; used to decide grouping behavior
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * Build chartData.
   * - Always compute per-category totals.
   * - ONLY when isMobile === true, group categories below threshold into "Others".
   * - On non-mobile, return all categories (no grouping).
   */
  const chartData = useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) return [];

    // sum amounts per category
    const categoryTotals = filteredTransactions.reduce<Record<string, number>>(
      (acc, tx) => {
        if (!acc[tx.category]) acc[tx.category] = 0;
        acc[tx.category] += tx.amount;
        return acc;
      },
      {}
    );

    // create entries array
    const entries = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      color: stringToColor(category),
    }));

    // if not mobile, return all categories sorted by amount desc
    if (!isMobile) {
      return entries
        .sort((a, b) => b.amount - a.amount)
        .map((e) => ({ category: e.category, amount: e.amount, color: e.color }));
    }

    // ---- MOBILE: group small categories into "Others" ----
    const total = entries.reduce((s, e) => s + e.amount, 0) || 1;
    const major = entries.filter(
      (e) => (e.amount / total) * 100 >= othersThresholdPercent
    );
    const minor = entries.filter(
      (e) => (e.amount / total) * 100 < othersThresholdPercent
    );

    const result = major
      .sort((a, b) => b.amount - a.amount)
      .map((e) => ({ category: e.category, amount: e.amount, color: e.color }));

    if (minor.length > 0) {
      const othersTotal = minor.reduce((s, e) => s + e.amount, 0);
      result.push({
        category: "Others",
        amount: othersTotal,
        color: "#d1d5db", // neutral gray for Others
      });
    }

    return result;
  }, [filteredTransactions, isMobile, othersThresholdPercent]);

  if (chartData.length === 0) {
    return (
      <p className="text-gray-600 text-center py-6">No transactions to display.</p>
    );
  }

  // Custom legend for mobile keeps showing amount + percent (works with grouped "Others")
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    const total = payload.reduce((sum: number, entry: any) => sum + entry.payload.amount, 0) || 1;

    return (
      <ul className="flex justify-center flex-wrap text-xs sm:text-sm text-gray-700 mt-2">
        {payload.map((entry: any, index: number) => {
          const percent = Math.round((entry.payload.amount / total) * 100);
          return (
            <li key={`item-${index}`} className="mx-2 flex items-center space-x-1 mb-1">
              <span
                style={{
                  backgroundColor: entry.color,
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                }}
              />
              <span>{entry.value} ({percent}%)</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={isMobile ? 70 : 100}
            label={
              isMobile
                ? false
                : (entry) => {
                    const category = entry.category as string;
                    const percent = entry.percent as number;
                    return `${category} ${(percent * 100).toFixed(0)}%`;
                  }
            }
            labelLine={!isMobile}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value: number) => `₹${value.toFixed(2)}`}
            labelFormatter={(label) => label}
          />

          <Legend
            verticalAlign={isMobile ? "bottom" : "middle"}
            align={isMobile ? "center" : "right"}
            layout={isMobile ? "horizontal" : "vertical"}
            height={isMobile ? 50 : undefined}
            content={isMobile ? renderCustomLegend : undefined}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
