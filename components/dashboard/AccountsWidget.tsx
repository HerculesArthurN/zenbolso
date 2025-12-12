import React from 'react';
import { AccountSummary } from '../../types';
import { Landmark, Wallet, CreditCard, Banknote } from 'lucide-react';

interface AccountsWidgetProps {
  accounts: AccountSummary[];
}

export const AccountsWidget: React.FC<AccountsWidgetProps> = ({ accounts }) => {
  
  const getIcon = (type: string) => {
      switch(type) {
          case 'checking': return <Landmark size={18} />;
          case 'credit': return <CreditCard size={18} />;
          case 'cash': return <Wallet size={18} />;
          case 'investment': return <Banknote size={18} />;
          default: return <Wallet size={18} />;
      }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const totalPatrimony = accounts.reduce((acc, curr) => acc + curr.currentBalance, 0);

  return (
    <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Suas Contas</h3>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                Total: {formatCurrency(totalPatrimony)}
            </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {accounts.map(account => (
                <div 
                    key={account.id} 
                    className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:border-emerald-500/30 transition-all"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div 
                            className="p-2 rounded-xl text-white shadow-sm"
                            style={{ backgroundColor: account.color }}
                        >
                            {getIcon(account.type)}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium truncate mb-0.5">{account.name}</p>
                        <p className={`font-bold text-sm ${account.currentBalance < 0 ? 'text-rose-500' : 'text-gray-900 dark:text-white'}`}>
                            {formatCurrency(account.currentBalance)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};