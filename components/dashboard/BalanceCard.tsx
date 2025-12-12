import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface BalanceCardProps {
  netBalance: number;
  income: number;
  expense: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ netBalance, income, expense }) => {
  const [visible, setVisible] = React.useState(true);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="bg-gradient-to-br from-[#004D40] to-[#00695C] dark:from-slate-800 dark:to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-glow relative overflow-hidden group">
        {/* Background Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex justify-between items-start mb-2 relative z-10">
          <h3 className="text-teal-100/70 text-sm font-medium uppercase tracking-wider">Saldo Líquido</h3>
          <button onClick={() => setVisible(!visible)} className="text-teal-100/70 hover:text-white transition-colors">
            {visible ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        <div className="relative z-10 mb-8">
          <span className="text-4xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-sm">
            {visible ? formatCurrency(netBalance) : 'R$ •••••••'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-income-dark"></div>
              <span className="text-xs text-teal-100/80">Receitas</span>
            </div>
            <p className="font-semibold text-lg text-income-dark">
               {visible ? formatCurrency(income) : '•••••'}
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-expense-dark"></div>
              <span className="text-xs text-teal-100/80">Despesas</span>
            </div>
            <p className="font-semibold text-lg text-expense-dark">
              {visible ? formatCurrency(expense) : '•••••'}
            </p>
          </div>
        </div>
    </div>
  );
};