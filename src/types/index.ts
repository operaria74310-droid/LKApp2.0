export interface Client {
  id: string;
  name: string;
  server: string;
  app: string;
  mac: string;
  key: string;
  accessCount: number;
  price: number;
  bank: string;
  hasPmd: boolean;
  dueDate: string; // YYYY-MM-DD
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  clientId: string;
  clientName: string;
  server: string;
  app: string;
  amount: number;
  bank: string;
  paymentDate: string; // YYYY-MM-DD
  originalDueDate: string;
  nextDueDate: string;
  timestamp: number;
  notes?: string;
}

export interface BankSummary {
  bank: string;
  monthlyTotal: number;
  dailyTotal: number;
  count: number;
}

export interface SuggestionStore {
  servers: string[];
  apps: string[];
  banks: string[];
  prices: number[];
  accessCounts: number[];
}

export type FilterStatus = 'all' | 'today' | 'overdue' | 'upcoming' | 'pmd';
export type SortOption = 'dueDate-asc' | 'dueDate-desc' | 'name-asc' | 'price-desc';
