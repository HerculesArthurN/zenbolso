import React from 'react';
import { Clock, Briefcase } from 'lucide-react';

interface GeneralTabProps {
  budgetLimit: string;
  monthlyIncome: string;
  workHours: string;
  onBudgetChange: (val: string) => void;
  onIncomeChange: (val: string) => void;
  onWorkHoursChange: (val: string) => void;
  onBlurSave: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  hasPin: boolean;
  onTogglePin: () => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  budgetLimit,
  monthlyIncome,
  workHours,
  onBudgetChange,
  onIncomeChange,
  onWorkHoursChange,
  onBlurSave,
  theme,
  toggleTheme,
  hasPin,
  onTogglePin,
}) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex gap-3 text-blue-800 dark:text-blue-300">
      <Clock size={20} className="flex-shrink-0" />
      <p className="text-sm">
        Defina seu teto de gastos e sua renda para habilitar os cálculos de
        "Custo de Vida" e alertas de orçamento.
      </p>
    </div>

    <div className="grid gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Teto de Gastos Mensal
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
          <input
            type="number"
            value={budgetLimit}
            onChange={e => onBudgetChange(e.target.value)}
            onBlur={onBlurSave}
            placeholder="0,00"
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Renda Mensal (Líquida)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
          <input
            type="number"
            value={monthlyIncome}
            onChange={e => onIncomeChange(e.target.value)}
            onBlur={onBlurSave}
            placeholder="0,00"
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Horas Trabalhadas / Mês
        </label>
        <div className="relative">
          <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="number"
            value={workHours}
            onChange={e => onWorkHoursChange(e.target.value)}
            onBlur={onBlurSave}
            placeholder="160"
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary"
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1 ml-1">
          Usado para calcular quanto vale sua hora de trabalho.
        </p>
      </div>
    </div>

    {/* APARÊNCIA */}
    <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
        Aparência
      </label>
      <div
        onClick={toggleTheme}
        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            Modo {theme === 'dark' ? 'Escuro' : 'Claro'}
          </span>
        </div>
        <div className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'}`}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
        </div>
      </div>
    </div>

    {/* SEGURANÇA */}
    <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
        Segurança
      </label>
      <button
        onClick={onTogglePin}
        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all hover:border-emerald-500 ${
          hasPin
            ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/30'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex flex-col text-left">
          <span className={`font-bold text-sm ${hasPin ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>
            Bloqueio por PIN
          </span>
          <span className={`text-[10px] font-medium ${hasPin ? 'text-rose-500/70' : 'text-gray-500'}`}>
            {hasPin ? 'Ativado (Clique para remover)' : 'Exigir senha ao abrir o app'}
          </span>
        </div>
        <div className={`w-12 h-6 rounded-full relative transition-colors ${hasPin ? 'bg-rose-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
          <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${hasPin ? 'bg-white left-7' : 'bg-gray-400 dark:bg-gray-500 left-1'}`} />
        </div>
      </button>
    </div>
  </div>
);
