import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="bg-gray-200 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-100 px-3 py-1 rounded cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition"
    >
      {darkMode ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
