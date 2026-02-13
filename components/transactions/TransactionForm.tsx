import React from 'react';
import { Transaction } from '../../types';
import { Button } from '../ui/Button';
import { ChevronDown, ChevronUp, Plus, Minus, Repeat, Wallet, CreditCard } from 'lucide-react';
import { useTransactionForm } from '../../hooks/useTransactionForm';
import { CategoryIcon } from '../ui/CategoryIcon';

interface TransactionFormProps {
  onSave: (t: Transaction) => void;
  onCancel: () => void;
  initialData?: Transaction | null;
}

export const TransactionForm: React.FC<TransactionFormProps> = (props) => {
  const { initialData, onCancel } = props;

  const {
    type, setType,
    valueRaw, valueDisplay, handleCurrencyChange,
    category, setCategory,
    description, setDescription,
    date, setDate,
    tags, setTags,
    accountId, setAccountId,
    showAdvanced, setShowAdvanced,
    repeatMode, setRepeatMode,
    frequency, setFrequency,
    installments, setInstallments,
    accounts,
    currentCategories,
    handleSubmit
  } = useTransactionForm(props);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">


      {/* Type Toggle */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <button
          type="button"
          onClick={() => { setType('expense'); setCategory(''); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${type === 'expense'
            ? 'bg-white dark:bg-gray-700 text-rose-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          <Minus size={16} /> Despesa
        </button>
        <button
          type="button"
          onClick={() => { setType('income'); setCategory(''); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${type === 'income'
            ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          <Plus size={16} /> Receita
        </button>
      </div>

      {/* Main Input: Value (Masked) */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          {repeatMode === 'installments' ? 'Valor Total' : 'Valor'}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">R$</span>
          <input
            type="text"
            inputMode="numeric"
            value={valueDisplay}
            onChange={handleCurrencyChange}
            placeholder="0,00"
            className="w-full pl-12 pr-4 py-4 text-3xl font-bold bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-300 transition-all"
          />
        </div>
        {repeatMode === 'installments' && valueRaw > 0 && (
          <p className="text-right text-xs text-gray-500 mt-1">
            {installments}x de R$ {(valueRaw / installments).toFixed(2)}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="animate-in fade-in slide-in-from-top-2 duration-200">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Descrição (Opcional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={type === 'expense' ? "Ex: Uber, Mercado, Netflix..." : "Ex: Salário, Projeto..."}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary placeholder-gray-400"
        />
      </div>

      {/* Account Selection */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
          <Wallet size={12} /> Conta
        </label>
        {accounts.length === 0 ? (
          <p className="text-xs text-rose-500">Nenhuma conta encontrada. Crie uma em Configurações.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {accounts.map(acc => (
              <button
                key={acc.id}
                type="button"
                onClick={() => setAccountId(acc.id)}
                className={`flex-shrink-0 px-3 py-2 text-sm rounded-lg border transition-all ${accountId === acc.id
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500'
                  }`}
              >
                {acc.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Categoria {category && <span className="text-primary font-normal">- {category}</span>}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
          {currentCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.name)}
              className={`px-3 py-2 text-sm rounded-xl border transition-all relative overflow-hidden text-left truncate flex items-center gap-2 ${category === cat.name
                ? 'border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              title={cat.name}
            >
              <CategoryIcon iconName={cat.icon} color={cat.color || '#64748B'} size={18} />
              <span className="truncate">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Repetition Options */}
      {!initialData && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setRepeatMode('none')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${repeatMode === 'none' ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 shadow-sm' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Única
            </button>
            <button
              type="button"
              onClick={() => setRepeatMode('recurring')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border flex items-center gap-1 ${repeatMode === 'recurring' ? 'bg-white dark:bg-gray-700 border-primary text-primary shadow-sm' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Repeat size={12} /> Recorrente
            </button>
            {type === 'expense' && (
              <button
                type="button"
                onClick={() => setRepeatMode('installments')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border flex items-center gap-1 ${repeatMode === 'installments' ? 'bg-white dark:bg-gray-700 border-purple-500 text-purple-600 shadow-sm' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <CreditCard size={12} /> Parcelado
              </button>
            )}
          </div>

          {repeatMode === 'recurring' && (
            <div className="animate-in slide-in-from-top-2 duration-200 pt-2 border-t border-gray-200 dark:border-gray-700">
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'weekly' | 'monthly' | 'yearly')}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
                <option value="yearly">Anualmente</option>
              </select>
            </div>
          )}

          {repeatMode === 'installments' && (
            <div className="animate-in slide-in-from-top-2 duration-200 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-400">Parcelas:</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setInstallments(Math.max(2, installments - 1))} className="p-1 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"><Minus size={14} /></button>
                <span className="text-sm font-bold w-6 text-center">{installments}x</span>
                <button type="button" onClick={() => setInstallments(Math.min(24, installments + 1))} className="p-1 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"><Plus size={14} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors mb-2"
        >
          {showAdvanced ? 'Ocultar detalhes' : 'Mais detalhes (Data, Tags)'}
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {(showAdvanced || initialData) && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tags (Separadas por vírgula)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ex: lazer, fds"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onCancel} type="button">
          Cancelar
        </Button>
        <Button variant="primary" className="flex-1" type="submit">
          {initialData ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};
