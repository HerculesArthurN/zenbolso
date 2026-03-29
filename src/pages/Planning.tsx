import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Target, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Goal } from '../types';
import { goalService } from '../services/goalService';
import { useToast } from '../contexts/ToastContext';
import { useLocaleFormat } from '../hooks/useLocaleFormat';

export const Planning: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { formatCurrency } = useLocaleFormat();
    
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Form states
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [progressAmount, setProgressAmount] = useState('');

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        try {
            setLoading(true);
            const data = await goalService.fetchGoals();
            setGoals(data);
        } catch (error) {
            addToast('Erro ao carregar metas.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !targetAmount) {
            addToast('Preencha os campos obrigatórios.', 'error');
            return;
        }

        try {
            await goalService.createGoal({
                name,
                targetAmount: parseFloat(targetAmount) || 0,
                deadline: deadline || undefined,
            });
            addToast('Meta criada com sucesso!', 'success');
            setIsCreateModalOpen(false);
            setName('');
            setTargetAmount('');
            setDeadline('');
            loadGoals();
        } catch (error) {
            addToast('Erro ao criar meta.', 'error');
        }
    };

    const handleAddProgress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isProgressModalOpen || !progressAmount) return;

        try {
            await goalService.addProgress(isProgressModalOpen, parseFloat(progressAmount) || 0);
            addToast('Progresso registrado!', 'success');
            setIsProgressModalOpen(null);
            setProgressAmount('');
            loadGoals();
        } catch (error) {
            addToast('Erro ao registrar progresso.', 'error');
        }
    };

    const handleDeleteGoal = async (id: string) => {
        if (!confirm('Deseja realmente excluir esta meta?')) return;
        try {
            await goalService.deleteGoal(id);
            addToast('Meta excluída.', 'success');
            loadGoals();
        } catch (error) {
            addToast('Erro ao excluir meta.', 'error');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left pb-20 p-4 md:p-8">
            <header className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95"
                    aria-label="Voltar"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Metas</h1>
                    <p className="text-slate-500 dark:text-slate-400">Acompanhe seus objetivos financeiros.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Nova Meta</span>
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin text-indigo-500"><Target size={32} /></div>
                </div>
            ) : goals.length === 0 ? (
                <div className="text-center py-20 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] border-dashed">
                    <Target size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Nenhuma meta ainda</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">Comece definindo um objetivo para guardar dinheiro (ex: Viagem, Carro, Reserva de Emergência).</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl"
                    >
                        Criar primeira meta
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => {
                        const amount = goal.currentAmount || 0;
                        const percentage = Math.min(100, Math.round((amount / goal.targetAmount) * 100));
                        const isCompleted = amount >= goal.targetAmount;

                        return (
                            <div key={goal.id} className="bg-white dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col group relative overflow-hidden">
                                {isCompleted && (
                                    <div className="absolute top-0 right-0 p-4 bg-emerald-500 text-white rounded-bl-3xl">
                                        <CheckCircle2 size={24} />
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`p-4 rounded-2xl ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'}`}>
                                        <Target size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-lg text-slate-900 dark:text-white">{goal.name}</h3>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                                            {goal.deadline ? `Prazo: ${new Date(goal.deadline).toLocaleDateString()}` : 'Sem prazo'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6 flex-1">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {formatCurrency(amount)}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            de {formatCurrency(goal.targetAmount)}
                                        </span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="text-right text-xs font-black text-indigo-600 dark:text-indigo-400">
                                        {percentage}%
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsProgressModalOpen(goal.id)}
                                        disabled={isCompleted}
                                        className="flex-1 py-3 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <TrendingUp size={18} />
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGoal(goal.id)}
                                        className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal: Create Goal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Nova Meta</h2>
                        <form onSubmit={handleCreateGoal} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ex: Viagem Japão"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Valor Alvo (R$)</label>
                                <input
                                    type="number"
                                    value={targetAmount}
                                    onChange={e => setTargetAmount(e.target.value)}
                                    placeholder="10000"
                                    required
                                    min="1"
                                    step="0.01"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Prazo (Opcional)</label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={e => setDeadline(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-xl"
                                >
                                    Criar Meta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Add Progress */}
            {isProgressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Guardar Dinheiro</h2>
                        <form onSubmit={handleAddProgress} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Valor depositado (R$)</label>
                                <input
                                    type="number"
                                    value={progressAmount}
                                    onChange={e => setProgressAmount(e.target.value)}
                                    placeholder="500"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsProgressModalOpen(null)}
                                    className="w-full py-3 text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="w-full py-3 text-white font-bold bg-emerald-500 rounded-xl"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
