import { useState, useEffect } from 'react';

export interface FinancialProfile {
    monthlyIncome: number;
    workHoursPerMonth: number;
    monthlyBudgetLimit: number;
    mainCurrency: string; // ISO 4217 currency code (BRL, USD, EUR, etc.)
}

const DEFAULT_PROFILE: FinancialProfile = {
    monthlyIncome: 0,
    workHoursPerMonth: 160,
    monthlyBudgetLimit: 0,
    mainCurrency: 'BRL',
};

export const useProfileSettings = () => {
    const [profile, setProfile] = useState<FinancialProfile>(DEFAULT_PROFILE);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            try {
                // Load from localStorage (Local-First)
                const localData = localStorage.getItem('zenbolso_profile');
                if (localData) {
                    setProfile(JSON.parse(localData));
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
    };

    return { profile, updateProfile, isLoading };
};
