import React from 'react';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import { Transaction } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Clock, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { safeNumber, safeDivide, safePercentage } from '../../utils/numberUtils';

interface ZenInsightsCardProps {
    transactions: Transaction[];
    loading?: boolean;
}

export const ZenInsightsCard: React.FC<ZenInsightsCardProps> = ({ transactions, loading }) => {
    const navigate = useNavigate();
    const { profile, isLoading: loadingProfile } = useProfileSettings();

    if (loading || loadingProfile) {
        return <div className="h-48 bg-zinc-800 animate-pulse rounded-[32px]" />;
    }

    const hasProfile = profile.monthlyIncome > 0 && profile.workHoursPerMonth > 0;

    if (!hasProfile) {
        return (
            <div className="relative overflow-hidden p-8 rounded-[32px] bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-500/20 group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Clock size={120} />
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="p-2 bg-white/20 w-fit rounded-xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black">Quanto vale seu tempo?</h3>
                        <p className="text-indigo-100 text-sm mt-1 max-w-[200px]">
                            Configure seu perfil financeiro para transformar gastos em horas de vida.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg"
                    >
                        Configurar Agora
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );
    }

    // Calculation Logic
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthExpenses = transactions
        .filter(t => {
            const d = new Date(t.date);
            return t.type === 'EXPENSE' && d.getUTCMonth() === currentMonth && d.getUTCFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + safeNumber(t.amount, 0), 0);

    const monthlyIncome = safeNumber(profile.monthlyIncome, 0);
    const workHours = safeNumber(profile.workHoursPerMonth, 160);

    const hourlyRate = safeDivide(monthlyIncome, workHours, 0);
    const timeCost = safeDivide(monthExpenses, hourlyRate, 0);
    const percentageOfWorkMonth = safePercentage(timeCost, workHours, 0);

    const isExceeded = monthExpenses > monthlyIncome;

    return (
        <div className="relative overflow-hidden p-8 rounded-[40px] bg-gradient-to-br from-zinc-900 to-indigo-950 text-white shadow-2xl border border-white/5">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full -mr-10 -mt-10" />

            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <Clock size={20} className="text-indigo-300" />
                        </div>
                        <h3 className="font-black text-xs uppercase tracking-widest text-indigo-300">Custo de Vida em Tempo</h3>
                    </div>
                    {isExceeded && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 border border-rose-500/30 rounded-full text-[10px] font-black uppercase text-rose-400">
                            <AlertCircle size={12} />
                            Excedido
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <div className="text-4xl font-black tracking-tight">
                        {safeNumber(timeCost, 0).toFixed(1)} <span className="text-xl font-normal text-indigo-300">horas</span>
                    </div>
                    <p className="text-xs font-medium text-zinc-400">
                        {isExceeded
                            ? "Você já gastou mais do que ganha este mês."
                            : `Isso equivale a ${safeNumber(percentageOfWorkMonth, 0).toFixed(1)}% do seu mês trabalhado.`
                        }
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-tighter text-zinc-500">
                        <span>Gastos</span>
                        <span>Renda (R$ {safeNumber(monthlyIncome, 0).toLocaleString()})</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                            className={`h-full transition-all duration-1000 ${isExceeded ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                            style={{ width: `${Math.min(100, safePercentage(monthExpenses, monthlyIncome, 0))}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
