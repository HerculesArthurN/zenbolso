import React from 'react';
import { RecurringTransaction, Account } from '../../types';
import { Calendar, Trash2, Plus, DollarSign, ToggleLeft, ToggleRight, CreditCard } from 'lucide-react';

interface RecurringListProps {
    transactions: RecurringTransaction[];
    accounts: Account[];
    onToggle: (rule: RecurringTransaction) => void;
    onDelete: (id: string) => void;
    onOpenForm: () => void;
}

export const RecurringList: React.FC<RecurringListProps> = ({ transactions, accounts, onToggle, onDelete, onOpenForm }) => {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (transactions.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all">
                <div className="bg-slate-50 dark:bg-slate-800/50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Calendar className="text-slate-300 dark:text-slate-600" size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sem automações ainda</h3>
                <p className="text-slate-500 max-w-xs mx-auto mb-8">
                    Adicione contas que se repetem todo mês (Netflix, Aluguel, Salário) para nunca mais esquecer de lançar.
                </p>
                <button
                    onClick={onOpenForm}
                    className="text-indigo-600 font-bold hover:underline"
                >
                    Criar minha primeira regra
                </button>
            </div>
        );
    }

    return (
        <div className="grid gap-4 text-left">
            {transactions.map(rule => {
                const account = accounts.find(a => a.id === rule.account_id);
                return (
                    <div key={rule.id} className={`group bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all hover:shadow-md ${!rule.active && 'opacity-60 grayscale'}`}>
                        <div className="flex items-center gap-5">
                            <div className={`p-4 rounded-2xl ${rule.type === 'INCOME'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                                {rule.type === 'INCOME' ? <Plus size={24} /> : <DollarSign size={24} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">{rule.description}</h4>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                    <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">Todo dia {rule.day_of_month}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                    <span className={`text-sm font-bold ${rule.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                        {formatCurrency(Number(rule.amount) || 0)}
                                    </span>
                                    {account && (
                                        <>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <CreditCard size={10} /> {account.name}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onToggle(rule)}
                                className="p-3 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors"
                                title={rule.active ? "Pausar" : "Ativar"}
                            >
                                {rule.active ? <ToggleRight size={36} className="text-indigo-600" /> : <ToggleLeft size={36} />}
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm('Excluir esta regra de recorrência?')) onDelete(rule.id);
                                }}
                                className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                                title="Excluir"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
