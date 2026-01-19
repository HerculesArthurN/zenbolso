import { render, screen } from '@testing-library/react';
import { ZenInsightsCard } from '../ZenInsightsCard';
import { useProfileSettings } from '../../../hooks/useProfileSettings';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { Transaction } from '../../../types';

// Mock the hook
vi.mock('../../../hooks/useProfileSettings', () => ({
    useProfileSettings: vi.fn()
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('ZenInsightsCard', () => {
    const currentMonth = new Date().getUTCMonth();
    const currentYear = new Date().getUTCFullYear();

    // Create a date that will definitely match in UTC
    const date = new Date(Date.UTC(currentYear, currentMonth, 15)).toISOString();

    const mockTransactions: Transaction[] = [
        {
            id: 't1',
            amount: 100,
            date: date,
            type: 'EXPENSE',
            user_id: 'u1',
            account_id: 'a1',
            category_id: 'c1',
            is_paid: true,
            created_at: '',
            updated_at: '',
            description: 'Lunch'
        }
    ];

    it('renders the correct "Hourly Rate" calculation based on props/mock', () => {
        (useProfileSettings as any).mockReturnValue({
            profile: { monthlyIncome: 5000, workHoursPerMonth: 160 },
            isLoading: false
        });

        render(
            <MemoryRouter>
                <ZenInsightsCard transactions={mockTransactions} />
            </MemoryRouter>
        );

        // Hourly rate = 5000 / 160 = 31.25
        // Total expenses this month = 100
        // Time cost = 100 / 31.25 = 3.2

        expect(screen.getByText(/3\.2/)).toBeInTheDocument();
        expect(screen.getByText(/horas/i)).toBeInTheDocument();
    });

    it('renders the "Time Cost" correctly for different inputs', () => {
        (useProfileSettings as any).mockReturnValue({
            profile: { monthlyIncome: 2000, workHoursPerMonth: 100 },
            isLoading: false
        });

        // Hourly rate = 2000 / 100 = 20
        // Expense = 100 -> Cost = 100 / 20 = 5.0 hours

        render(
            <MemoryRouter>
                <ZenInsightsCard transactions={mockTransactions} />
            </MemoryRouter>
        );

        // Check that "5.0" appears specifically in the hours display
        const hoursElement = screen.getByText((_content, element) => {
            const hasText = element?.textContent?.includes('5.0');
            const isDiv = element?.tagName.toLowerCase() === 'div';
            const className = element?.getAttribute('class') || '';
            const hasClass = className.includes('text-4xl');
            return !!(hasText && isDiv && hasClass);
        });

        expect(hoursElement).toBeInTheDocument();
    });

    it('shows the CTA button if profile data is missing (null state)', () => {
        (useProfileSettings as any).mockReturnValue({
            profile: { monthlyIncome: 0, workHoursPerMonth: 0 },
            isLoading: false
        });

        render(
            <MemoryRouter>
                <ZenInsightsCard transactions={[]} />
            </MemoryRouter>
        );

        expect(screen.getByText(/Quanto vale seu tempo\?/i)).toBeInTheDocument();
        expect(screen.getByText(/Configurar Agora/i)).toBeInTheDocument();
    });
});
