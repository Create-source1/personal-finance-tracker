// src/components/TransactionList.tsx
import type { Transaction } from "../types/Transaction";
import "../App.css";

interface Props {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: Props) {
  if (transactions.length === 0) {
    return <p>No transactions yet.</p>;
  }

  return (
    <table className="transaction-table">
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: "8px" }}>Description</th>
          <th style={{ textAlign: "right", padding: "8px" }}>Amount</th>
          <th style={{ textAlign: "center", padding: "8px" }}>Type</th>
          <th style={{ textAlign: "center", padding: "8px" }}>Category</th>
          <th style={{ textAlign: "center", padding: "8px" }}>Date</th>
          <th style={{ textAlign: "center", padding: "8px" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => (
          <tr key={tx.id}>
            <td style={{ padding: "8px" }}>{tx.description}</td>
            <td
              style={{
                color: tx.type === "Income" ? "green" : "red",
                textAlign: "right",
                padding: "8px",
              }}
            >
              ₹{tx.amount.toFixed(2)}
            </td>
            <td style={{ textAlign: "center", padding: "8px" }}>{tx.type}</td>
            <td style={{ textAlign: "center", padding: "8px" }}>
              {tx.category}
            </td>
            <td style={{ textAlign: "center", padding: "8px" }}>{tx.date}</td>
            <td style={{ textAlign: "center", padding: "8px" }}>
              <button
                onClick={() => onEdit(tx)}
                className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded mr-2 cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(tx.id)}
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded cursor-pointer"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
