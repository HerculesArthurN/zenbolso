import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Transaction } from '../types';
import { processRecurringTransactions } from '../services/recurrence';
import { useToast } from './ToastContext';
import { useFinanceMutations, useBadges } from '../hooks/useFinanceData';

interface DataContextType {
  // UI State handled globally
  isTransactionModalOpen: boolean;
  openTransactionModal: (transaction?: Transaction) => void;
  closeTransactionModal: () => void;
  transactionToEdit: Transaction | null;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const { refreshAll } = useFinanceMutations();
  const badges = useBadges();
  
  // UI State
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  // Gamification Notification Logic
  const prevUnlockedBadgesRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
      const currentUnlocked = new Set(badges.filter(b => b.unlocked).map(b => b.id));
      if (prevUnlockedBadgesRef.current.size > 0) {
          currentUnlocked.forEach(id => {
              if (!prevUnlockedBadgesRef.current.has(id)) {
                  const badge = badges.find(b => b.id === id);
                  if (badge) {
                      addToast(`Conquista Desbloqueada: ${badge.name}!`, 'success', 5000);
                  }
              }
          });
      }
      prevUnlockedBadgesRef.current = currentUnlocked;
  }, [badges, addToast]);

  // Process Recurring Transactions on Mount
  useEffect(() => {
    const initRecurring = async () => {
        const result = await processRecurringTransactions();
        if (result.createdCount > 0) {
            addToast(`${result.createdCount} transações recorrentes foram geradas.`, 'info');
            refreshAll();
        }
    };
    initRecurring();
  }, []); // Run once on mount

  const openTransactionModal = (t?: Transaction) => {
    setTransactionToEdit(t || null);
    setIsTransactionModalOpen(true);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setTransactionToEdit(null);
  };

  return (
    <DataContext.Provider value={{
      isTransactionModalOpen,
      openTransactionModal,
      closeTransactionModal,
      transactionToEdit,
      refreshData: async () => { await refreshAll(); }
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};