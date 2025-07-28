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
    <div style={{ marginTop: 30, marginBottom: 30 }}>
      <h2>Current Balance</h2>
      <p>
        <strong>📊 Net Balance:</strong>{" "}
        <span style={{ color: balance >= 0 ? "green" : "red" }}>
          INR {balance.toFixed(2)}
        </span>
      </p>
      <p>
        <strong>💰 Total Income:</strong>{" "}
        <span style={{ color: "green" }}>INR {income.toFixed(2)}</span>
      </p>
      <p>
        <strong>💸 Total Expenses:</strong>{" "}
        <span style={{ color: "red" }}>INR {expense.toFixed(2)}</span>
      </p>
    </div>
  );
}
