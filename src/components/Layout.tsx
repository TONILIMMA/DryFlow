import React from "react";
import { Link } from "react-router-dom";

const LayoutComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow p-4 flex gap-4">
        <Link to="/" className="font-semibold">Home</Link>
        <Link to="/calculator">Calculadora</Link>
        <Link to="/users">Clientes</Link>
        <Link to="/trash">Lixeira</Link>
      </header>

      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default LayoutComponent;
