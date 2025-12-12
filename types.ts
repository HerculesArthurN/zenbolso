export type TransactionType = 'income' | 'expense';

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'cash' | 'credit';
  initialBalance: number;
  color: string;
}

export interface AccountSummary extends Account {
  currentBalance: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string; // Emoji character OR Lucide Icon Name
  color?: string; // Hex color code
}

export interface Transaction {
  id: string;
  type: TransactionType;
  value: number;
  date: string; // YYYY-MM-DD
  category: string;
  description?: string;
  tags?: string[];
  accountId?: string; // Link to Account
}

export interface RecurringConfig {
  id: string;
  type: TransactionType;
  value: number;
  category: string;
  description?: string;
  tags?: string[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  rruleString: string; // RFC 5545 string
  lastGeneratedDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  active: boolean;
}

export interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
  color: string;
  icon?: string;
}

export interface DashboardSummary {
  netBalance: number;
  totalIncome: number;
  totalExpense: number;
  currentMonthExpense: number; // New: For budget tracking
  budgetLimit: number; // New: User defined limit
  categories: CategorySummary[];
  accounts: AccountSummary[];
}

export interface MonthlySummary {
  month: string; // "Jan", "Fev"...
  fullDate: string; // YYYY-MM
  income: number;
  expense: number;
  balance: number;
}

export interface GoogleDriveConfig {
  enabled: boolean;
  clientId: string; // User provided Client ID for "Local First" privacy
  frequency: 'daily' | 'weekly';
  lastBackup?: string; // ISO String
  accessToken?: string; // Cached (short lived)
  tokenExpiry?: number; // Timestamp
}

export interface AppSettings {
  budgetLimit: number;
  monthlyIncome?: number; // New: For Hourly Rate Calc
  workHoursPerMonth?: number; // New: For Hourly Rate Calc
  googleDrive?: GoogleDriveConfig;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface Insight {
  id: string;
  type: 'alert' | 'success' | 'info' | 'neutral';
  title: string;
  message: string;
  icon?: string;
}

export interface Badge {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number; // 0 to 100
  unlockedAt?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  deadline?: string;
  imageUrl?: string; // Base64 or URL
  color: string;
}