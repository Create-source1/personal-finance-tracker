// src/components/TransactionList.tsx
import type { Transaction } from "../types/Transaction";
import "../App.css";

function highlightMatch(text: string, term: string) {
  if (!term) return text;
  const parts = text.split(new RegExp(`(${term})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <span key={i} className="bg-yellow-200 font-semibold">
        {part}
      </span>
    ) : (
      part
    )
  );
}
interface Props {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  searchTerm?: string;
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  searchTerm = "",
}: Props) {
  // Filter transactions by matching description or category (or any field you want)
  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredTransactions.length === 0 && transactions.length > 0) {
    return <p className="text-center text-gray-600 mt-4">No results found.</p>;
  }

  if (transactions.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-4">No transactions yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 shadow rounded-lg divide-y divide-gray-200">
        <thead className="bg-gray-100 text-gray-700 text-sm font-semibold">
          <tr>
            <th className="text-left px-4 py-2">Description</th>
            <th className="text-right px-4 py-2">Amount</th>
            <th className="text-center px-4 py-2">Type</th>
            <th className="text-center px-4 py-2">Category</th>
            <th className="text-center px-4 py-2">Date</th>
            <th className="text-center px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">
                {highlightMatch(tx.description, searchTerm || "")}
              </td>
              <td
                className={`px-4 py-2 text-right ${
                  tx.type === "Income" ? "text-green-600" : "text-red-600"
                }`}
              >
                ₹{tx.amount.toFixed(2)}
              </td>
              <td className="px-4 py-2 text-center">{tx.type}</td>
              <td className="px-4 py-2 text-center">
                {highlightMatch(tx.category, searchTerm || "")}
              </td>
              <td className="px-4 py-2 text-center">{tx.date}</td>
              <td className="px-4 py-2 text-center space-x-2">
                <button
                  onClick={() => onEdit(tx)}
                  className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(tx.id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
