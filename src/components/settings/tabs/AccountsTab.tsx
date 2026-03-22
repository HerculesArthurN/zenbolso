import React from 'react';
import { Wallet, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Account } from '../../../types';

interface AccountsTabProps {
  accounts: Account[];
  newAccountName: string;
  newAccountBalance: string;
  onNameChange: (val: string) => void;
  onBalanceChange: (val: string) => void;
  onAddAccount: () => void;
  onDeleteAccount: (id: string) => void;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({
  accounts,
  newAccountName,
  newAccountBalance,
  onNameChange,
  onBalanceChange,
  onAddAccount,
  onDeleteAccount,
}) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <input
        type="text"
        placeholder="Nome da Conta (Ex: Nubank)"
        value={newAccountName}
        onChange={e => onNameChange(e.target.value)}
        className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl"
      />
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Saldo Inicial"
          value={newAccountBalance}
          onChange={e => onBalanceChange(e.target.value)}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl"
        />
        <Button onClick={onAddAccount} size="icon">
          <Plus size={20} />
        </Button>
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="text-xs font-bold text-gray-500 uppercase">Contas Ativas</h3>
      {accounts.map(acc => (
        <div
          key={acc.id}
          className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
              <Wallet size={16} />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">{acc.name}</p>
              <p className="text-xs text-gray-400">Saldo: R$ {acc.balance.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={() => onDeleteAccount(acc.id)}
            className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  </div>
);
