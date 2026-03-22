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
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  budgetLimit,
  monthlyIncome,
  workHours,
  onBudgetChange,
  onIncomeChange,
  onWorkHoursChange,
  onBlurSave,
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
  </div>
);
