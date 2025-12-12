import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext'; // Import Auth
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { TransactionsPage } from './pages/TransactionsPage';
import { Planning } from './pages/Planning';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage'; // Import Login
import { ErrorPage } from './pages/ErrorPage';
import { Modal } from './components/ui/Modal';
import { TransactionForm } from './components/transactions/TransactionForm';
import { postTransaction, updateTransaction } from './services/api';
import { useToast } from './context/ToastContext';
import { Transaction } from './types';
import { getErrorMessage } from './utils/errorMapper';
import { useTransactionsQuery, useFinanceMutations } from './hooks/useFinanceData';
// useGoogleAutoBackup removido pois agora é gerenciado pelo AuthContext

// --- CONSTANTS ---
const SETUP_KEY = '@finance-app:setup-completed';

// --- ROUTE GUARDS ---

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const isSetup = localStorage.getItem(SETUP_KEY) === 'true';

  // Se já fez setup ou está logado, manda pro dashboard
  if (isAuthenticated || isSetup) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const isSetup = localStorage.getItem(SETUP_KEY) === 'true';

  // Permite acesso se estiver autenticado via Google OU tiver feito setup offline
  if (!isAuthenticated && !isSetup) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// --- MAIN ROUTES COMPONENT ---

const AppRoutes: React.FC = () => {
  const { 
    isTransactionModalOpen, 
    closeTransactionModal, 
    transactionToEdit, 
  } = useData();
  
  const { refreshTransactions } = useFinanceMutations();
  const { data: transactions, isLoading } = useTransactionsQuery(); 
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  // Single Source of Truth for Auth State (Offline Mode)
  // Nota: isAuthenticated do AuthContext lida com o modo Online
  const [isSetup] = useState(() => {
      return localStorage.getItem(SETUP_KEY) === 'true';
  });

  const handleStartApp = () => {
     // Redireciona para login em vez de marcar setup imediato
     // O usuário pode escolher "Continuar Offline" na tela de login se quiser
     window.location.href = '/login';
  };

  const handleSaveTransaction = async (t: Transaction) => {
    try {
        if (transactionToEdit) {
            await updateTransaction(t);
            addToast('Transação atualizada!', 'success');
        } else {
            await postTransaction(t);
            addToast('Transação salva!', 'success');
        }
        await refreshTransactions();
        closeTransactionModal();
    } catch (error) {
        console.error(error);
        addToast(getErrorMessage(error), 'error');
    }
  };

  // Loading State to prevent "flicker" of wrong route
  if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="text-slate-400 text-sm animate-pulse">Carregando seus dados...</p>
            </div>
        </div>
      );
  }

  const txList = transactions || [];
  const hasAccess = isSetup || isAuthenticated;

  return (
    <>
      <Routes>
        {/* ROTA PÚBLICA: Landing Page */}
        <Route 
          path="/" 
          element={
            <PublicOnlyRoute>
              <LandingPage onStart={handleStartApp} />
            </PublicOnlyRoute>
          } 
        />

        {/* ROTA DE LOGIN */}
        <Route 
          path="/login" 
          element={
             isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
          } 
        />

        {/* ROTAS PRIVADAS */}
        <Route
          element={
            <PrivateRoute>
              <AppLayout>
                <Outlet />
              </AppLayout>
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>

      {/* GLOBAL MODAL */}
      {hasAccess && (
        <Modal 
          isOpen={isTransactionModalOpen} 
          onClose={closeTransactionModal}
          title={transactionToEdit ? "Editar Transação" : "Nova Transação"}
        >
          <TransactionForm 
              onSave={handleSaveTransaction} 
              onCancel={closeTransactionModal}
              history={txList} 
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