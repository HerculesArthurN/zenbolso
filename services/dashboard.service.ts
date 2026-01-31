import { DashboardSummary, CategorySummary, MonthlySummary, AccountSummary } from '../types';
import { calculateForecast, DailyForecast } from './forecast';
import { COLORS } from '../constants';
import { handleDBError } from './repositoryUtils';
import { getTransactions } from './repositories/transactions';
import { getAccounts } from './repositories/accounts';
import { getSettings } from './repositories/settings';
import { getCategories } from './repositories/categories';
import { getRecurringConfigs } from './repositories/recurrence';

import { decrypt } from '../src/utils/crypto';

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const [transactions, accounts, settings, categoriesList] = await Promise.all([
      getTransactions(),
      getAccounts(),
      getSettings(),
      getCategories()
    ]);

    const now = new Date();
    const currentMonth = now.getUTCMonth() + 1; // 1-12
    const currentYear = now.getUTCFullYear();

    let netBalance = accounts.reduce((sum, a) => sum + (Number(a.initialBalance) || 0), 0);
    let totalIncome = 0;
    let totalExpense = 0;
    let currentMonthExpense = 0;

    const categoryTotals: Record<string, number> = {};

    const getCategoryIcon = (name: string) => {
      const found = categoriesList.find(c => c.name === name);
      return found?.icon;
    };

    // Calculate Cash Flow (Income vs Expense)
    transactions.forEach((t: any) => {
      // Safe value extraction with decryption support
      const rawValue = typeof t.value === 'string' ? decrypt(t.value) : t.value;
      const val = Number(rawValue) || 0;
      const type = String(t.type || '').toUpperCase();

      if (type === 'INCOME') {
        totalIncome += val;
        netBalance += val;
      } else if (type === 'EXPENSE') {
        totalExpense += val;
        netBalance -= val;

        const cat = t.category || 'Outros';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + val;

        // Calculate current month expense for budget (using UTC dates to match repo logic)
        const [tYear, tMonth] = t.date.split('-').map(Number);
        if (tYear === currentYear && tMonth === currentMonth) {
          currentMonthExpense += val;
        }
      }
    });

    // Calculate Account Balances (Patrimony)
    const accountsSummary: AccountSummary[] = accounts.map(account => {
      // Balance = Initial + Incomes (for this account) - Expenses (for this account)
      const accountTransactions = transactions.filter((t: any) => t.accountId === account.id || (!t.accountId && account.id === 'default-wallet'));

      const flow = accountTransactions.reduce((acc: number, t: any) => {
        const rawTValue = typeof t.value === 'string' ? decrypt(t.value) : t.value;
        const tVal = Number(rawTValue) || 0;
        const tType = String(t.type || '').toUpperCase();
        return acc + (tType === 'INCOME' ? tVal : -tVal);
      }, 0);

      return {
        ...account,
        currentBalance: account.initialBalance + flow
      };
    });

    const categories: CategorySummary[] = Object.entries(categoryTotals)
      .map(([category, total], index) => ({
        category,
        total,
        percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
        color: COLORS[index % COLORS.length],
        icon: getCategoryIcon(category)
      }))
      .sort((a, b) => b.total - a.total);

    return {
      netBalance,
      totalIncome,
      totalExpense,
      currentMonthExpense,
      budgetLimit: settings.budgetLimit,
      categories,
      accounts: accountsSummary
    };
  } catch (e) {
    throw handleDBError(e, 'DB_READ_ERROR');
  }
};

export const getForecastData = async (): Promise<DailyForecast[]> => {
  try {
    const [summary, recurring] = await Promise.all([
      getDashboardSummary(),
      getRecurringConfigs()
    ]);

    return calculateForecast(summary.netBalance, recurring, 30);
  } catch (e) {
    console.warn("Forecast calc error", e);
    return [];
  }
};

export const getAnnualSummary = async (year: number): Promise<MonthlySummary[]> => {
  try {
    const transactions = await getTransactions();

    const monthsData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      fullDate: `${year}-${String(i + 1).padStart(2, '0')}`,
      income: 0,
      expense: 0,
      balance: 0
    }));

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const localDate = new Date(tDate.getTime() + tDate.getTimezoneOffset() * 60000);

      if (localDate.getFullYear() === year) {
        const monthIndex = localDate.getMonth();
        const rawValue = typeof t.value === 'string' ? decrypt(t.value) : t.value;
        const val = Number(rawValue) || 0;
        const type = String(t.type || '').toUpperCase();

        if (type === 'INCOME') {
          monthsData[monthIndex].income += val;
          monthsData[monthIndex].balance += val;
        } else {
          monthsData[monthIndex].expense += val;
          monthsData[monthIndex].balance -= val;
        }
      }
    });

    return monthsData;
  } catch (e) {
    throw handleDBError(e, 'DB_READ_ERROR');
  }
};