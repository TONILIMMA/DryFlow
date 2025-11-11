

import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { View, Client, Service, ServiceType, Material, Collaborator, Budget, BudgetStatus, Project, ProjectStatus, CompanyInfo, Transaction, TransactionType, User, AppContextType } from './types';
import { globalStyles } from './GlobalStyles';

// MOCK DATA V4
const initialClients: Client[] = [
  { id: 'cli1', name: 'Construtora Alfa', idNumber: '12.345.678/0001-90', contact: '5511987654321', address: 'Av. Paulista, 1000' },
  { id: 'cli2', name: 'João da Silva', idNumber: '123.456.789-00', contact: '5521912345678', address: 'Rua das Flores, 50' },
];

const initialServices: Service[] = [
    { id: 'srv1', name: 'Parede Drywall Padrão', serviceType: ServiceType.ParedeSimples, laborCostPerSqM: 50, plateCoefficient: 0.46, profileCoefficient: 1.8, screwCoefficient: 15 },
    { id: 'srv2', name: 'Forro Drywall Acústico', serviceType: ServiceType.ForroDuplo, laborCostPerSqM: 95, plateCoefficient: 0.93, profileCoefficient: 2.5, screwCoefficient: 30 },
];

const initialBudgets: Budget[] = [
  { id: 'bud1', clientId: 'cli1', serviceId: 'srv1', areaInSqM: 100, status: BudgetStatus.Approved, createdAt: new Date(2023, 10, 15), totalLaborCost: 5000, calculatedMaterials: { plates: 46, profiles: 180, screws: 1500 } },
  { id: 'bud2', clientId: 'cli2', serviceId: 'srv2', areaInSqM: 50, status: BudgetStatus.Pending, createdAt: new Date(), totalLaborCost: 4750, calculatedMaterials: { plates: 46.5, profiles: 125, screws: 1500 } },
];

const initialProjects: Project[] = [
  { id: 'proj1', budgetId: 'bud1', name: 'Escritório Alfa', status: ProjectStatus.InProgress, startDate: new Date(new Date().setDate(new Date().getDate() + 5)), beforePhotos: ['/img_placeholder.png'], afterPhotos: [], allocatedCollaborators: [{collaboratorId: 'col1', daysWorked: 10}], realLaborCost: 1500 },
  { id: 'proj2', budgetId: 'bud2', name: 'Apartamento Silva', status: ProjectStatus.Scheduled, startDate: new Date(new Date().setDate(new Date().getDate() + 1)), beforePhotos: [], afterPhotos: [], allocatedCollaborators: [], realLaborCost: 0 },
];

const initialCollaborators: Collaborator[] = [
    { id: 'col1', name: 'Carlos Pereira', contact: '5511999998888', dailyRate: 150 },
    { id: 'col2', name: 'Mariana Costa', contact: '5511977776666', dailyRate: 180 },
];

const initialTransactions: Transaction[] = [
    {id: 'trn1', type: TransactionType.Revenue, description: 'Sinal Projeto Escritório Alfa', amount: 2500, date: new Date(2023, 11, 1), projectId: 'proj1'},
    {id: 'trn2', type: TransactionType.Expense, description: 'Compra de Placas ST', amount: 2450, date: new Date(2023, 11, 2)},
];

// Component to inject global styles
const GlobalStyles = () => <style>{globalStyles}</style>;


// THEME CONTEXT
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};


// APP CONTEXT
const AppContext = createContext<AppContextType | undefined>(undefined);
const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppContext must be used within an AppProvider");
    return context;
};


// HELPER COMPONENTS
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-surface-light dark:bg-surface-dark p-4 sm:p-6 rounded-xl shadow-md transition-colors ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{ onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; children: React.ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'success', className?: string; type?: 'button' | 'submit', disabled?: boolean }> = ({ onClick, children, variant = 'primary', className = '', type = 'button', disabled = false }) => {
    const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background-dark disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
        primary: 'bg-primary-DEFAULT hover:bg-primary-dark text-white focus:ring-primary-DEFAULT',
        secondary: 'bg-secondary hover:bg-secondary/90 text-white focus:ring-secondary',
        success: 'bg-success hover:bg-success/90 text-white focus:ring-success',
        ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-text-primary-light dark:text-text-primary-dark focus:ring-primary-DEFAULT'
    };
    return <button type={type} onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`} disabled={disabled}>{children}</button>;
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode, size?: 'md' | 'lg' | 'sm' | 'xl' }> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-surface-light dark:bg-surface-dark rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-surface-light dark:bg-surface-dark z-10">
          <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{title}</h3>
          <button onClick={onClose} className="text-text-secondary-light dark:text-text-secondary-dark hover:text-red-500">
            <XIcon />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">{label}</label>
        <input id={id} {...props} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT dark:text-text-primary-dark" />
    </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, children: React.ReactNode }> = ({ label, id, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">{label}</label>
        <select id={id} {...props} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT dark:text-text-primary-dark">
            {children}
        </select>
    </div>
);


// ICONS
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const WrenchScrewdriverIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.472-2.472a3.375 3.375 0 00-4.773-4.773L6.75 11.42m5.877 5.877l-5.877-5.877m0 0a3.375 3.375 0 01-4.773-4.773l2.472-2.472" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.67c.12-.14.237-.285.35-.437m7.533 2.493l-4.121-.952A4.125 4.125 0 0015 11.625V15" /></svg>;
const CircleDollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.95-.754 2.214-.754 3.164 0a4.5 4.5 0 016 6.364m-12 .364A4.5 4.5 0 006 13.5 4.5 4.5 0 001.5 9c0-1.785 1.02-3.32 2.474-4.067" /></svg>;
const Cog6ToothIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 0115 0m-15 0V9m15 3v3m0 0a7.5 7.5 0 01-15 0m15 0v-3m0 0a7.5 7.5 0 00-15 0m15 0h-1.5" /></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.95-4.243l-1.591 1.591M5.25 12H3m4.243-4.95l-1.591-1.591M12 12a6 6 0 100-12 6 6 0 000 12z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>;
const DocumentPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;
const ExclamationTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ArrowUpRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 015.25 0m-5.25 0a3.75 3.75 0 00-5.25 0M3 13.5a3 3 0 116 0v-1.5a3 3 0 00-6 0v1.5zm10.5-11.25h.008v.008h-.008V2.25zm.008 7.5h.008v.008h-.008V9.75z" /></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>;
const GoogleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.657-3.657-11.303-8.591l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C43.021 36.258 46 30.686 46 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>;
const CalendarDaysIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" /></svg>;
const Bars3Icon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-1.65 5.25h16.5" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M16.6,14.2c-0.2-0.1-1.3-0.6-1.5-0.7c-0.2-0.1-0.4-0.1-0.5,0.1c-0.2,0.2-0.5,0.7-0.6,0.8c-0.1,0.1-0.2,0.2-0.4,0.1c-0.2-0.1-0.8-0.3-1.5-0.9c-0.6-0.5-1-1.1-1.1-1.3C11,12.1,11,12,11,11.9c0-0.1,0.1-0.2,0.2-0.3c0.1-0.1,0.2-0.2,0.3-0.4c0.1-0.1,0.1-0.2,0.2-0.4c0-0.1,0-0.3-0.1-0.4c-0.1-0.1-0.5-1.3-0.7-1.8C9.5,7.3,9.3,7.3,9.1,7.3c-0.2,0-0.4,0-0.5,0c-0.2,0-0.4,0.1-0.6,0.3c-0.2,0.2-0.8,0.8-0.8,1.9c0,1.1,0.8,2.2,0.9,2.4c0.1,0.2,1.6,2.5,4,3.5c0.6,0.2,1.1,0.4,1.4,0.5c0.5,0.1,1,0.1,1.3,0c0.4-0.1,1.3-0.6,1.5-1.1c0.2-0.5,0.2-1,0.1-1.1C17,14.3,16.8,14.2,16.6,14.2z M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10c5.5,0,10-4.5,10-10S17.5,2,12,2z M12,21.5c-5.2,0-9.5-4.2-9.5-9.5c0-5.2,4.2-9.5,9.5-9.5c5.2,0,9.5,4.2,9.5,9.5C21.5,17.2,17.2,21.5,12,21.5z"></path></svg>;

// PAGE COMPONENTS

const Painel: React.FC = () => {
    const { budgets, projects, getView, openNewBudgetModal, openNewClientModal } = useAppContext();

    const pendingBudgets = budgets.filter(b => b.status === BudgetStatus.Pending).length;
    const approvedThisMonth = budgets.filter(b => b.status === BudgetStatus.Approved && new Date(b.createdAt).getMonth() === new Date().getMonth()).length;
    const activeProjects = projects.filter(p => p.status === ProjectStatus.InProgress).length;
    const financialAlerts = 3; // Mocked

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">Painel</h1>
                 <div className="flex items-center gap-2 sm:gap-4">
                    <Button onClick={openNewBudgetModal} variant="secondary"><DocumentPlusIcon /> Novo Orçamento</Button>
                    <Button onClick={openNewClientModal} variant="success"><UserPlusIcon /> Novo Cliente</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <Card>
                    <h2 className="text-lg font-semibold text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2"><FileTextIcon /> Orçamentos</h2>
                    <p className="mt-4 text-4xl font-bold text-text-primary-light dark:text-text-primary-dark">{pendingBudgets}</p>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">Pendentes</p>
                    <p className="mt-2 text-2xl font-semibold text-green-600 dark:text-green-400">{approvedThisMonth}</p>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Aprovados este mês</p>
                </Card>
                 <Card>
                    <h2 className="text-lg font-semibold text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2"><WrenchScrewdriverIcon /> Projetos em Execução</h2>
                    <p className="mt-4 text-4xl font-bold text-text-primary-light dark:text-text-primary-dark">{activeProjects}</p>
                    <a href="#" onClick={(e) => { e.preventDefault(); getView('projects')(); }} className="mt-4 text-secondary dark:text-accent-dark font-semibold inline-flex items-center gap-1">Ver Projetos <ArrowUpRightIcon /></a>
                </Card>
                <ProjectScheduleCard />
                 <Card>
                    <h2 className="text-lg font-semibold text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2"><ExclamationTriangleIcon className="text-amber-500 dark:text-amber-400" /> Alertas Financeiros</h2>
                    <p className="mt-4 text-4xl font-bold text-amber-500 dark:text-amber-400">{financialAlerts}</p>
                     <p className="text-text-secondary-light dark:text-text-secondary-dark mt-4 text-sm">Pagamentos vencidos/próximos</p>
                </Card>
            </div>
        </div>
    );
};

const ProjectScheduleCard: React.FC = () => {
    const { projects } = useAppContext();
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);
    
    const upcomingProjects = useMemo(() => {
        return projects
            .filter(p => p.status !== ProjectStatus.Completed && new Date(p.startDate) >= today && new Date(p.startDate) <= next7Days)
            .sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [projects]);

    const isStartingSoon = (startDate: Date) => {
        const diffHours = (new Date(startDate).getTime() - today.getTime()) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours <= 24;
    };

    return (
         <Card className="col-span-1 md:col-span-2">
            <h2 className="text-lg font-semibold text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-2"><CalendarDaysIcon /> Agenda da Semana</h2>
            <div className="mt-4 space-y-3">
                {upcomingProjects.length === 0 ? (
                    <div className="text-center py-8">
                        <CalendarDaysIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">Nenhum projeto agendado para os próximos 7 dias.</p>
                    </div>
                ) : (
                    upcomingProjects.slice(0, 4).map(p => (
                        <div key={p.id} className={`p-3 rounded-lg flex items-center gap-4 ${isStartingSoon(p.startDate) ? 'bg-yellow-100 dark:bg-yellow-900/50 ring-2 ring-yellow-400' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            <div className="flex-shrink-0 text-center">
                                <p className="font-bold text-primary-DEFAULT dark:text-white text-lg">{new Date(p.startDate).getDate()}</p>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase">{new Date(p.startDate).toLocaleString('default', { month: 'short' })}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">{p.name}</p>
                                <p className={`text-xs font-medium ${p.status === ProjectStatus.Scheduled ? 'text-blue-500 dark:text-blue-400' : 'text-yellow-500 dark:text-yellow-400'}`}>{p.status}</p>
                                {isStartingSoon(p.startDate) && <p className="mt-1 text-xs font-bold text-yellow-800 dark:text-yellow-300">Inicia em menos de 24h!</p>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    )
}

const Budgets: React.FC = () => {
    const { budgets, clients, companyInfo, setBudgets, setProjects, projects, services } = useAppContext();
    const getClient = (clientId: string) => clients.find(c => c.id === clientId);
    const getService = (serviceId: string) => services.find(s => s.id === serviceId);
    
    const statusColor = {
        [BudgetStatus.Approved]: 'bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300',
        [BudgetStatus.Pending]: 'bg-yellow-100 dark:bg-yellow-800/50 text-yellow-700 dark:text-yellow-300',
        [BudgetStatus.Rejected]: 'bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-300',
    };

    const handleApprove = (budgetId: string) => {
        setBudgets(prev => prev.map(b => b.id === budgetId ? { ...b, status: BudgetStatus.Approved } : b));
    };

    const handleCreateProject = (budget: Budget) => {
        const clientName = getClient(budget.clientId)?.name || 'Cliente';
        const newProject: Project = {
            id: `proj_${Date.now()}`,
            budgetId: budget.id,
            name: `Projeto ${clientName}`,
            status: ProjectStatus.Scheduled,
            startDate: new Date(),
            beforePhotos: [],
            afterPhotos: [],
            allocatedCollaborators: [],
            realLaborCost: 0
        };
        setProjects(prev => [...prev, newProject]);
        alert(`Projeto "${newProject.name}" criado! Agende o início na tela de Projetos.`);
    }

    const generateBudgetPDF = (budget: Budget) => {
        const client = getClient(budget.clientId);
        const service = getService(budget.serviceId);
        let pdfContent = `
            ${companyInfo.logo ? `[LOGO DA EMPRESA AQUI]\n` : ''}
            **Orçamento - ${companyInfo.name}**\n
            ${companyInfo.address} | ${companyInfo.contact}\n
            -------------------------------------\n
            **Cliente:** ${client?.name}\n
            **Data:** ${new Date(budget.createdAt).toLocaleDateString()}\n
            -------------------------------------\n
            **Serviço:** ${service?.name} (${budget.areaInSqM} m²)\n
            **Valor M.O.: R$ ${budget.totalLaborCost.toFixed(2)}**\n
            -------------------------------------\n
            **Material Estimado:**\n
            - Placas: ${budget.calculatedMaterials.plates.toFixed(1)} un\n
            - Perfis: ${budget.calculatedMaterials.profiles.toFixed(1)} m\n
            - Parafusos: ${budget.calculatedMaterials.screws.toFixed(0)} un\n
            -------------------------------------\n
            **Status: ${budget.status}**
        `;
        alert("Simulando Geração de PDF:\n" + pdfContent.replace(/^\s+/gm, ''));
    }
    
    const handleShareWhatsApp = (budget: Budget) => {
        const client = getClient(budget.clientId);
        if(!client || !client.contact){
            alert("Cliente ou número de contato não encontrado.");
            return;
        }
        const message = encodeURIComponent(`Olá ${client.name}, segue o orçamento para o seu projeto. Valor total da mão de obra: R$ ${budget.totalLaborCost.toFixed(2)}. Estamos à disposição!`);
        window.open(`https://wa.me/${client.contact}?text=${message}`, '_blank');
    }

    const projectExistsForBudget = (budgetId: string) => {
        return projects.some(p => p.budgetId === budgetId);
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6">Orçamentos</h1>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 text-text-secondary-light dark:text-text-secondary-dark">
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Data</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.map(budget => (
                                <tr key={budget.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="p-4 font-medium text-text-primary-light dark:text-text-primary-dark">{getClient(budget.clientId)?.name}</td>
                                    <td className="p-4 text-text-secondary-light dark:text-text-secondary-dark">{new Date(budget.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor[budget.status]}`}>
                                            {budget.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex flex-wrap gap-2">
                                        <Button onClick={() => generateBudgetPDF(budget)} variant="ghost" className="!text-sm">PDF</Button>
                                        <Button onClick={() => handleShareWhatsApp(budget)} variant="ghost" className="!text-sm !text-green-500 dark:!text-green-400"><WhatsAppIcon/></Button>
                                        {budget.status === BudgetStatus.Pending && <Button onClick={() => handleApprove(budget.id)} variant="ghost" className="!text-sm !text-green-600 dark:!text-green-400">Aprovar</Button>}
                                        {budget.status === BudgetStatus.Approved && !projectExistsForBudget(budget.id) && <Button onClick={() => handleCreateProject(budget)} variant="secondary" className="!text-sm">Criar Projeto</Button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const ProjectCard: React.FC<{ project: Project; onManagePhotos: (p: Project) => void; onManageCollaborators: (p: Project) => void;}> = ({ project, onManagePhotos, onManageCollaborators }) => {
    const { budgets, clients, services, collaborators } = useAppContext();
    const [isExpanded, setIsExpanded] = useState(false);
    
    const details = useMemo(() => {
        const budget = budgets.find(b => b.id === project.budgetId);
        if (!budget) return { clientName: 'N/A', serviceName: 'N/A'};
        const client = clients.find(c => c.id === budget.clientId);
        const service = services.find(s => s.id === budget.serviceId);
        return { 
            clientName: client?.name || 'N/A',
            serviceName: service?.name || 'N/A',
        };
    }, [project, budgets, clients, services]);
    
    const statusInfo = {
        [ProjectStatus.Scheduled]: { color: 'text-blue-500 dark:text-blue-400', icon: <ClockIcon /> },
        [ProjectStatus.InProgress]: { color: 'text-yellow-600 dark:text-yellow-400', icon: <WrenchScrewdriverIcon /> },
        [ProjectStatus.Completed]: { color: 'text-green-600 dark:text-green-400', icon: <CheckCircleIcon /> },
    };
    const { color, icon } = statusInfo[project.status];
    
    return (
        <Card className="flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg">
             <div className="flex-grow">
                <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{project.name}</h2>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{details.clientName}</p>
                <div className={`mt-4 flex items-center gap-2 font-semibold ${color}`}>
                    {icon}
                    <span>{project.status}</span>
                </div>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-2">Início: {new Date(project.startDate).toLocaleDateString()}</p>
            </div>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 mt-4 pt-4 border-t' : 'max-h-0'}`}>
                 <h4 className="font-semibold mb-2 text-text-primary-light dark:text-text-primary-dark">Colaboradores Alocados</h4>
                 {project.allocatedCollaborators.length > 0 ? (
                    <ul className="space-y-1 text-sm list-disc list-inside">
                        {project.allocatedCollaborators.map(alloc => {
                            const collab = collaborators.find(c => c.id === alloc.collaboratorId);
                            return <li key={alloc.collaboratorId} className="text-text-secondary-light dark:text-text-secondary-dark">{collab?.name} ({alloc.daysWorked} dias)</li>
                        })}
                    </ul>
                 ) : <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Nenhum colaborador alocado.</p>}
                 <div className="mt-4 flex flex-col gap-2">
                     <Button variant="ghost" className="w-full !justify-start !text-sm" onClick={() => onManagePhotos(project)}>
                        <CameraIcon /> Gerenciar Fotos ({project.beforePhotos.length}/{project.afterPhotos.length})
                    </Button>
                    <Button variant="ghost" className="w-full !justify-start !text-sm" onClick={() => onManageCollaborators(project)}>
                        <UserGroupIcon /> Alocar Colaboradores
                    </Button>
                 </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                     <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Custo M.O. Real</h3>
                     <span className="font-bold text-xl text-primary-DEFAULT dark:text-accent-dark">
                        R$ {project.realLaborCost?.toFixed(2) ?? '0.00'}
                    </span>
                </div>
                <Button variant="secondary" onClick={() => setIsExpanded(!isExpanded)} className="!py-1 !px-3 !text-sm">
                    {isExpanded ? 'Ver Menos' : 'Ver Detalhes'}
                </Button>
            </div>
        </Card>
    )
}

const Projects: React.FC = () => {
    const { projects, setProjects } = useAppContext();
    const [managingCollaboratorsFor, setManagingCollaboratorsFor] = useState<Project | null>(null);
    const [managingPhotosFor, setManagingPhotosFor] = useState<Project | null>(null);

    return (
        <div>
            <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6">Projetos</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <ProjectCard 
                        key={project.id} 
                        project={project} 
                        onManagePhotos={setManagingPhotosFor} 
                        onManageCollaborators={setManagingCollaboratorsFor}
                    />
                ))}
            </div>
                         
            <ManageCollaboratorsModal 
                project={managingCollaboratorsFor}
                onClose={() => setManagingCollaboratorsFor(null)}
            />
             <ManagePhotosModal 
                project={managingPhotosFor}
                onClose={() => setManagingPhotosFor(null)}
                setProjects={setProjects}
            />
        </div>
    );
};
const Clients: React.FC = () => {
    const { clients } = useAppContext();

    return (
        <div>
            <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6">Clientes</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clients.map(client => (
                    <Card key={client.id}>
                        <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{client.name}</h2>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">{client.idNumber}</p>
                        <p className="mt-2 text-text-primary-light dark:text-text-primary-dark">{client.address}</p>
                        <a href={`https://wa.me/${client.contact}`} target="_blank" rel="noopener noreferrer" className="mt-4 font-semibold text-green-500 inline-block">
                           WhatsApp: {client.contact}
                        </a>
                    </Card>
                ))}
            </div>
        </div>
    );
};
const Financials: React.FC = () => {
    const { transactions } = useAppContext();
    const { theme } = useTheme();
    const totalRevenue = transactions.filter(t => t.type === TransactionType.Revenue).reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === TransactionType.Expense).reduce((sum, t) => sum + t.amount, 0);
    const balance = totalRevenue - totalExpense;

    const chartData = useMemo(() => {
        const dataMap = new Map<string, { revenue: number, expense: number }>();
        transactions.forEach(t => {
            const month = new Date(t.date).toLocaleString('default', { month: 'short' });
            if (!dataMap.has(month)) {
                dataMap.set(month, { revenue: 0, expense: 0 });
            }
            const entry = dataMap.get(month)!;
            if (t.type === TransactionType.Revenue) {
                entry.revenue += t.amount;
            } else {
                entry.expense += t.amount;
            }
        });
        return Array.from(dataMap.entries()).map(([name, values]) => ({ name, ...values }));
    }, [transactions]);
    
    // Theme-aware chart colors
    const tickColor = theme === 'light' ? '#374151' : '#94a3b8'; // text-secondary
    const gridColor = theme === 'light' ? '#e2e8f0' : '#334155'; // slate-200 / slate-700
    const tooltipBg = theme === 'light' ? '#ffffff' : '#0f172a'; // surface
    const tooltipColor = theme === 'light' ? '#111827' : '#f8fafc'; // text-primary
    const tooltipBorder = theme === 'light' ? '#6b21a8' : '#c084fc'; // secondary / accent-dark

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">Financeiro</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center">
                    <h2 className="text-lg font-semibold text-green-600 dark:text-green-400">Receita Total</h2>
                    <p className="text-3xl font-bold mt-2 text-text-primary-light dark:text-text-primary-dark">R$ {totalRevenue.toFixed(2)}</p>
                </Card>
                 <Card className="text-center">
                    <h2 className="text-lg font-semibold text-red-500 dark:text-red-400">Despesa Total</h2>
                    <p className="text-3xl font-bold mt-2 text-text-primary-light dark:text-text-primary-dark">R$ {totalExpense.toFixed(2)}</p>
                </Card>
                 <Card className={`text-center ${balance >= 0 ? 'border-green-500' : 'border-red-500'} border-2`}>
                    <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">Saldo</h2>
                    <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>R$ {balance.toFixed(2)}</p>
                </Card>
            </div>
            <Card>
                <h2 className="text-xl font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">Visão Geral Financeira (Mensal)</h2>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="name" tick={{fontSize: 12, fill: tickColor}} axisLine={{stroke: gridColor}} tickLine={{stroke: gridColor}} />
                        <YAxis tick={{fontSize: 12, fill: tickColor}} axisLine={{stroke: gridColor}} tickLine={{stroke: gridColor}}/>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: tooltipBg,
                                borderColor: tooltipBorder,
                                borderRadius: '0.5rem',
                                color: tooltipColor,
                            }}
                            labelStyle={{ color: tooltipColor }}
                        />
                        <Legend wrapperStyle={{color: tickColor}} />
                        <Bar dataKey="revenue" fill="#22c55e" name="Receita" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" fill="#ef4444" name="Despesa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            <Card>
                 <h2 className="text-xl font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">Últimas Transações</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 text-text-secondary-light dark:text-text-secondary-dark">
                                <th className="p-4">Data</th>
                                <th className="p-4">Descrição</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.sort((a,b) => b.date.getTime() - a.date.getTime()).map(t => (
                                <tr key={t.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="p-4 text-text-secondary-light dark:text-text-secondary-dark">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="p-4 text-text-primary-light dark:text-text-primary-dark">{t.description}</td>
                                    <td className="p-4">
                                        <span className={`font-semibold ${t.type === TransactionType.Revenue ? 'text-green-500' : 'text-red-500'}`}>{t.type}</span>
                                    </td>
                                    <td className="p-4 text-right font-mono text-text-primary-light dark:text-text-primary-dark">{t.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </Card>
        </div>
    );
};

// MODALS
const ManagePhotosModal: React.FC<{
    project: Project | null;
    onClose: () => void;
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}> = ({ project, onClose, setProjects }) => {
    const { projects } = useAppContext();
    if (!project) return null;

    const currentProjectState = useMemo(() => {
        return projects.find(p => p.id === project.id)
    }, [projects, project.id]);

    const addPhoto = (type: 'before' | 'after') => {
        const key = type === 'before' ? 'beforePhotos' : 'afterPhotos';
        setProjects(prev => prev.map(p => 
            p.id === project.id ? { ...p, [key]: [...p[key], `/img_placeholder.png?t=${Date.now()}`] } : p
        ));
    };

    const removePhoto = (type: 'before' | 'after', index: number) => {
        const key = type === 'before' ? 'beforePhotos' : 'afterPhotos';
        setProjects(prev => prev.map(p => 
            p.id === project.id ? { ...p, [key]: p[key].filter((_, i) => i !== index) } : p
        ));
    };

    const canAddBefore = currentProjectState && currentProjectState.beforePhotos.length < 3;
    const canAddAfter = currentProjectState && currentProjectState.afterPhotos.length < 3;

    const PhotoGrid: React.FC<{type: 'before' | 'after'}> = ({ type }) => {
        const photos = type === 'before' ? currentProjectState?.beforePhotos : currentProjectState?.afterPhotos;
        const title = type === 'before' ? 'Antes' : 'Depois';
        if (!photos) return null;
        const canAdd = type === 'before' ? canAddBefore : canAddAfter;
        return (
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg capitalize text-text-primary-light dark:text-text-primary-dark">{title} ({photos.length}/3)</h3>
                    <Button onClick={() => addPhoto(type)} disabled={!canAdd}><PlusIcon /> Adicionar Foto</Button>
                </div>
                <div className="grid grid-cols-3 gap-2 min-h-[80px] bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                    {photos.map((photo, index) => (
                        <div key={index} className="relative aspect-square group">
                            <img src={photo} alt={`${type} ${index+1}`} className="w-full h-full object-cover rounded" />
                            <button 
                                onClick={() => removePhoto(type, index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <Modal isOpen={!!project} onClose={onClose} title={`Gerenciar Fotos: ${project.name}`} size="lg">
            <div className="space-y-6">
                <PhotoGrid type="before" />
                <PhotoGrid type="after" />
                 <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <Button onClick={onClose}>Fechar</Button>
                </div>
            </div>
        </Modal>
    );
};


const ManageCollaboratorsModal: React.FC<{
    project: Project | null;
    onClose: () => void;
}> = ({ project, onClose }) => {
    const { collaborators, setProjects } = useAppContext();
    const [allocations, setAllocations] = useState<Project['allocatedCollaborators']>([]);

    useEffect(() => {
        if (project) {
            setAllocations(project.allocatedCollaborators || []);
        }
    }, [project]);

    const calculatedTotalCost = useMemo(() => {
        if (!allocations || !collaborators) return 0;
        
        const getCollaboratorRate = (id: string) => collaborators.find(c => c.id === id)?.dailyRate || 0;

        return allocations.reduce((sum, alloc) => {
            const rate = getCollaboratorRate(alloc.collaboratorId);
            return sum + (rate * alloc.daysWorked);
        }, 0);
    }, [allocations, collaborators]);

    if (!project) return null;

    const handleAddCollaborator = (collaboratorId: string) => {
        if (collaboratorId && !allocations.some(a => a.collaboratorId === collaboratorId)) {
            setAllocations([...allocations, { collaboratorId, daysWorked: 1 }]);
        }
    };

    const handleUpdateDays = (collaboratorId: string, days: number) => {
        setAllocations(allocations.map(a =>
            a.collaboratorId === collaboratorId ? { ...a, daysWorked: days } : a
        ));
    };

    const handleRemoveCollaborator = (collaboratorId: string) => {
        setAllocations(allocations.filter(a => a.collaboratorId !== collaboratorId));
    };

    const handleSave = () => {
        setProjects(prevProjects => prevProjects.map(p =>
            p.id === project.id ? { ...p, allocatedCollaborators: allocations, realLaborCost: calculatedTotalCost } : p
        ));
        onClose();
    };
    
    const allocatedCollaboratorIds = new Set(allocations.map(a => a.collaboratorId));
    const availableCollaborators = collaborators.filter(c => !allocatedCollaboratorIds.has(c.id));

    return (
        <Modal isOpen={!!project} onClose={onClose} title={`Alocar Colaboradores: ${project.name}`}>
            <div className="space-y-4">
                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <Select
                            label="Adicionar Colaborador"
                            id="collaborator-select"
                            value=""
                            onChange={(e) => { 
                                handleAddCollaborator(e.target.value);
                                e.target.value = "";
                             }}
                        >
                            <option value="" disabled>Selecione...</option>
                            {availableCollaborators.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </Select>
                    </div>
                </div>

                <div className="space-y-3 mt-4 max-h-60 overflow-y-auto pr-2">
                    {allocations.length === 0 && <p className="text-center text-text-secondary-light dark:text-text-secondary-dark py-4">Nenhum colaborador alocado.</p>}
                    {allocations.map(alloc => {
                        const collaborator = collaborators.find(c => c.id === alloc.collaboratorId);
                        if (!collaborator) return null;
                        return (
                            <div key={alloc.collaboratorId} className="flex items-center gap-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <div className="flex-1">
                                    <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">{collaborator.name}</p>
                                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Diária: R$ {collaborator.dailyRate.toFixed(2)}</p>
                                </div>
                                <div className="w-24">
                                    <Input
                                        label="Dias Trab."
                                        id={`days-${alloc.collaboratorId}`}
                                        type="number"
                                        min="0"
                                        value={alloc.daysWorked}
                                        onChange={(e) => handleUpdateDays(alloc.collaboratorId, parseInt(e.target.value, 10) || 0)}
                                    />
                                </div>
                                <button onClick={() => handleRemoveCollaborator(alloc.collaboratorId)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                                    <XIcon className="w-5 h-5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
                
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Custo Total Previsto</p>
                        <p className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">R$ {calculatedTotalCost.toFixed(2)}</p>
                    </div>
                    <Button onClick={handleSave}>Salvar Alterações</Button>
                </div>
            </div>
        </Modal>
    );
};

const NewClientMiniModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (newClient: Client) => void; }> = ({ isOpen, onClose, onSave }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newClient: Client = {
            id: `cli_${Date.now()}`,
            name: formData.get('name') as string,
            idNumber: formData.get('idNumber') as string,
            contact: formData.get('contact') as string,
            address: formData.get('address') as string,
        };
        onSave(newClient);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Cliente" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Nome / Razão Social" id="name" name="name" required />
                <Input label="CPF / CNPJ" id="idNumber" name="idNumber" required />
                <Input label="Contato (WhatsApp)" id="contact" name="contact" required />
                <Input label="Endereço do Serviço" id="address" name="address" required />
                <div className="flex justify-end pt-4">
                    <Button type="submit" variant="secondary">Salvar Cliente</Button>
                </div>
            </form>
        </Modal>
    );
};

const NewBudgetModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { clients, setClients, services, setBudgets, openNewClientModal } = useAppContext();
    
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [areaInSqM, setAreaInSqM] = useState<number | string>('');
    
    const calculationResult = useMemo(() => {
        const service = services.find(s => s.id === selectedServiceId);
        const area = typeof areaInSqM === 'number' ? areaInSqM : 0;
        if (!service || area <= 0) return null;

        return {
            totalLaborCost: area * service.laborCostPerSqM,
            materials: {
                plates: area * service.plateCoefficient,
                profiles: area * service.profileCoefficient,
                screws: area * service.screwCoefficient,
            }
        };
    }, [selectedServiceId, areaInSqM, services]);
    
    const resetForm = useCallback(() => {
        setSelectedClientId('');
        setSelectedServiceId('');
        setAreaInSqM('');
    }, []);

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen, resetForm]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedClientId || !selectedServiceId || !calculationResult || areaInSqM <= 0) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        
        const newBudget: Budget = {
            id: `bud_${Date.now()}`,
            clientId: selectedClientId,
            serviceId: selectedServiceId,
            areaInSqM: Number(areaInSqM),
            status: BudgetStatus.Pending,
            createdAt: new Date(),
            totalLaborCost: calculationResult.totalLaborCost,
            calculatedMaterials: calculationResult.materials,
        };
        
        setBudgets(prev => [...prev, newBudget]);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Criar Novo Orçamento" size="xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coluna 1: Dados */}
                    <div className="space-y-4">
                        <div>
                            <Select
                                label="1. Cliente"
                                id="client-select"
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                required
                            >
                                <option value="" disabled>Selecione um cliente</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                             <Button type="button" onClick={openNewClientModal} variant="secondary" className="mt-2 w-full text-sm">
                                <UserPlusIcon /> Adicionar Novo Cliente
                            </Button>
                        </div>
                        <Select
                            label="2. Serviço"
                            id="service-select"
                            value={selectedServiceId}
                            onChange={e => setSelectedServiceId(e.target.value)}
                            required
                        >
                            <option value="" disabled>Selecione um serviço</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                        <Input 
                            label="3. Metragem (m²)" 
                            id="area" 
                            type="number"
                            value={areaInSqM}
                            onChange={e => setAreaInSqM(parseFloat(e.target.value) || '')}
                            required
                            min="0.1"
                            step="0.01"
                        />
                    </div>
                    
                    {/* Coluna 2: Resultado */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-4">
                         <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Prévia do Cálculo</h3>
                         {calculationResult ? (
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Custo Mão de Obra</p>
                                    <p className="text-2xl font-bold text-primary-DEFAULT dark:text-accent-dark">R$ {calculationResult.totalLaborCost.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-1">Materiais Estimados</p>
                                    <ul className="text-sm text-text-primary-light dark:text-text-primary-dark space-y-1">
                                        <li><span className="font-semibold">Placas:</span> {calculationResult.materials.plates.toFixed(1)} un</li>
                                        <li><span className="font-semibold">Perfis:</span> {calculationResult.materials.profiles.toFixed(1)} m</li>
                                        <li><span className="font-semibold">Parafusos:</span> {calculationResult.materials.screws.toFixed(0)} un</li>
                                    </ul>
                                </div>
                            </div>
                         ) : (
                            <div className="text-center text-text-secondary-light dark:text-text-secondary-dark h-full flex items-center justify-center">
                                <p>Preencha os campos para ver o cálculo.</p>
                            </div>
                         )}
                    </div>
                </div>
                 <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button type="submit" disabled={!calculationResult}>Salvar Orçamento</Button>
                </div>
            </form>
        </Modal>
    );
};


const Settings: React.FC = () => {
    const { companyInfo, setCompanyInfo, collaborators, setCollaborators, services, setServices } = useAppContext();
    const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const [newCollabName, setNewCollabName] = useState('');
    const [newCollabContact, setNewCollabContact] = useState('');
    const [newCollabDailyRate, setNewCollabDailyRate] = useState('');


    const handleOpenServiceModal = (service: Service | null) => {
        setEditingService(service);
        setIsServiceModalOpen(true);
    };

    const handleSaveService = (serviceToSave: Service) => {
        if (editingService) { // Update
            setServices(prev => prev.map(s => s.id === serviceToSave.id ? serviceToSave : s));
        } else { // Create
            setServices(prev => [...prev, { ...serviceToSave, id: `srv_${Date.now()}` }]);
        }
    };
    
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCompanyInfo(c => ({...c, logo: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSaveCollaborator = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCollabName || !newCollabContact || !newCollabDailyRate) {
            alert("Preencha todos os campos.");
            return;
        }
        const newCollaborator: Collaborator = {
            id: `col_${Date.now()}`,
            name: newCollabName,
            contact: newCollabContact,
            dailyRate: parseFloat(newCollabDailyRate)
        };
        setCollaborators(prev => [...prev, newCollaborator]);
        setNewCollabName('');
        setNewCollabContact('');
        setNewCollabDailyRate('');
        setIsCollabModalOpen(false);
    };
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">Configurações</h1>
            <Card>
                <h2 className="text-xl font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">Dados da Empresa</h2>
                <div className="space-y-4">
                    <Input label="Nome da Empresa" id="companyName" value={companyInfo.name} onChange={e => setCompanyInfo(c => ({...c, name: e.target.value}))} />
                    <Input label="Endereço" id="companyAddress" value={companyInfo.address} onChange={e => setCompanyInfo(c => ({...c, address: e.target.value}))} />
                    <Input label="Contato" id="companyContact" value={companyInfo.contact} onChange={e => setCompanyInfo(c => ({...c, contact: e.target.value}))} />
                    <div className="flex items-center gap-4">
                        {companyInfo.logo && <img src={companyInfo.logo} alt="logo" className="w-16 h-16 rounded-full object-cover bg-slate-200" />}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Logotipo</label>
                            <input type="file" onChange={handleLogoChange} accept="image/*" className="text-sm text-text-secondary-light dark:text-text-secondary-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary/10 file:text-secondary dark:file:bg-secondary/20 dark:file:text-accent-dark hover:file:bg-secondary/20"/>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">Cadastros</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button onClick={() => handleOpenServiceModal(null)} variant="ghost" className="!justify-start p-4 border dark:border-slate-700">
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Serviços</h3>
                            <p className="text-sm font-normal text-text-secondary-light dark:text-text-secondary-dark">Gerenciar serviços e coeficientes</p>
                        </div>
                    </Button>
                    <Button onClick={() => setIsCollabModalOpen(true)} variant="ghost" className="!justify-start p-4 border dark:border-slate-700">
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Colaboradores</h3>
                            <p className="text-sm font-normal text-text-secondary-light dark:text-text-secondary-dark">Gerenciar sua equipe</p>
                        </div>
                    </Button>
                     <Button variant="ghost" className="!justify-start p-4 border dark:border-slate-700">
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Materiais</h3>
                            <p className="text-sm font-normal text-text-secondary-light dark:text-text-secondary-dark">Gerenciar estoque e custos</p>
                        </div>
                    </Button>
                </div>
            </Card>

            <Modal isOpen={isCollabModalOpen} onClose={() => setIsCollabModalOpen(false)} title="Novo Colaborador">
                <form className="space-y-4" onSubmit={handleSaveCollaborator}>
                    <Input label="Nome" id="collabName" value={newCollabName} onChange={e => setNewCollabName(e.target.value)} required />
                    <Input label="Contato" id="collabContact" value={newCollabContact} onChange={e => setNewCollabContact(e.target.value)} required />
                    <Input label="Valor da Diária" id="collabDailyRate" type="number" value={newCollabDailyRate} onChange={e => setNewCollabDailyRate(e.target.value)} required min="0" step="0.01" />
                    <div className="flex justify-end pt-4">
                        <Button type="submit">Salvar</Button>
                    </div>
                </form>
            </Modal>
            <ServiceModal 
                isOpen={isServiceModalOpen}
                onClose={() => setIsServiceModalOpen(false)}
                onSave={handleSaveService}
                service={editingService}
            />
        </div>
    );
};

const ServiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Service) => void;
    service: Service | null;
}> = ({ isOpen, onClose, onSave, service }) => {
    const [name, setName] = useState('');
    const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.ParedeSimples);
    const [laborCost, setLaborCost] = useState(0);
    const [plateCo, setPlateCo] = useState(0);
    const [profileCo, setProfileCo] = useState(0);
    const [screwCo, setScrewCo] = useState(0);

    useEffect(() => {
        if (service) {
            setName(service.name);
            setServiceType(service.serviceType);
            setLaborCost(service.laborCostPerSqM);
            setPlateCo(service.plateCoefficient);
            setProfileCo(service.profileCoefficient);
            setScrewCo(service.screwCoefficient);
        } else {
            setName('');
            setServiceType(ServiceType.ParedeSimples);
            setLaborCost(0);
            setPlateCo(0.46);
            setProfileCo(1.8);
            setScrewCo(15);
        }
    }, [service, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: service?.id || '', name, serviceType,
            laborCostPerSqM: laborCost,
            plateCoefficient: plateCo,
            profileCoefficient: profileCo,
            screwCoefficient: screwCo
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={service ? 'Editar Serviço' : 'Novo Serviço'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Nome do Serviço" id="serviceName" value={name} onChange={e => setName(e.target.value)} required />
                <Select label="Tipo de Construção" id="serviceType" value={serviceType} onChange={e => setServiceType(e.target.value as ServiceType)}>
                    {Object.values(ServiceType).map(type => <option key={type} value={type}>{type}</option>)}
                </Select>
                <Input label="Custo M.O. por m²" id="serviceCost" type="number" value={laborCost} onChange={e => setLaborCost(parseFloat(e.target.value) || 0)} required />
                <div className="pt-4 border-t">
                     <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">Coeficientes de Material por m²</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input label="Placas (un/m²)" id="plateCo" type="number" step="0.01" value={plateCo} onChange={e => setPlateCo(parseFloat(e.target.value) || 0)} required />
                        <Input label="Perfis (m/m²)" id="profileCo" type="number" step="0.01" value={profileCo} onChange={e => setProfileCo(parseFloat(e.target.value) || 0)} required />
                        <Input label="Parafusos (un/m²)" id="screwCo" type="number" step="1" value={screwCo} onChange={e => setScrewCo(parseInt(e.target.value, 10) || 0)} required />
                     </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit">Salvar</Button>
                </div>
            </form>
        </Modal>
    );
}

const LoginScreen: React.FC<{onLogin: () => void}> = ({ onLogin }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-4">
            <Card className="text-center w-full max-w-sm">
                <h1 className="text-4xl font-bold text-primary-DEFAULT dark:text-white tracking-tight">Dry<span className="text-secondary dark:text-accent-dark">Flow</span></h1>
                <p className="mt-2 mb-8 text-text-secondary-light dark:text-text-secondary-dark">O fluxo de trabalho do seu negócio, simplificado.</p>
                <Button onClick={onLogin} className="w-full text-lg" variant="success">
                    <GoogleIcon /> Login com Google
                </Button>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-6">O primeiro login cria sua conta de administrador.</p>
            </Card>
        </div>
    )
}


// MAIN APP COMPONENT
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isFirstLoginAttempt, setIsFirstLoginAttempt] = useState(true); // Simulate check for first-ever user
  const [view, setView] = useState<View>('painel');
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(initialCollaborators);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({ name: 'Sua Empresa Drywall', address: 'Sua Rua, 123', contact: '5511912345678', logo: null });
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // --- AUTH LOGIC ---
  const handleLogin = () => {
      // Simulate Google OAuth
      const loggedInUser: User = {
          name: "Admin User",
          email: "admin@example.com",
          isAdmin: isFirstLoginAttempt, // First user is always admin
      };
      setUser(loggedInUser);
      setIsFirstLoginAttempt(false); // Subsequent logins won't be admin by default
  };
  
  const handleLogout = () => {
      setUser(null);
  };

  const handleSaveNewClient = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
  };

  const getView = useCallback(<T extends View>(newView: T) => () => setView(newView), []);

  const renderView = () => {
    switch (view) {
      case 'painel': return <Painel />;
      case 'budgets': return <Budgets />;
      case 'projects': return <Projects />;
      case 'clients': return <Clients />;
      case 'financials': return <Financials />;
      case 'settings': return <Settings />;
      default: return <Painel />;
    }
  };

  const appContextValue: AppContextType = {
      user,
      clients, setClients,
      services, setServices,
      collaborators, setCollaborators,
      budgets, setBudgets,
      projects, setProjects,
      companyInfo, setCompanyInfo,
      transactions, setTransactions,
      getView,
      openNewBudgetModal: () => setIsBudgetModalOpen(true),
      openNewClientModal: () => setIsClientModalOpen(true),
  };

  return (
    <ThemeProvider>
        <GlobalStyles />
        <AppContext.Provider value={appContextValue}>
            {!user ? (
                <LoginScreen onLogin={handleLogin} />
            ) : (
                <>
                    <MainLayout currentView={view} setView={setView} onLogout={handleLogout}>
                        {renderView()}
                    </MainLayout>
                    <NewBudgetModal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} />
                    <NewClientMiniModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} onSave={handleSaveNewClient} />
                </>
            )}
        </AppContext.Provider>
    </ThemeProvider>
  );
}

// LAYOUT COMPONENTS
const MainLayout: React.FC<{ children: React.ReactNode; currentView: View; setView: (view: View) => void; onLogout: () => void; }> = ({ children, currentView, setView, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <div className="bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark min-h-screen">
            <div className="flex">
                <Sidebar currentView={currentView} setView={setView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <div className="flex-1 flex flex-col max-w-full overflow-hidden">
                    <Header onLogout={onLogout} onMenuClick={() => setIsSidebarOpen(true)} />
                    <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

const Header: React.FC<{onLogout: () => void, onMenuClick: () => void}> = ({ onLogout, onMenuClick }) => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAppContext();

    return (
        <header className="bg-surface-light/80 dark:bg-surface-dark/50 backdrop-blur-sm sticky top-0 z-20 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between lg:justify-end items-center gap-4">
             <button onClick={onMenuClick} className="lg:hidden text-text-primary-light dark:text-text-primary-dark">
                <Bars3Icon />
            </button>
            <div className="flex items-center gap-2 sm:gap-4">
                 <Button variant="ghost" className="!p-2">
                    <BellIcon />
                </Button>
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-text-primary-light dark:text-text-primary-dark">
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>
                <div className="flex items-center gap-2">
                     <div className="w-10 h-10 bg-gradient-to-br from-primary-DEFAULT to-secondary rounded-full flex-shrink-0"></div>
                     <div className="text-right hidden sm:block">
                        <p className="font-semibold text-sm text-text-primary-light dark:text-text-primary-dark">{user?.name}</p>
                        <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="text-xs text-red-500 dark:text-red-400 hover:underline">Sair</a>
                     </div>
                </div>
            </div>
        </header>
    );
};

const Sidebar: React.FC<{ currentView: View; setView: (view: View) => void; isOpen: boolean; setIsOpen: (isOpen: boolean) => void; }> = ({ currentView, setView, isOpen, setIsOpen }) => {
    const { user } = useAppContext();

    const navItems = [
        { id: 'painel', label: 'Painel', icon: <ChartBarIcon /> },
        { id: 'budgets', label: 'Orçamentos', icon: <FileTextIcon /> },
        { id: 'projects', label: 'Projetos', icon: <WrenchScrewdriverIcon /> },
        { id: 'clients', label: 'Clientes', icon: <UsersIcon /> },
        { id: 'financials', label: 'Financeiro', icon: <CircleDollarIcon /> },
    ];

    const handleLinkClick = (view: View) => {
        setView(view);
        setIsOpen(false);
    }
    
    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-3xl font-bold text-primary-DEFAULT dark:text-white tracking-tight">Dry<span className="text-secondary dark:text-accent-dark">Flow</span></h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map(item => (
                    <a
                        key={item.id}
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleLinkClick(item.id as View); }}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-colors ${currentView === item.id ? 'bg-secondary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary-light dark:text-text-secondary-dark'}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </a>
                ))}
            </nav>
            {user?.isAdmin && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                     <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleLinkClick('settings'); }}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-colors ${currentView === 'settings' ? 'bg-secondary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary-light dark:text-text-secondary-dark'}`}
                    >
                        <Cog6ToothIcon />
                        <span>Configurações</span>
                    </a>
                </div>
            )}
        </div>
    );
    
    return (
        <>
        {/* Mobile Sidebar */}
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
        <aside className={`fixed lg:relative top-0 left-0 w-64 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-700 h-screen z-50 flex flex-col flex-shrink-0 transition-transform transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <SidebarContent />
        </aside>
        
        {/* Desktop Sidebar placeholder */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
           <div className="fixed top-0 left-0 w-64 h-screen bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-700">
               <SidebarContent />
           </div>
        </aside>
        </>
    );
};