import { DashboardSummary, CategorySummary, MonthlySummary, AccountSummary } from '../types';
import { calculateForecast, DailyForecast } from './forecast';
import { COLORS } from '../constants';
import { handleDBError } from './repositoryUtils';
import { transactionService } from './transactionService';
import { generateInsights } from './insights';
import { getAccounts } from './repositories/accounts';
import { getSettings } from './repositories/settings';
import { getCategories } from './repositories/categories';
import { getRecurringConfigs } from './repositories/recurrence';



export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const [transactions, accounts, settings, categoriesList] = await Promise.all([
      transactionService.fetchTransactions(),
      getAccounts(),
      getSettings(),
      getCategories()
    ]);

    const now = new Date();
    const currentMonth = now.getUTCMonth() + 1; // 1-12
    const currentYear = now.getUTCFullYear();

    let netBalance = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
    let totalIncome = 0;
    let totalExpense = 0;
    let currentMonthExpense = 0;

    const categoryTotals: Record<string, number> = {};

    // Calculate Cash Flow (Income vs Expense)
    transactions.forEach((t: any) => {
      // Data is already normalized by transactionService
      const val = t.amount || 0;
      const type = t.type; // Already uppercase

      if (type === 'INCOME') {
        totalIncome += val;
        netBalance += val;
      } else if (type === 'EXPENSE') {
        totalExpense += val;
        netBalance -= val;

        // Map category ID to Name
        const catObj = categoriesList.find(c => c.id === t.category_id);
        const catName = catObj ? catObj.name : 'Outros';
        categoryTotals[catName] = (categoryTotals[catName] || 0) + val;

        // Calculate current month expense
        const [tYear, tMonth] = t.date.split('-').map(Number);
        if (tYear === currentYear && tMonth === currentMonth) {
          currentMonthExpense += val;
        }
      }
    });

    // Calculate Account Balances (Patrimony)
    const accountsSummary: AccountSummary[] = accounts.map(account => {
      const accountTransactions = transactions.filter((t: any) => t.account_id === account.id || (!t.account_id && account.id === 'default-wallet'));

      const flow = accountTransactions.reduce((acc: number, t: any) => {
        const tVal = t.amount || 0;
        const tType = t.type;
        return acc + (tType === 'INCOME' ? tVal : -tVal);
      }, 0);

      return {
        ...account,
        currentBalance: (Number(account.balance) || 0) + flow
      };
    });

    const categories: CategorySummary[] = Object.entries(categoryTotals)
      .map(([category, total], index) => {
        // category is the Name here
        const catObj = categoriesList.find(c => c.name === category);
        return {
          category,
          total,
          percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
          color: catObj?.color || COLORS[index % COLORS.length],
          icon: catObj?.icon || '📦'
        };
      })
      .sort((a, b) => b.total - a.total);

    const summary: Omit<DashboardSummary, 'insights'> = {
      netBalance,
      totalIncome,
      totalExpense,
      currentMonthExpense,
      budgetLimit: settings.budgetLimit || 0,
      categories,
      accounts: accountsSummary
    };

    const insights = generateInsights(transactions, summary as DashboardSummary, categoriesList);

    return { ...summary, insights };
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
    const transactions = await transactionService.fetchTransactions();

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
        const rawValue = t.amount || 0;
        const val = Number(rawValue);
        const type = t.type;

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