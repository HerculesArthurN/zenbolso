import { Transaction, Insight, DashboardSummary, Category } from '../types';

export const generateInsights = (
    transactions: Transaction[],
    summary: DashboardSummary,
    categories: Category[]
): Insight[] => {
    const insights: Insight[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Helper: Get available income (Net or Total Income)
    // We use total income to calculate ratios
    const incomeBase = summary.totalIncome > 0 ? summary.totalIncome : 1; // Avoid div by zero

    // 1. Budget Analysis
    if (summary.budgetLimit > 0) {
        const percentage = (summary.currentMonthExpense / summary.budgetLimit) * 100;

        if (percentage > 90) {
            insights.push({
                id: 'budget-alert',
                type: 'alert',
                title: 'Atenção ao Orçamento',
                message: `Você já consumiu ${Math.round(percentage)}% do seu limite mensal. Restam R$ ${(summary.budgetLimit - summary.currentMonthExpense).toFixed(2)}.`,
                icon: 'AlertTriangle'
            });
        } else if (percentage < 50 && now.getDate() > 20) {
            insights.push({
                id: 'budget-good',
                type: 'success',
                title: 'Economia à vista',
                message: `Ótimo trabalho! Estamos no dia ${now.getDate()} e você usou menos da metade do orçamento.`,
                icon: 'TrendingUp'
            });
        }
    }

    // 2. DETECTOR DE RALOS (LEAK DETECTOR) - Delivery
    const deliveryKeywords = ['ifood', 'uber eats', 'rappi', 'delivery', 'lanche', 'pizza', 'hamburguer', 'mcdonalds'];
    const deliverySpend = transactions.reduce((acc, t) => {
        // Adjust timezone if needed, or just use UTC components if date string is YYYY-MM-DD
        const [tYear, tMonth] = t.date.split('-').map(Number);
        // tMonth is 1-indexed. currentMonth is 0-indexed.

        if ((tMonth - 1) === currentMonth && tYear === currentYear && t.type === 'EXPENSE') {
            const desc = t.description?.toLowerCase() || '';

            const catObj = categories.find(c => c.id === t.category_id);
            const catName = catObj?.name.toLowerCase() || '';

            if (catName === 'alimentação' || catName === 'lazer') {
                if (deliveryKeywords.some(k => desc.includes(k))) {
                    return acc + t.amount;
                }
            }
        }
        return acc;
    }, 0);

    if (deliverySpend > (incomeBase * 0.10)) {
        insights.push({
            id: 'leak-delivery',
            type: 'alert',
            title: 'Alerta de Delivery',
            message: `Você gastou R$ ${deliverySpend.toFixed(0)} com entregas este mês. Isso é ${(deliverySpend / incomeBase * 100).toFixed(1)}% da sua renda!`,
            icon: 'AlertTriangle'
        });
    }

    // 3. DETOX DE ASSINATURAS (Digital Subscriptions)
    const subscriptionKeywords = ['netflix', 'spotify', 'amazon prime', 'hbo', 'disney', 'apple', 'google storage', 'youtube', 'adobe', 'chatgpt'];
    let subSpend = 0;

    transactions.forEach(t => {
        const [tYear, tMonth] = t.date.split('-').map(Number);

        if ((tMonth - 1) === currentMonth && tYear === currentYear && t.type === 'EXPENSE') {
            const desc = t.description?.toLowerCase() || '';
            const catObj = categories.find(c => c.id === t.category_id);
            const catName = catObj?.name.toLowerCase() || '';

            if (catName === 'assinaturas' || subscriptionKeywords.some(k => desc.includes(k))) {
                subSpend += t.amount;
            }
        }
    });

    if (subSpend > 0) {
        const annualized = subSpend * 12;
        insights.push({
            id: 'leak-subs',
            type: 'info',
            title: 'Detox Digital',
            message: `Você gasta R$ ${subSpend.toFixed(0)}/mês em serviços digitais (~R$ ${annualized.toFixed(0)}/ano). Vale revisar se usa todos.`,
            icon: 'Trash2' // Trash icon metaphor for "Cleaning"
        });
    }

    // 4. BENCHMARKING PESSOAL (Eu do Passado) - TOTAL & CATEGORIA
    const todayDay = now.getDate();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthIdx = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    // -- A. Totals Comparison --
    let currentMonthToDate = 0;
    let lastMonthToDate = 0;

    // -- B. Category Comparison Setup --
    const currentCategoryTotals: Record<string, number> = {};
    const lastCategoryTotals: Record<string, number> = {};

    transactions.forEach(t => {
        if (t.type !== 'EXPENSE') return;

        const [tYear, tMonth, tDay] = t.date.split('-').map(Number);
        // tMonth is 1-indexed.

        const catObj = categories.find(c => c.id === t.category_id);
        const catName = catObj?.name || 'Outros';

        // Current Month Logic
        if ((tMonth - 1) === currentMonth && tYear === currentYear && tDay <= todayDay) {
            currentMonthToDate += t.amount;
            currentCategoryTotals[catName] = (currentCategoryTotals[catName] || 0) + t.amount;
        }

        // Last Month Logic
        if ((tMonth - 1) === lastMonthIdx && tYear === lastMonthYear && tDay <= todayDay) {
            lastMonthToDate += t.amount;
            lastCategoryTotals[catName] = (lastCategoryTotals[catName] || 0) + t.amount;
        }
    });

    // Insight: Total Comparison
    if (lastMonthToDate > 0) {
        const diff = currentMonthToDate - lastMonthToDate;
        if (diff < 0) {
            insights.push({
                id: 'benchmark-good',
                type: 'success',
                title: 'Melhor que o "Eu do Passado"',
                message: `Nesta mesma altura do mês passado, você tinha gasto R$ ${Math.abs(diff).toFixed(0)} a mais. Parabéns pelo controle!`,
                icon: 'TrendingDown'
            });
        } else if (diff > (lastMonthToDate * 0.15)) { // 15% worse
            insights.push({
                id: 'benchmark-bad',
                type: 'alert',
                title: 'Gastos Acelerados',
                message: `Cuidado: Você já gastou R$ ${diff.toFixed(0)} a mais que no mês passado nesta mesma data.`,
                icon: 'TrendingUp'
            });
        }
    }

    // Insight: Category Specific Comparison (Inflation/Excess)
    // Find the category with biggest spending this month
    const topCategories = Object.entries(currentCategoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3); // Check top 3

    for (const [catName, currentVal] of topCategories) {
        const lastVal = lastCategoryTotals[catName] || 0;

        // Only check if significant amount (> 50 BRL) and exists last month
        if (lastVal > 50 && currentVal > 50) {
            const catDiffPercent = ((currentVal - lastVal) / lastVal) * 100;
            const diffVal = currentVal - lastVal;

            if (catDiffPercent > 20) { // 20% increase
                insights.push({
                    id: `benchmark-cat-${catName}`,
                    type: 'info',
                    title: `Aumento em ${catName}`,
                    message: `Sua conta de ${catName} está ${Math.round(catDiffPercent)}% maior (+R$${diffVal.toFixed(0)}) que no mês passado. Inflação ou excessos?`,
                    icon: 'BarChart2'
                });
                break; // Only show one category insight to avoid spam
            }
        }
    }

    // Fallback neutral
    if (insights.length === 0) {
        insights.push({
            id: 'neutral-tip',
            type: 'neutral',
            title: 'Dica do Dia',
            message: 'Experimente a ferramenta "Simular Compra" antes de grandes aquisições.',
            icon: 'Lightbulb'
        });
    }

    return insights;
};