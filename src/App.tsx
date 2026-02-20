import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { AppLayout } from './components/layout/AppLayout';
import { SessionProvider, useSession } from './contexts/SessionContext'; // Renamed import
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Static Imports (Critical Path)
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';

import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Lazy Imports (Secondary / Heavy)
const TransactionsPage = lazy(() => import('../pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const Planning = lazy(() => import('../pages/Planning').then(m => ({ default: m.Planning })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const RecurringPage = lazy(() => import('./pages/RecurringPage').then(m => ({ default: m.RecurringPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const AppRoutes: React.FC = () => {
    const { hasSeenOnboarding } = useSession();

    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    {/* Default Route: Check onboarding status */}
                    <Route path="/" element={
                        hasSeenOnboarding ? <Navigate to="/dashboard" replace /> : <LandingPage />
                    } />

                    {/* App Routes - Now Publicly Accessible */}
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/transactions" element={<TransactionsPage />} />
                        <Route path="/planning" element={<Planning />} />
                        <Route path="/recurring" element={<RecurringPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Route>

                    {/* Catch-all */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
};

import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ReloadPrompt } from './components/pwa/ReloadPrompt';

const App: React.FC = () => {
    return (
        <SessionProvider>
            <ThemeProvider>
                <ToastProvider>
                    <DataProvider>
                        <BrowserRouter>
                            {/* Mobile Constraint Wrapper */}
                            <div className="min-h-screen bg-slate-200 flex justify-center items-start font-sans">
                                <div className="w-full max-w-[430px] min-h-screen bg-slate-50 shadow-2xl relative overflow-x-hidden">
                                    <AppRoutes />
                                </div>
                            </div>
                            <ReloadPrompt />
                        </BrowserRouter>
                    </DataProvider>
                </ToastProvider>
            </ThemeProvider>
        </SessionProvider>
    );
};


export default App;
