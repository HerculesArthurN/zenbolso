import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useTransactionsQuery, useCategoriesQuery, useAccountsQuery, useFinanceMutations } from '../hooks/useFinanceData';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionFilters, FilterState } from '../components/transactions/TransactionFilters';
import { SummaryChart } from '../components/dashboard/SummaryChart';
import { COLORS } from '../constants';
import { ImportModal } from '../components/transactions/ImportModal';
import { Wand2 } from 'lucide-react';
import { postTransaction, removeTransaction } from '../services/api';
import { useToast } from '../context/ToastContext';

export const TransactionsPage: React.FC = () => {
  const { openTransactionModal } = useData();
  const { refreshTransactions } = useFinanceMutations();
  const { data: transactions = [], isLoading } = useTransactionsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: accounts = [] } = useAccountsQuery();
  
  const { addToast } = useToast();
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    return {
      searchQuery: '',
      startDate: formatDate(start),
      endDate: formatDate(end),
      type: 'all',
      category: 'all',
      tags: []
    };
  });

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filters.startDate && t.date < filters.startDate) return false;
      if (filters.endDate && t.date > filters.endDate) return false;
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.category !== 'all' && t.category !== filters.category) return false;
      if (filters.tags && filters.tags.length > 0) {
        if (!t.tags || t.tags.length === 0) return false;
        const hasMatchingTag = filters.tags.some(tag => t.tags?.includes(tag));
        if (!hasMatchingTag) return false;
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesCategory = t.category.toLowerCase().includes(query);
        const matchesDescription = t.description?.toLowerCase().includes(query) || false;
        if (!matchesCategory && !matchesDescription) return false;
      }
      return true;
    });
  }, [transactions, filters]);

  const dynamicCategories = useMemo(() => {
    const totals: Record<string, number> = {};
    let totalExp = 0;
    filteredTransactions.forEach(t => {
        if (t.type === 'expense') {
            const cat = t.category || 'Outros';
            totals[cat] = (totals[cat] || 0) + t.value;
            totalExp += t.value;
        }
    });
    return Object.entries(totals)
        .map(([category, total], index) => ({
            category,
            total,
            percentage: totalExp > 0 ? (total / totalExp) * 100 : 0,
            color: COLORS[index % COLORS.length]
        }))
        .sort((a, b) => b.total - a.total);
  }, [filteredTransactions]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    transactions.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [transactions]);

  const handleDeleteTransaction = async (id: string) => {
    const transactionToDelete = transactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    try {
        await removeTransaction(id);
        await refreshTransactions();
        addToast('Transação removida.', 'success', 5000, {
            label: 'Desfazer',
            onClick: async () => {
                await postTransaction(transactionToDelete);
                await refreshTransactions();
                addToast('Transação restaurada.', 'info');
            }
        });
    } catch (error) {
        addToast('Erro ao remover.', 'error');
    }
  };

  const handleImport = async (importedTxs: any[]) => {
      try {
          for (const tx of importedTxs) {
              await postTransaction(tx);
          }
          addToast(`${importedTxs.length} transações importadas!`, 'success');
          await refreshTransactions();
          setIsImportOpen(false);
      } catch (e) {
          addToast('Erro na importação', 'error');
      }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between mb-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Extrato</h1>
            <p className="text-slate-500 text-sm">Gerencie suas receitas e despesas.</p>
        </div>
        <button
            onClick={() => setIsImportOpen(true)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title="Importar Inteligente"
        >
            <Wand2 size={20} />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 h-fit md:sticky md:top-6">
             <SummaryChart data={dynamicCategories} />
          </div>

          <div className="md:col-span-2 space-y-4">
             <TransactionFilters 
                filters={filters} 
                onFilterChange={setFilters} 
                availableTags={uniqueTags}
            />

            <div className="flex items-center justify-between px-2">
                <span className="text-xs text-slate-500 uppercase font-medium tracking-wider">
                   {filteredTransactions.length} lançamentos encontrados
                </span>
            </div>

            <TransactionList 
                transactions={filteredTransactions} 
                onDelete={handleDeleteTransaction}
                onEdit={openTransactionModal}
                loading={isLoading}
            />
          </div>
      </div>

      <ImportModal 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
        accounts={accounts}
        categories={categories}
      />
    </div>
  );
};