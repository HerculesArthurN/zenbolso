import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { DataProvider } from '../context/DataContext';
import { AppLayout } from '../components/layout/AppLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Static Imports (Critical Path)
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';

import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Lazy Imports (Secondary / Heavy)
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const TransactionsPage = lazy(() => import('../pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const Planning = lazy(() => import('../pages/Planning').then(m => ({ default: m.Planning })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const RecurringPage = lazy(() => import('./pages/RecurringPage').then(m => ({ default: m.RecurringPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));

const AppRoutes: React.FC = () => {
    const { user } = useAuth();
    const hasVisitedBefore = !!localStorage.getItem('zenbolso_intro_seen');

    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={
                        (user || hasVisitedBefore) ? <Navigate to="/dashboard" replace /> : <LandingPage />
                    } />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/admin" element={<AdminPage />} />

                    {/* Protected App Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<AppLayout><Outlet /></AppLayout>}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/transactions" element={<TransactionsPage />} />
                            <Route path="/planning" element={<Planning />} />
                            <Route path="/recurring" element={<RecurringPage />} />
                            <Route path="/reports" element={<ReportsPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Route>
                    </Route>

                    {/* Catch-all */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
};

import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <DataProvider>
                    <BrowserRouter>
                        <AppRoutes />
                    </BrowserRouter>
                </DataProvider>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;
