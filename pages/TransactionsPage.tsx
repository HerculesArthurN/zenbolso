import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useCategoriesQuery, useAccountsQuery } from '../hooks/useFinanceData';
import { useTransactions } from '../hooks/queries/useTransactions'; // New Hook
import { useTransactionMutations } from '../hooks/queries/useTransactionMutations'; // New Hook
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionFilters, FilterState } from '../components/transactions/TransactionFilters';
import { SummaryChart } from '../components/dashboard/SummaryChart';
import { COLORS } from '../constants';
import { ImportModal } from '../components/transactions/ImportModal';
import { Wand2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const TransactionsPage: React.FC = () => {
  const { openTransactionModal } = useData();
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

  // NEW: Fetching Data using the specific Hook with filters passed down
  // This enables DB-level filtering for date ranges
  const { data: filteredTransactions = [], isLoading } = useTransactions({
      startDate: filters.startDate,
      endDate: filters.endDate,
      type: filters.type === 'all' ? undefined : filters.type,
      category: filters.category === 'all' ? undefined : filters.category,
      tags: filters.tags,
      searchQuery: filters.searchQuery
  });

  // NEW: Mutations Hook
  const { deleteTransaction, addTransaction } = useTransactionMutations();

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
    // We can't access "all" tags easily without fetching all, 
    // so we derive tags from the currently visible set + local cache logic if needed.
    // For now, deriving from visible set is acceptable or we could fetch all tags separately.
    filteredTransactions.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [filteredTransactions]);

  const handleDeleteTransaction = async (id: string) => {
    const transactionToDelete = filteredTransactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    try {
        await deleteTransaction.mutateAsync(id);
        
        addToast('Transação removida.', 'success', 5000, {
            label: 'Desfazer',
            onClick: async () => {
                await addTransaction.mutateAsync(transactionToDelete);
                addToast('Transação restaurada.', 'info');
            }
        });
    } catch (error) {
        // Error handling inside hook
    }
  };

  const handleImport = async (importedTxs: any[]) => {
      try {
          // Process sequentially to maintain order or use bulkAdd in repo
          const promises = importedTxs.map(tx => addTransaction.mutateAsync(tx));
          await Promise.all(promises);
          
          addToast(`${importedTxs.length} transações importadas!`, 'success');
          setIsImportOpen(false);
      } catch (e) {
          addToast('Erro parcial na importação', 'error');
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