import React from 'react';
import { Repeat, Trash2 } from 'lucide-react';
import { RecurringConfig } from '../../../types';
import { useLocaleFormat } from '../../../hooks/useLocaleFormat';

interface RecurringTabProps {
  recurringConfigs: RecurringConfig[];
  onDeleteRecurring: (id: string) => void;
}

export const RecurringTab: React.FC<RecurringTabProps> = ({
  recurringConfigs,
  onDeleteRecurring,
}) => {
  const { formatCurrency } = useLocaleFormat();
  
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      {recurringConfigs.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Repeat size={40} className="mx-auto mb-2 opacity-20" />
          <p>Nenhuma transação recorrente.</p>
          <p className="text-xs">Adicione uma ao criar uma nova transação.</p>
        </div>
      ) : (
        recurringConfigs.map(config => (
          <div
            key={config.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  config.type === 'INCOME'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-rose-100 text-rose-600'
                }`}
              >
                <Repeat size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  {config.description || config.category}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(config.value)} •{' '}
                  {config.frequency === 'monthly'
                    ? 'Mensal'
                    : config.frequency === 'weekly'
                    ? 'Semanal'
                    : 'Anual'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDeleteRecurring(config.id)}
              className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))
      )}
    </div>
  );
};
