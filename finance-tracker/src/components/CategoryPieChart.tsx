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
}

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 65%, 55%)`;
}

const CategoryPieChart: React.FC<Props> = ({ filteredTransactions }) => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chartData = useMemo(() => {
    const categoryTotals = filteredTransactions.reduce<Record<string, number>>(
      (acc, tx) => {
        if (!acc[tx.category]) acc[tx.category] = 0;
        acc[tx.category] += tx.amount;
        return acc;
      },
      {}
    );

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      color: stringToColor(category),
    }));
  }, [filteredTransactions]);

  if (chartData.length === 0) {
    return (
      <p className="text-gray-600 text-center py-6">
        No transactions to display.
      </p>
    );
  }
  // For mobile view 👇
  const renderCustomLegend = (props: any) => {
    const { payload } = props;

    const total = payload.reduce(
      (sum: number, entry: any) => sum + entry.payload.amount,
      0
    );

    return (
      <ul className="flex justify-center flex-wrap text-xs sm:text-sm text-gray-700">
        {payload.map((entry: any, index: number) => {
          const percent = ((entry.payload.amount / total) * 100).toFixed(0);

          return (
            <li
              key={`item-${index}`}
              className="mx-2 flex items-center space-x-1"
            >
              <span
                style={{
                  backgroundColor: entry.color,
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                }}
              />
              <span>
                {entry.value} ({percent}%)
              </span>
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
            outerRadius={isMobile ? 70 : 100} // smaller radius on mobile
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
          <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
          <Legend
            verticalAlign={isMobile ? "bottom" : "middle"} // "middle" is valid, "right" is not
            align={isMobile ? "center" : "right"} // use align for horizontal positioning
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
