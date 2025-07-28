// src/components/BalanceDonutChart.tsx
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface Props {
  income: number;
  expense: number;
  balance: number;
}

const COLORS = ['#16a34a', '#dc2626']; // green, red

export default function BalanceDonutChart({ income, expense, balance }: Props) {
  const total = income + expense;

  const data = [
    { name: 'Income', value: income },
    { name: 'Expense', value: expense },
  ];

  if (total === 0) {
    return <p>No data to show yet.</p>;
  }

  return (
    <div style={{ width: 300, height: 300, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={80}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        Net Balance
        <br />
        INR {balance.toFixed(2)}
      </div>
    </div>
  );
}
