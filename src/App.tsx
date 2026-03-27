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
const TransactionsPage = lazy(() => import('./pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const Planning = lazy(() => import('./pages/Planning').then(m => ({ default: m.Planning })));
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
                    {/* Isolated About/Landing Route */}
                    <Route path="/about" element={<LandingPage />} />

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
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { AppLockScreen } from './components/security/AppLockScreen';

const App: React.FC = () => {
    return (
        <SessionProvider>
            <ThemeProvider>
                <ToastProvider>
                    <DataProvider>
                        <BrowserRouter>
                            {/* Premium Desktop Canvas / Background */}
                            <div className="fixed inset-0 min-h-screen bg-zinc-950 flex items-center justify-center overflow-hidden font-sans selection:bg-teal-500/30">
                                {/* Ambient Background Blobs */}
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
                                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-600/20 rounded-full blur-[120px] animate-blob"></div>
                                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
                                </div>

                                {/* App Container (Mobile Constraint) */}
                                <div className="relative w-full max-w-[430px] h-full sm:h-[92vh] sm:max-h-[900px] bg-zinc-900 sm:rounded-[40px] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.6)] border-0 sm:border-[8px] border-zinc-900 overflow-hidden flex flex-col z-10 transition-all duration-500">

                                    {/* App Content with Internal Scrolling */}
                                    <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative">
                                        <AppRoutes />
                                    </div>

                                </div>
                            </div>
                            <ReloadPrompt />
                            <InstallPrompt />
                            <OnboardingWizard />
                            <AppLockScreen />
                        </BrowserRouter>
                    </DataProvider>
                </ToastProvider>
            </ThemeProvider>
        </SessionProvider>
    );
};


export default App;
