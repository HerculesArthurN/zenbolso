import { RRule } from 'rrule';
import { RecurringConfig } from '../types';

export interface DailyForecast {
  date: string;
  label: string;
  income: number;
  expense: number;
  balance: number; // Accumulated balance
}

export const calculateForecast = (
  currentBalance: number,
  recurringConfigs: RecurringConfig[],
  daysToProject: number = 30
): DailyForecast[] => {
  const forecast: DailyForecast[] = [];
  const now = new Date();

  // Normalize "today" to start of day for comparison
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + daysToProject);

  // 1. Map all occurrences for the period
  const dailyChanges: Record<string, { income: number, expense: number }> = {};

  recurringConfigs.forEach(config => {
    if (!config.active) return;

    try {
      const rule = RRule.fromString(config.rruleString);
      // Get dates between tomorrow and end date (don't project today as it's assumed handled or in current balance)
      const projectionStart = new Date(startDate);
      projectionStart.setDate(projectionStart.getDate() + 1);

      const occurrences = rule.between(projectionStart, endDate, true);

      occurrences.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        if (!dailyChanges[dateStr]) {
          dailyChanges[dateStr] = { income: 0, expense: 0 };
        }

        if (config.type.toLowerCase() === 'income') {
          dailyChanges[dateStr].income += Number(config.value) || 0;
        } else {
          dailyChanges[dateStr].expense += Number(config.value) || 0;
        }
      });
    } catch (e) {
      console.error("Error calculating forecast for rule", config.id, e);
    }
  });

  // 2. Build the cumulative forecast array
  let runningBalance = currentBalance;

  for (let i = 0; i <= daysToProject; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    const change = dailyChanges[dateStr] || { income: 0, expense: 0 };

    // Update running balance (Simulating future state)
    runningBalance += change.income - change.expense;

    forecast.push({
      date: dateStr,
      label: dayLabel,
      income: change.income,
      expense: change.expense,
      balance: runningBalance
    });
  }

  return forecast;
};