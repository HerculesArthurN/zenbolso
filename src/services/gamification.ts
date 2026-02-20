import { Transaction, DashboardSummary, Badge, Category } from '../types';

export const calculateBadges = (
    transactions: Transaction[],
    summary: DashboardSummary,
    categories: Category[]
): Badge[] => {
    const badges: Badge[] = [];
    const now = new Date();

    // Helper: Count consecutive days with no expenses
    let noSpendStreak = 0;
    for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const hasExpense = transactions.some(t => t.date === dateStr && t.type === 'EXPENSE');
        if (!hasExpense && i === 0 && now.getHours() < 20) {
            continue;
        }
        if (!hasExpense) noSpendStreak++;
        else break;
    }

    // 1. Badge: O Iniciante (First Transaction)
    badges.push({
        id: 'badge-starter',
        key: 'starter',
        name: 'O Início',
        description: 'Adicione sua primeira transação.',
        icon: 'Flag',
        unlocked: transactions.length > 0,
        progress: transactions.length > 0 ? 100 : 0
    });

    // 2. Badge: Poupador (Income > Expense this month)
    const isSaving = summary.totalIncome > summary.totalExpense && summary.totalIncome > 0;
    badges.push({
        id: 'badge-saver',
        key: 'saver',
        name: 'Poupador',
        description: 'Termine o mês com saldo positivo.',
        icon: 'PiggyBank',
        unlocked: isSaving,
        progress: summary.totalIncome > 0 ? Math.min((summary.totalExpense / summary.totalIncome) * 100, 100) : 0
    });

    // 3. Badge: Mestre do Orçamento (Under Budget)
    const hasBudget = summary.budgetLimit > 0;
    const underBudget = hasBudget && summary.currentMonthExpense <= summary.budgetLimit;
    badges.push({
        id: 'badge-budget',
        key: 'budget_master',
        name: 'Mestre do Orçamento',
        description: 'Mantenha os gastos dentro do limite mensal.',
        icon: 'Scale',
        unlocked: hasBudget && underBudget,
        progress: hasBudget ? Math.min((summary.currentMonthExpense / summary.budgetLimit) * 100, 100) : 0
    });

    // 4. Badge: Investidor (Has 'Investimentos' category)
    const hasInvestment = transactions.some(t => {
        const catObj = categories.find(c => c.id === t.category_id);
        const catName = catObj?.name.toLowerCase() || '';
        return catName.includes('investimento') && t.type === 'EXPENSE';
    });
    badges.push({
        id: 'badge-investor',
        key: 'investor',
        name: 'Investidor',
        description: 'Faça seu primeiro aporte em Investimentos.',
        icon: 'TrendingUp',
        unlocked: hasInvestment,
        progress: hasInvestment ? 100 : 0
    });

    // 5. Badge: Ninja (30 Transactions logged)
    badges.push({
        id: 'badge-ninja',
        key: 'ninja',
        name: 'Ninja dos Dados',
        description: 'Registre 30 transações no total.',
        icon: 'Zap',
        unlocked: transactions.length >= 30,
        progress: Math.min((transactions.length / 30) * 100, 100)
    });

    // 6. Badge: Madrugador (Transaction before 8 AM)
    const hasEarlyTx = transactions.some(t => {
        // Very rough check using local time assumption on date string or creation
        // Since we only store YYYY-MM-DD, we can't accurately check time unless we start storing it.
        // Assuming we might have time in updated schemas or just checking if user logs "Café da manhã"
        const desc = t.description?.toLowerCase() || '';
        return desc.includes('café') || desc.includes('padaria') || desc.includes('breakfast');
    });
    badges.push({
        id: 'badge-early-bird',
        key: 'early_bird',
        name: 'Café da Manhã',
        description: 'Registre um gasto com café ou padaria.',
        icon: 'Sun',
        unlocked: hasEarlyTx,
        progress: hasEarlyTx ? 100 : 0
    });

    // 7. Badge: Essencialista (No "Lazer" expenses in month)
    // Check if current month has NO 'Lazer' expenses but HAS other expenses
    const hasLazer = transactions.some(t => {
        const d = new Date(t.date);
        const now = new Date();
        const catObj = categories.find(c => c.id === t.category_id);
        const catName = catObj?.name || '';
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && catName === 'Lazer';
    });
    const hasAnyExpense = summary.currentMonthExpense > 0;

    badges.push({
        id: 'badge-essentialist',
        key: 'essentialist',
        name: 'Foco Total',
        description: 'Passe o mês sem gastos na categoria Lazer.',
        icon: 'Target',
        unlocked: hasAnyExpense && !hasLazer && now.getDate() > 25, // Only award at end of month
        progress: hasLazer ? 0 : Math.min((now.getDate() / 30) * 100, 100)
    });

    return badges;
};