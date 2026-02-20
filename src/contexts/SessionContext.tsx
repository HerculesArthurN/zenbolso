import React, { createContext, useContext, useEffect, useState } from 'react';
import { useProfileSettings, FinancialProfile } from '../hooks/useProfileSettings';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface SessionContextType {
    user: User | null;
    profile: FinancialProfile;
    isLoading: boolean;
    hasSeenOnboarding: boolean;
    completeOnboarding: () => void;
    signInWithGoogle: () => Promise<void>;
    signInWithOtp: (email: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({} as SessionContextType);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { profile, isLoading: profileLoading } = useProfileSettings();
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
    const [isSessionLoading, setIsSessionLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const initSession = async () => {
            const onboarded = localStorage.getItem('zenbolso_intro_seen');
            setHasSeenOnboarding(!!onboarded);

            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);

            setIsSessionLoading(false);
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const completeOnboarding = () => {
        localStorage.setItem('zenbolso_intro_seen', 'true');
        setHasSeenOnboarding(true);
    };

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        });
    };

    const signInWithOtp = async (email: string) => {
        return supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`
            }
        });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const isLoading = profileLoading || isSessionLoading;

    return (
        <SessionContext.Provider value={{
            user,
            profile,
            isLoading,
            hasSeenOnboarding,
            completeOnboarding,
            signInWithGoogle,
            signInWithOtp,
            signOut
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => useContext(SessionContext);
// Alias for backward compatibility if needed, but prefer useSession
export const useAuth = useSession;
