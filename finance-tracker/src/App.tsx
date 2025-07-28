// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...⌛</p>;

  return (
    <Routes>
      <Route path="/" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;
