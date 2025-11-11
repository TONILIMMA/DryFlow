// Fix: Import 'Dispatch' and 'SetStateAction' from 'react' to be used in AppContextType.
import type { Dispatch, SetStateAction } from 'react';

export type View = 'painel' | 'budgets' | 'projects' | 'clients' | 'financials' | 'settings';

export interface User {
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface Client {
  id: string;
  name: string;
  idNumber: string; // CPF/CNPJ
  contact: string; // WhatsApp
  address: string;
}

export enum ServiceType {
  ParedeSimples = 'Parede Simples',
  ParedeDupla = 'Parede Dupla',
  ForroSimples = 'Forro Simples',
  ForroDuplo = 'Forro Duplo',
}

export interface Service {
  id: string;
  name: string;
  serviceType: ServiceType;
  laborCostPerSqM: number;
  // Coeficientes de material por m²
  plateCoefficient: number; // Placas (unid/m²)
  profileCoefficient: number; // Montantes/Guias (metros lineares/m²)
  screwCoefficient: number; // Parafusos (unid/m²)
}


export interface Material {
  id: string;
  name: string;
  unit: string;
  cost: number;
}

export interface Collaborator {
  id: string;
  name: string;
  contact: string;
  dailyRate: number;
}

export enum BudgetStatus {
  Pending = 'Pendente',
  Approved = 'Aprovado',
  Rejected = 'Rejeitado',
}

export interface CalculatedMaterials {
    plates: number;
    profiles: number;
    screws: number;
}

export interface Budget {
  id: string;
  clientId: string;
  serviceId: string;
  areaInSqM: number;
  status: BudgetStatus;
  createdAt: Date;
  totalLaborCost: number;
  calculatedMaterials: CalculatedMaterials;
}

export enum ProjectStatus {
  Scheduled = 'Agendado',
  InProgress = 'Em Execução',
  Completed = 'Concluído',
}

export interface Project {
  id: string;
  budgetId: string;
  name: string;
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
  beforePhotos: string[]; // Using string for mock URLs/base64
  afterPhotos: string[];
  allocatedCollaborators: { collaboratorId: string; daysWorked: number }[];
  realLaborCost?: number;
}

export interface CompanyInfo {
  name: string;
  address: string;
  contact: string;
  logo: string | null; // URL or base64 string
}

export enum TransactionType {
  Revenue = 'Receita',
  Expense = 'Despesa',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: Date;
  projectId?: string;
}

// APP CONTEXT (STATE MANAGEMENT)
export interface AppContextType {
    user: User | null;
    clients: Client[];
    // Fix: Use imported 'Dispatch' and 'SetStateAction' types instead of 'React.Dispatch' and 'React.SetStateAction' to resolve namespace errors.
    setClients: Dispatch<SetStateAction<Client[]>>;
    services: Service[];
    setServices: Dispatch<SetStateAction<Service[]>>;
    collaborators: Collaborator[];
    setCollaborators: Dispatch<SetStateAction<Collaborator[]>>;
    budgets: Budget[];
    setBudgets: Dispatch<SetStateAction<Budget[]>>;
    projects: Project[];
    setProjects: Dispatch<SetStateAction<Project[]>>;
    companyInfo: CompanyInfo;
    setCompanyInfo: Dispatch<SetStateAction<CompanyInfo>>;
    transactions: Transaction[];
    setTransactions: Dispatch<SetStateAction<Transaction[]>>;
    getView: <T extends View>(view: T) => () => void;
    openNewBudgetModal: () => void;
    openNewClientModal: () => void;
}