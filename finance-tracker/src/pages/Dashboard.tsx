// src/pages/Dashboard.tsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTransactions } from "../hooks/useTransactions";
import type { Transaction, TransactionForm } from "../types/Transaction";
import TransactionList from "../components/TransactionList";
import BalanceSummary from "../components/BalanceSummary";
import BalanceDonutChart from "../components/BalanceDonutChart";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [editingId, setEditingId] = useState<Transaction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loading: txLoading,
    error,
  } = useTransactions(user);

  //   For BalanceDonutChart
  const income = transactions
    .filter((tx) => tx.type === "Income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expense = transactions
    .filter((tx) => tx.type === "Expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = income - expense;
  //

  const [form, setForm] = useState<Omit<TransactionForm, "id">>({
    description: "",
    amount: 0,
    type: "Expense",
    category: "",
    date: new Date().toISOString().split("T")[0], // default to today
  });

  // Filter & Sort State
  const [typeFilter, setTypeFilter] = useState<"All" | "Income" | "Expense">(
    "All"
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<
    "date-desc" | "date-asc" | "amount-desc" | "amount-asc"
  >("date-desc");

  // Categories derived from existing data
  const allCategories = Array.from(
    new Set(transactions.map((tx) => tx.category))
  );

  // Filter + Sort Logic
  const filteredTransactions = transactions
    .filter((tx) => {
      const matchType = typeFilter === "All" || tx.type === typeFilter;
      const matchCategory =
        categoryFilter === "All" || tx.category === categoryFilter;
      return matchType && matchCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return b.date.localeCompare(a.date);
        case "date-asc":
          return a.date.localeCompare(b.date);
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // // Basic validation
    // if (!form.description || form.amount <= 0 || !form.category) {
    //   setFormError("Please fill out all fields correctly.");
    //   return;
    // }

    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateTransaction(editingId.id, form);
        setEditingId(null); // exit edit mode
      } else {
        await addTransaction(form);
      }

      setForm({
        description: "",
        amount: 0,
        type: "Expense",
        category: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      console.error(err);
      setFormError("Transaction failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for validation
  const validateForm = (): string | null => {
    if (!form.description.trim()) return "Description is required.";
    if (!form.amount || form.amount <= 0)
      return "Amount must be greater than zero.";
    if (!form.category.trim()) return "Category is required.";
    if (!form.date || isNaN(new Date(form.date).getTime()))
      return "Invalid date.";

    return null; // All good
  };

  const handleEdit = (tx: Transaction) => {
    setForm({
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      date: tx.date,
    });
    setEditingId(tx);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );
    if (confirmed) {
      try {
        await deleteTransaction(id);
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.email}
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          Logout
        </button>

        {/* Balance Summary + DonutChart */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <BalanceSummary transactions={transactions} />
          <BalanceDonutChart
            income={income}
            expense={expense}
            balance={balance}
          />
        </div>
        {/* Add Transaction Form */}
        <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Transaction" : "➕ Add Transaction"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="description"
              type="text"
              placeholder="Description"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={form.description}
              onChange={handleChange}
              required
            />
            <input
              name="amount"
              type="number"
              step="0.01"
              placeholder="Amount"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={form.amount}
              onChange={handleChange}
              required
            />
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
            <input
              name="category"
              type="text"
              placeholder="Category: Food/Rent/Utilities/Freelance"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={form.category}
              onChange={handleChange}
              required
            />
            <input
              name="date"
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={form.date}
              onChange={handleChange}
            />
            {formError && <p className="text-red-600 text-sm">{formError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full cursor-pointer"
            >
              {submitting
                ? "Adding..."
                : editingId
                ? "Update Transaction"
                : "Add Transaction"}
            </button>
          </form>
          {editingId && (
              <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({
                  description: "",
                  amount: 0,
                  type: "Expense",
                  category: "",
                  date: new Date().toISOString().split("T")[0],
                });
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm px-4 py-2 rounded cursor-pointer"
            >
              Cancel Edit
            </button>
              </div>
          )}
        </div>

        {/* Filtering and Sorting */}
        <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
          <h2 className="text-xl font-semibold mb-2">📂 Filter & 🔽 Sort</h2>
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="border border-gray-300 rounded px-3 py-2 cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded px-3 py-2 cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-lg shadow p-6 mx-auto">
          <h2 className="text-xl font-semibold mb-2">Transactions 📝</h2>
          {txLoading ? (
            <p>Loading transactions...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
