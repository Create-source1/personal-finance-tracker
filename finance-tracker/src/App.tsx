// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-3xl font-semibold">Loading...⌛</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Dashboard /> : <Navigate to="/auth" />}
      />
      <Route
        path="/auth"
        element={!user ? <AuthPage /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

export default App;
