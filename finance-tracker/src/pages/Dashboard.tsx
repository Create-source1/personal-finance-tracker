// src/pages/Dashboard.tsx
import DatePicker from "react-datepicker";
import { useState, useRef, useEffect, useMemo } from "react"; // added useEffect/useMemo (used later)
import { useAuth } from "../hooks/useAuth";
import { useTransactions } from "../hooks/useTransactions";
import type { Transaction, TransactionForm } from "../types/Transaction";
import TransactionList from "../components/TransactionList";
import BalanceSummary from "../components/BalanceSummary";
import BalanceDonutChart from "../components/BalanceDonutChart";
import useDebounce from "../hooks/useDebounce";
import CategoryPieChart from "../components/CategoryPieChart";
import { useSwipeable } from "react-swipeable";
// import ThemeToggle from "../components/ThemeToggle";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [editingId, setEditingId] = useState<Transaction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loading: txLoading,
    error,
  } = useTransactions(user);

  // --- Form state (unchanged) ---
  const [form, setForm] = useState<Omit<TransactionForm, "id">>({
    description: "",
    amount: 0,
    type: "Expense",
    category: "",
    date: new Date().toISOString().split("T")[0], // default to today
  });

  // --- Filter & Sort State (existing) ---
  const [typeFilter, setTypeFilter] = useState<"All" | "Income" | "Expense">(
    "All"
  );
  // kept for compatibility
  // const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // No-limit range (react-datepicker uses undefined)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const [sortBy, setSortBy] = useState<
    "date-desc" | "date-asc" | "amount-desc" | "amount-asc"
  >("date-desc");

  // --- Derived categories from transactions (memoized) ---
  const allCategories = useMemo(
    () => Array.from(new Set(transactions.map((tx) => tx.category))),
    [transactions]
  );

  // --- NEW: multi-select categories state for v3 ---
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    allCategories.length ? allCategories : []
  );

  // Keep selectedCategories in sync when categories change
  useEffect(() => {
    const cats = Array.from(new Set(transactions.map((tx) => tx.category)));
    setSelectedCategories((prev) => {
      if (prev.length === 0) return cats;
      const filtered = prev.filter((c) => cats.includes(c));
      return filtered.length > 0 ? filtered : cats;
    });
  }, [transactions]);

  // helper toggles for the category checklist
  const toggleCategorySelection = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  const selectAllCategories = () => setSelectedCategories(allCategories);
  const clearAllCategories = () => setSelectedCategories([]);

  // --- Condensed dropdown UI state ---
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Filter + Sort Logic (updated to respect selectedCategories) ---
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchType = typeFilter === "All" || tx.type === typeFilter;
        const matchCategory =
          selectedCategories.length === 0
            ? false
            : selectedCategories.includes(tx.category);

        let matchDate = true;
        if (startDate) matchDate = new Date(tx.date) >= startDate;
        if (endDate)
          matchDate =
            matchDate &&
            new Date(tx.date) <=
              new Date(endDate.getTime() + 24 * 60 * 60 * 1000);

        return matchType && matchCategory && matchDate;
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
  }, [
    transactions,
    typeFilter,
    selectedCategories,
    startDate,
    endDate,
    sortBy,
  ]);

  const handleClearRange = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // --- Search logic + debouncing ---
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchedTransactions = filteredTransactions.filter((tx) =>
    (tx.description + tx.category)
      .toLowerCase()
      .includes(debouncedSearchTerm.toLowerCase())
  );

  // --- Form handlers (unchanged) ---
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
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  // --- MONTH NAVIGATION (swipeable) ---
  const months = useMemo(() => {
    const map = new Map<
      string,
      { label: string; transactions: Transaction[] }
    >();
    filteredTransactions.forEach((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const label = d.toLocaleString(undefined, {
        month: "short",
        year: "numeric",
      });
      if (!map.has(key)) map.set(key, { label, transactions: [] });
      map.get(key)!.transactions.push(tx);
    });

    return Array.from(map.entries())
      .sort((a, b) => (b[0] > a[0] ? 1 : -1))
      .map(([key, { label, transactions }]) => ({ key, label, transactions }));
  }, [filteredTransactions]);

  // monthIndex: -1 => All time; 0 => newest month
  const [monthIndex, setMonthIndex] = useState<number>(-1);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setMonthIndex((prev) => {
        const max = months.length - 1;
        return prev < max ? prev + 1 : prev;
      });
    },
    onSwipedRight: () => {
      setMonthIndex((prev) => (prev > -1 ? prev - 1 : -1));
    },
    trackMouse: true,
  });

  const transactionsForSummary =
    monthIndex === -1
      ? filteredTransactions
      : months[monthIndex]?.transactions ?? [];

  const incomeForSummary = transactionsForSummary
    .filter((tx) => tx.type === "Income")
    .reduce((s, tx) => s + tx.amount, 0);
  const expenseForSummary = transactionsForSummary
    .filter((tx) => tx.type === "Expense")
    .reduce((s, tx) => s + tx.amount, 0);
  const balanceForSummary = incomeForSummary - expenseForSummary;

  return (
    <div
      {...handlers}
      className="min-h-screen bg-gray-100 p-4 sm:p-8 bg-gradient-to-br from-blue-400 via-purple-300 to-pink-300"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.email} !
          </h1>
        </div>

        {/* <ThemeToggle/> */}
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          Logout
        </button>

        {/* --- Balance Summary + DonutChart (month-aware) --- */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 relative mt-4 sm:mt-6">
          {/* Top-right month controls inside the card */}
          <div
            className="
      absolute top-4 left-1/2 transform -translate-x-1/2
      md:left-auto md:right-4 md:translate-x-0
      flex items-center gap-3 z-20
    "
            role="group"
            aria-label="Month navigation"
          >
            {/* Previous button */}
            <button
              onClick={() => setMonthIndex((prev) => Math.max(prev - 1, -1))}
              className={`p-2 rounded-full shadow-sm border bg-white hover:shadow-md transition-transform transform hover:-translate-y-0.5 flex items-center justify-center
        ${
          monthIndex === -1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
        }
      `}
              aria-label="Previous month"
              aria-disabled={monthIndex === -1}
              title={
                monthIndex === -1
                  ? "No earlier selection"
                  : "Previous (All time / newer)"
              }
            >
              <svg
                className="w-4 h-4 text-gray-700"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 15.707a1 1 0 01-1.414 0L5.172 10l5.707-5.707a1 1 0 011.414 1.414L8.414 10l3.879 3.879a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Month label: bold, pill-style for emphasis */}
            <div className="px-4 py-2 rounded-full bg-gray-50 border border-gray-200 shadow-inner min-w-[120px] md:min-w-[150px] text-center">
              <div className="text-sm md:text-base font-semibold text-gray-800 tracking-wide">
                {monthIndex === -1
                  ? "All time"
                  : months[monthIndex]?.label ?? "No data"}
              </div>
            </div>

            {/* Next button */}
            <button
              onClick={() =>
                setMonthIndex((prev) => Math.min(prev + 1, months.length - 1))
              }
              className={`p-2 rounded-full shadow-sm border bg-white hover:shadow-md transition-transform transform hover:-translate-y-0.5 flex items-center justify-center
    ${
      months.length === 0 || monthIndex === months.length - 1
        ? "opacity-40 cursor-not-allowed"
        : "cursor-pointer"
    }
  `}
              aria-label="Next month"
              aria-disabled={
                months.length === 0 || monthIndex === months.length - 1
              }
              title={
                months.length === 0 || monthIndex === months.length - 1
                  ? "No later month"
                  : "Next (older months)"
              }
            >
              <svg
                className="w-4 h-4 text-gray-700"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.707 4.293a1 1 0 010 1.414L12.586 10l-4.879 4.293a1 1 0 001.414 1.414L14.707 10.707a1 1 0 000-1.414L9.121 4.293a1 1 0 00-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Main content of the card (kept as before) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-10 mt-12 sm:mt-4">
            <BalanceSummary transactions={transactionsForSummary} />
            <BalanceDonutChart
              income={incomeForSummary}
              expense={expenseForSummary}
              balance={balanceForSummary}
            />
          </div>
        </div>

        {/* --- Category Pie Chart (respects selectedCategories + date range) --- */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Category Breakdown 📊</h2>
          <CategoryPieChart
            filteredTransactions={filteredTransactions}
            othersThresholdPercent={6}
          />
        </div>

        {/* --- Add Transaction Form (unchanged) --- */}
        <div
          ref={formRef}
          className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto"
        >
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Transaction" : "➕ Add Transaction"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="description"
              type="text"
              placeholder="Description"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
              value={form.description}
              onChange={handleChange}
              required
            />
            <input
              name="amount"
              type="number"
              step="0.01"
              placeholder="Amount"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
              value={form.amount}
              onChange={handleChange}
              required
            />
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
            >
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
            <input
              name="category"
              type="text"
              placeholder="Category: Food/Rent/Utilities/Freelance"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
              value={form.category}
              onChange={handleChange}
              required
            />
            <input
              name="date"
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
              value={form.date}
              onChange={handleChange}
            />
            {formError && <p className="text-red-600 text-sm">{formError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full cursor-pointer text-sm sm:text-base"
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

        {/* --- Filtering and Sorting (styled, logic unchanged) --- */}
        <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-2">📂 Filter & 🔽 Sort</h2>

          {/* container uses flex-wrap so items remain compact on mobile */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* ----- Type Filter Dropdown (compact, modern) ----- */}
            <div className="relative w-fit min-w-[140px] sm:min-w-[160px]">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-9 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                aria-label="Type filter"
              >
                <option value="All">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>

              {/* Consistent SVG chevron (absolute inside) */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" />
                </svg>
              </span>
            </div>

            {/* ----- Category Multi-select (condensed dropdown button) ----- */}
            <div className="relative w-fit">
              <button
                onClick={() => setShowCategoryDropdown((s) => !s)}
                className="flex items-center gap-2 border border-gray-200 bg-white rounded-lg px-3 py-2 min-w-[150px] shadow-sm hover:shadow-md transition text-sm"
                aria-haspopup="true"
                aria-expanded={showCategoryDropdown}
              >
                <span className="truncate">
                  {selectedCategories.length === allCategories.length ||
                  allCategories.length === 0
                    ? "All Categories"
                    : `${selectedCategories.length} selected`}
                </span>

                {/* matching chevron */}
                <svg
                  className="w-4 h-4 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" />
                </svg>
              </button>

              {showCategoryDropdown && (
                <div className="absolute z-30 mt-2 w-72 max-h-64 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => selectAllCategories()}
                      className="text-sm px-3 py-1 bg-gray-100 rounded-md"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => clearAllCategories()}
                      className="text-sm px-3 py-1 bg-gray-100 rounded-md"
                    >
                      Clear
                    </button>
                    <div className="ml-auto text-xs text-gray-500">
                      {allCategories.length} total
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    {allCategories.map((cat) => {
                      const checked = selectedCategories.includes(cat);
                      return (
                        <label
                          key={cat}
                          className="flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCategorySelection(cat)}
                            className="form-checkbox h-4 w-4"
                          />
                          <span className="truncate">{cat}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ----- Date range pickers: compact consistent styling ----- */}
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">From:</span>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date ?? undefined)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={new Date()}
                  placeholderText="Start date"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">To:</span>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date ?? undefined)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  placeholderText="End date"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={handleClearRange}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-3 py-2 rounded-md transition cursor-pointer"
                >
                  Clear Range
                </button>
              )}
            </div>

            {/* ----- Sort dropdown (compact, reuses same arrow style) ----- */}
            <div className="relative w-fit min-w-[160px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-9 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Amount: High to Low</option>
                <option value="amount-asc">Amount: Low to High</option>
              </select>

              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* --- Showing total banner (no category names shown; shows count instead) --- */}
        {(selectedCategories.length !== allCategories.length ||
          startDate ||
          endDate) && (
          <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-blue-200 rounded-xl shadow-sm text-gray-800 text-sm sm:text-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 transition-all">
            <div>
              <span className="font-medium">Showing total</span>
              {/* show only number of selected categories (not names) */}
              {selectedCategories.length !== allCategories.length && (
                <>
                  {" "}
                  for{" "}
                  <span className="font-semibold text-purple-700">
                    {selectedCategories.length} categories
                  </span>
                </>
              )}
              {startDate && endDate && (
                <>
                  {" "}
                  from{" "}
                  <span className="text-gray-600 font-medium">
                    {startDate.toLocaleDateString()} -{" "}
                    {endDate.toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
            <div className="text-lg sm:text-xl font-bold text-blue-800 bg-blue-100 px-3 py-1.5 rounded-lg shadow-inner">
              ₹
              {filteredTransactions
                .reduce((sum, tx) => sum + tx.amount, 0)
                .toFixed(2)}
            </div>
          </div>
        )}

        {/* --- Transaction Table (unchanged except it receives searchedTransactions) --- */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mx-auto overflow-x-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-xl font-semibold">Transactions 📝</h2>
            {/* Search box */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {txLoading ? (
            <p>Loading transactions...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <TransactionList
              transactions={searchedTransactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchTerm={debouncedSearchTerm}
            />
          )}
        </div>
      </div>
    </div>
  );
}
