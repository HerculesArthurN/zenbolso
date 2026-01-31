import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface FinancialProfile {
    monthlyIncome: number;
    workHoursPerMonth: number;
    monthlyBudgetLimit: number;
    mainCurrency: string;
}

const DEFAULT_PROFILE: FinancialProfile = {
    monthlyIncome: 0,
    workHoursPerMonth: 160,
    monthlyBudgetLimit: 0,
    mainCurrency: 'BRL',
};

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: FinancialProfile | null;
    loading: boolean;
    isLoading: boolean; // Alias for loading
    isAuthenticated: boolean;
    token: string | null;
    signInWithOtp: (email: string) => Promise<{ error: any }>;
    login: () => void;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<FinancialProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrCreateProfile = async (userId: string) => {
        try {
            // 1. Try to fetch existing profile
            const { data, error } = await supabase
                .from('profiles')
                .select('monthly_income, work_hours, budget_limit, main_currency')
                .eq('id', userId)
                .single();

            if (error && (error.code === 'PGRST116' || error.message?.includes('no rows'))) {
                // 2. Profile missing - Create it (handles potential trigger delay/failure)
                console.warn('Profile not found for user, creating default...');
                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        monthly_income: DEFAULT_PROFILE.monthlyIncome,
                        work_hours: DEFAULT_PROFILE.workHoursPerMonth,
                        budget_limit: DEFAULT_PROFILE.monthlyBudgetLimit,
                        main_currency: DEFAULT_PROFILE.mainCurrency,
                    })
                    .select()
                    .single();

                if (!createError && newProfile) {
                    setProfile({
                        monthlyIncome: newProfile.monthly_income,
                        workHoursPerMonth: newProfile.work_hours || 160,
                        monthlyBudgetLimit: newProfile.budget_limit,
                        mainCurrency: newProfile.main_currency || 'BRL',
                    });
                }
            } else if (data) {
                setProfile({
                    monthlyIncome: data.monthly_income || 0,
                    workHoursPerMonth: data.work_hours || 160,
                    monthlyBudgetLimit: data.budget_limit || 0,
                    mainCurrency: data.main_currency || 'BRL',
                });
            }
        } catch (err) {
            console.error('Critical error fetching profile:', err);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            try {
                // 1. Check active session
                const { data: { session: initialSession } } = await supabase.auth.getSession();

                if (!isMounted) return;

                if (initialSession) {
                    setSession(initialSession);
                    setUser(initialSession.user);
                    await fetchOrCreateProfile(initialSession.user.id);
                }
            } catch (err) {
                console.error('Session initialization error:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initializeAuth();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!isMounted) return;

            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            if (event === 'SIGNED_IN' && currentSession?.user) {
                setLoading(true);
                await fetchOrCreateProfile(currentSession.user.id);
                setLoading(false);
            } else if (event === 'SIGNED_OUT') {
                setProfile(null);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signInWithOtp = async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });
        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setProfile(null);
    };

    const refreshProfile = async () => {
        if (user) await fetchOrCreateProfile(user.id);
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            profile,
            loading,
            isLoading: loading,
            isAuthenticated: !!user,
            token: session?.access_token ?? null,
            signInWithOtp,
            login: () => console.warn('login() is deprecated, use signInWithOtp()'),
            signOut,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
