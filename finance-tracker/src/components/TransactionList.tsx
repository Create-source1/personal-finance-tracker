// src/components/TransactionList.tsx
import { useMemo, useState } from "react";
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
  // local config: how many rows to show per month initially
  const initialPerMonth = 4;

  // filter by searchTerm (keeps your original behavior)
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

  /**
   * Group transactions by month (YYYY-MM). Each group contains:
   *  - key: "2025-08"
   *  - label: "August 2025"
   *  - items: Transaction[]
   *
   * We sort months descending (newest first) and sort items within each month by date desc.
   */
  const groupedByMonth = useMemo(() => {
    const map = new Map<string, { label: string; items: Transaction[] }>();

    filteredTransactions.forEach((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const label = d.toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      });
      if (!map.has(key)) map.set(key, { label, items: [] });
      map.get(key)!.items.push(tx);
    });

    const arr = Array.from(map.entries())
      .map(([key, v]) => ({ key, label: v.label, items: v.items }))
      .sort((a, b) => (b.key > a.key ? 1 : -1)); // newest month first

    // sort items inside each month (newest first)
    arr.forEach((g) => g.items.sort((a, b) => b.date.localeCompare(a.date)));

    return arr;
  }, [filteredTransactions]);

  // track which months are expanded (show all rows)
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(
    {}
  );

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {groupedByMonth.map((group) => {
        const isExpanded = !!expandedMonths[group.key];
        const visibleItems = isExpanded
          ? group.items
          : group.items.slice(0, initialPerMonth);

        return (
          <section
            key={group.key}
            className="bg-white rounded-lg shadow-sm p-3"
          >
            {/* Month header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-md font-semibold">{group.label}</h3>
                <p className="text-xs text-gray-500">
                  {group.items.length} transactions
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!isExpanded && group.items.length > initialPerMonth && (
                  <button
                    onClick={() => toggleMonth(group.key)}
                    className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-md shadow-sm hover:bg-blue-100 transition"
                  >
                    Load more
                  </button>
                )}

                {isExpanded && (
                  <button
                    onClick={() => toggleMonth(group.key)}
                    className="text-sm px-3 py-1 bg-gray-100 rounded-md shadow-sm hover:bg-gray-200 transition"
                  >
                    Show less
                  </button>
                )}
              </div>
            </div>

            {/* Compact table for the month */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-gray-700 text-xs font-semibold">
                  <tr>
                    <th className="text-left px-3 py-2">Description</th>
                    <th className="text-right px-3 py-2">Amount</th>
                    <th className="text-center px-3 py-2">Type</th>
                    <th className="text-center px-3 py-2">Category</th>
                    <th className="text-center px-3 py-2">Date</th>
                    <th className="text-center px-3 py-2">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {visibleItems.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        {highlightMatch(tx.description, searchTerm || "")}
                      </td>

                      <td
                        className={`px-3 py-2 text-right whitespace-nowrap ${
                          tx.type === "Income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ₹{tx.amount.toFixed(2)}
                      </td>

                      <td className="px-3 py-2 text-center">{tx.type}</td>

                      <td className="px-3 py-2 text-center">
                        {highlightMatch(tx.category, searchTerm || "")}
                      </td>

                      <td className="px-3 py-2 text-center">{tx.date}</td>

                      <td className="px-3 py-2 text-center space-x-2">
                        <button
                          onClick={() => onEdit(tx)}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(tx.id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* If collapsed and there are more items, show a small hint */}
            {!isExpanded && group.items.length > initialPerMonth && (
              <div className="mt-3 text-xs text-gray-500">
                Showing {initialPerMonth} of {group.items.length} transactions.
                Click "Load more" to expand.
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
