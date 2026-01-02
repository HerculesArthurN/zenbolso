import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const ProtectedRoute: React.FC = () => {
    const { user, loading } = useAuth();

    // Check if user has visited before (Guest Mode permission)
    const hasVisitedBefore = !!localStorage.getItem('zenbolso_intro_seen');

    // If auth is still loading, show our global spinner
    if (loading) {
        return <LoadingSpinner />;
    }

    // Permission Logic: Registered User OR Guest who seen the intro
    const isAuthorized = !!user || hasVisitedBefore;

    if (!isAuthorized) {
        // Redirect to Landing Page if no access
        return <Navigate to="/" replace />;
    }

    // Authorized? Render the child routes
    return <Outlet />;
};
