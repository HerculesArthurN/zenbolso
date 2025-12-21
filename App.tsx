import React from 'react';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { TransactionsPage } from './pages/TransactionsPage';
import { Planning } from './pages/Planning';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ErrorPage } from './pages/ErrorPage';
import { Modal } from './components/ui/Modal';
import { TransactionForm } from './components/transactions/TransactionForm';
import { TransactionRepository } from './services/repositories/transaction.repository';
import { useToast } from './context/ToastContext';
import { Transaction } from './types';
import { getErrorMessage } from './utils/errorMapper';
import { useFinanceMutations } from './hooks/useFinanceData';
import { RequireSetup, PublicOnly } from './src/routes/guards';

// --- MAIN ROUTES COMPONENT ---

const AppRoutes: React.FC = () => {
  const {
    isTransactionModalOpen,
    closeTransactionModal,
    transactionToEdit,
  } = useData();

  const { refreshTransactions } = useFinanceMutations();
  const { addToast } = useToast();

  const handleSaveTransaction = async (transaction: Transaction) => {
    try {
      await TransactionRepository.update(transaction);
      await refreshTransactions();
      addToast('Transação salva com sucesso!', 'success');
      closeTransactionModal();
    } catch (error) {
      console.error(error);
      const msg = getErrorMessage(error);
      addToast(msg, 'error');
    }
  };

  return (
    <>
      <Routes>
        {/* ROTA PÚBLICA: Landing Page (Apenas se não tiver setup) */}
        <Route
          path="/"
          element={
            <PublicOnly>
              <LandingPage />
            </PublicOnly>
          }
        />

        {/* ROTA DE LOGIN (Opcional, mas mantida caso o usuário acesse diretamente) */}
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />

        {/* ROTAS PROTEGIDAS (Apenas Setup Requerido - Login Opcional) */}
        <Route element={<RequireSetup />}>
          <Route
            element={
              <AppLayout>
                <Outlet />
              </AppLayout>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>

      {/* GLOBAL MODAL */}
      {isTransactionModalOpen && (
        <Modal
          isOpen={isTransactionModalOpen}
          onClose={closeTransactionModal}
          title={transactionToEdit ? "Editar Transação" : "Nova Transação"}
        >
          <TransactionForm
            onSave={handleSaveTransaction}
            onCancel={closeTransactionModal}
            initialData={transactionToEdit}
          />
        </Modal>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;