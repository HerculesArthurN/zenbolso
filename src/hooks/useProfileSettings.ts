import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface FinancialProfile {
    monthlyIncome: number;
    workHoursPerMonth: number;
    monthlyBudgetLimit: number;
}

const DEFAULT_PROFILE: FinancialProfile = {
    monthlyIncome: 0,
    workHoursPerMonth: 160,
    monthlyBudgetLimit: 0,
};

export const useProfileSettings = () => {
    const [profile, setProfile] = useState<FinancialProfile>(DEFAULT_PROFILE);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            try {
                // Try to load from localStorage first (Guest First approach)
                const localData = localStorage.getItem('zenbolso_profile');
                if (localData) {
                    setProfile(JSON.parse(localData));
                }

                // If user is logged in, try to sync with Supabase
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('monthly_income, work_hours, budget_limit')
                        .eq('id', user.id)
                        .single();

                    if (!error && data) {
                        const syncedProfile = {
                            monthlyIncome: data.monthly_income || 0,
                            workHoursPerMonth: data.work_hours || 160,
                            monthlyBudgetLimit: data.budget_limit || 0,
                        };
                        setProfile(syncedProfile);
                        localStorage.setItem('zenbolso_profile', JSON.stringify(syncedProfile));
                    }
                }
            } catch (err) {
                console.error('Failed to load profile settings:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, []);

    const updateProfile = async (updates: Partial<FinancialProfile>) => {
        const newProfile = { ...profile, ...updates };
        setProfile(newProfile);
        localStorage.setItem('zenbolso_profile', JSON.stringify(newProfile));

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Attempt to update Supabase if table exists
                await supabase.from('profiles').upsert({
                    id: user.id,
                    monthly_income: newProfile.monthlyIncome,
                    work_hours: newProfile.workHoursPerMonth,
                    budget_limit: newProfile.monthlyBudgetLimit,
                    updated_at: new Date().toISOString(),
                });
            }
        } catch (err) {
            // Silently fail if table doesn't exist or network error
            console.warn('Supabase profile update failed (expected if table missing):', err);
        }
    };

    return { profile, updateProfile, isLoading };
};
