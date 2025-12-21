import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { SETUP_KEY } from '../../constants';

/**
 * Guard: RequireSetup
 * Protege rotas internas do app.
 * A única exigência agora é que o usuário tenha completado o "Start" (Setup).
 * Autenticação (Login Google) é opcional e não bloqueia o acesso.
 */
export const RequireSetup = () => {
    const isSetup = localStorage.getItem(SETUP_KEY) === 'true';

    if (!isSetup) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

/**
 * Guard: PublicOnly
 * Usado na Landing Page.
 * Se o usuário já fez o setup, ele deve ser redirecionado ao Dashboard.
 */
export const PublicOnly = ({ children }: { children: React.ReactNode }) => {
    const isSetup = localStorage.getItem(SETUP_KEY) === 'true';

    if (isSetup) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
