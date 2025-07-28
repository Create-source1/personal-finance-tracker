// src/pages/Dashboard.tsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTransactions } from "../hooks/useTransactions";
import type { Transaction } from "../types/Transaction";
import TransactionList from "../components/TransactionList";
import BalanceSummary from "../components/BalanceSummary";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const {
    transactions,
    addTransaction,
    loading: txLoading,
    error,
  } = useTransactions(user);

  const [form, setForm] = useState<Omit<Transaction, "id">>({
    description: "",
    amount: 0,
    type: "Expense",
    category: "",
    date: new Date().toISOString().split("T")[0], // default to today
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // 🧠 Filter & Sort State
  const [typeFilter, setTypeFilter] = useState<"All" | "Income" | "Expense">(
    "All"
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<
    "date-desc" | "date-asc" | "amount-desc" | "amount-asc"
  >("date-desc");

  // 🧮 Categories derived from existing data
  const allCategories = Array.from(
    new Set(transactions.map((tx) => tx.category))
  );

  // 🧠 Filter + Sort Logic
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

    // Basic validation
    if (!form.description || form.amount <= 0 || !form.category) {
      setFormError("Please fill out all fields correctly.");
      return;
    }

    setSubmitting(true);
    try {
      await addTransaction(form);
      setForm({
        description: "",
        amount: 0,
        type: "Expense",
        category: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      console.error(err);
      setFormError("Failed to add transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={logout}>Logout</button>

      <BalanceSummary transactions={transactions} />

      <h2 style={{ marginTop: 30 }}>Add Transaction</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <input
          name="description"
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="amount"
          type="number"
          step="0.01"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />
        <br />
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
        <br />
        <input
          name="category"
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
        />
        <br />
        {formError && <p style={{ color: "red" }}>{formError}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Transaction"}
        </button>
      </form>

    {/* Filtering and Sorting */}
      <h2 style={{ marginTop: 40 }}>📂 Filter & 🔽 Sort </h2>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
        >
          <option value="All">All Types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
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
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Amount: High to Low</option>
          <option value="amount-asc">Amount: Low to High</option>
        </select>
      </div>

      {/* <h2 style={{ marginTop: 40 }}>Transactions</h2>
      {txLoading ? (
        <p>Loading transactions...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <ul>
          {transactions.map((tx) => (
            <li key={tx.id}>
              <strong>{tx.description}</strong> - {tx.amount} ({tx.type}) [
              {tx.category}] on {tx.date}
            </li>
          ))}
        </ul>
      )} */}
      <h2 style={{ marginTop: 40 }}>Transactions</h2>
      {txLoading ? (
        <p>Loading transactions...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <TransactionList transactions={filteredTransactions} />
      )}
    </div>
  );
}
