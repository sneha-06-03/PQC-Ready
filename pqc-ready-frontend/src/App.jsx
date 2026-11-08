
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AssetInventory from "./pages/AssetInventory";
import MigrationPlan from "./pages/MigrationPlan";
import SecureChat from "./pages/SecureChat";
import Benchmarks from "./pages/Benchmarks";
import Reports from "./pages/Reports";

function App() {
  const location = useLocation();

  // Display Login without dashboard navigation
  if (location.pathname === "/login") {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar />

      <div className="flex-1 min-w-0">
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<AssetInventory />} />
            <Route path="/migration" element={<MigrationPlan />} />
            <Route path="/secure-chat" element={<SecureChat />} />
            <Route path="/benchmark" element={<Benchmarks />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
