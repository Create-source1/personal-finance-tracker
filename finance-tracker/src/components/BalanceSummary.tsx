// src/components/BalanceSummary.tsx
import type { Transaction } from "../types/Transaction";

interface Props {
  transactions: Transaction[];
}

export default function BalanceSummary({ transactions }: Props) {
  const income = transactions
    .filter((tx) => tx.type === "Income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expense = transactions
    .filter((tx) => tx.type === "Expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = income - expense;

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4">Current Balance</h2>
      <p>
        <strong>📊 Net Balance:</strong>{" "}
        <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>
          INR {balance.toFixed(2)}
        </span>
      </p>
      <p>
        <strong>💰 Total Income:</strong>{" "}
        <span className="text-green-600">INR {income.toFixed(2)}</span>
      </p>
      <p>
        <strong>💸 Total Expenses:</strong>{" "}
        <span className="text-red-600">INR {expense.toFixed(2)}</span>
      </p>
    </div>
  );
}
