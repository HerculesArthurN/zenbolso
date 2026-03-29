import React, { createContext, useContext, useEffect, useState } from 'react';
import { useProfileSettings, FinancialProfile } from '../hooks/useProfileSettings';

interface SessionContextType {
    profile: FinancialProfile;
    isLoading: boolean;
    hasSeenOnboarding: boolean;
    completeOnboarding: () => void;
}

const SessionContext = createContext<SessionContextType>({} as SessionContextType);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { profile, isLoading: profileLoading } = useProfileSettings();
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
    const [isSessionLoading, setIsSessionLoading] = useState(true);

    useEffect(() => {
        const onboarded = localStorage.getItem('zenbolso_intro_seen');
        setHasSeenOnboarding(!!onboarded);
        setIsSessionLoading(false);
    }, []);

    const completeOnboarding = () => {
        localStorage.setItem('zenbolso_intro_seen', 'true');
        setHasSeenOnboarding(true);
    };

    const isLoading = profileLoading || isSessionLoading;

    return (
        <SessionContext.Provider value={{
            profile,
            isLoading,
            hasSeenOnboarding,
            completeOnboarding,
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => useContext(SessionContext);
// Alias for backward compatibility if needed, but prefer useSession
export const useAuth = useSession;
