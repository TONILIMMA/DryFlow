// ------------------------
// App.tsx (FINAL V3)
// ------------------------
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  Home,
  Users,
  Calculator,
  Box,
  Settings,
  LogOut,
  Menu
} from "lucide-react";

import { User } from "./types";
import { storageService } from "./services/storageService";

// Components
import { Button } from "./components/Button";

// Pages
import Dashboard from "./pages/Dashboard";
import Budgets from "./pages/Budgets";
import Clients from "./pages/Clients";
import Materials from "./pages/Materials";
import Collaborators from "./pages/Collaborators";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";

// Constants
import { APP_NAME } from "./constants";

// --------------------------------
// Protected Route Wrapper
// --------------------------------
const PrivateRoute = ({ user, children }: { user: User | null, children: any }) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// --------------------------------
// Layout Principal (Menu + Conteúdo)
// --------------------------------
const MainLayout: React.FC<{
  user: User;
  onLogout: () => void;
  children: any;
}> = ({ user, onLogout, children }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">

      {/* MENU LATERAL */}
      <aside
        className={`bg-white border-r shadow-sm px-4 py-6 transition-all duration-300
        ${open ? "w-64" : "w-20"}`}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className={`font-bold text-xl transition-all ${open ? "opacity-100" : "opacity-0"}`}>
            {APP_NAME}
          </h1>

          <button onClick={() => setOpen(o => !o)}>
            <Menu size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-3">

          <MenuItem icon={<Home />} label="Dashboard" to="/" open={open} />
          <MenuItem icon={<Calculator />} label="Orçamentos" to="/budgets" open={open} />
          <MenuItem icon={<Users />} label="Clientes" to="/clients" open={open} />
          <MenuItem icon={<Box />} label="Materiais" to="/materials" open={open} />
          <MenuItem icon={<Users />} label="Equipe" to="/collaborators" open={open} />

          <div className="mt-6 pt-6 border-t">
            <MenuItem icon={<Settings />} label="Configurações" to="/settings" open={open} />
          </div>

          <Button
            onClick={onLogout}
            className="mt-8 flex gap-2 bg-red-500 hover:bg-red-600 text-white"
          >
            <LogOut size={18} /> {open && "Sair"}
          </Button>

        </nav>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

// --------------------------------
// Item do Menu
// --------------------------------
const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  to: string;
  open: boolean;
}> = ({ icon, label, to, open }) => {
  return (
    <a
      href={to}
      className="flex items-center gap-3 text-gray-700 hover:text-black hover:bg-gray-200 p-2 rounded-lg"
    >
      {icon}
      {open && <span>{label}</span>}
    </a>
  );
};

// --------------------------------
// APP PRINCIPAL
// --------------------------------
const App = () => {
  const [user, setUser] = useState<User | null>(null);

  // Carregar usuário salvo
  useEffect(() => {
    const u = storageService.getCurrentUser();
    if (u) setUser(u);
  }, []);

  const handleLogout = () => {
    storageService.clearSession();
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" /> : <LoginPage onLogin={setUser} />
          }
        />

        {/* ÁREA PROTEGIDA */}
        <Route
          path="/"
          element={
            <PrivateRoute user={user}>
              <MainLayout user={user!} onLogout={handleLogout}>
                <Dashboard />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/budgets"
          element={
            <PrivateRoute user={user}>
              <MainLayout user={user!} onLogout={handleLogout}>
                <Budgets />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <PrivateRoute user={user}>
              <MainLayout user={user!} onLogout={handleLogout}>
                <Clients />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/materials"
          element={
            <PrivateRoute user={user}>
              <MainLayout user={user!} onLogout={handleLogout}>
                <Materials />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/collaborators"
          element={
            <PrivateRoute user={user}>
              <MainLayout user={user!} onLogout={handleLogout}>
                <Collaborators />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute user={user}>
              <MainLayout user={user!} onLogout={handleLogout}>
                <SettingsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;