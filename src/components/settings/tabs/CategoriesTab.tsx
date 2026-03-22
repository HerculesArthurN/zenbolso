import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Category, TransactionType } from '../../../types';
import { CategoryIcon } from '../../ui/CategoryIcon';

interface CategoriesTabProps {
  categories: Category[];
  newCategoryName: string;
  newCategoryType: TransactionType;
  onNameChange: (val: string) => void;
  onTypeChange: (type: TransactionType) => void;
  onAddCategory: () => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  newCategoryName,
  newCategoryType,
  onNameChange,
  onTypeChange,
  onAddCategory,
  onDeleteCategory,
}) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl space-y-3">
      <div className="flex p-1 bg-white dark:bg-gray-900 rounded-lg w-fit">
        <button
          onClick={() => onTypeChange('EXPENSE')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            newCategoryType === 'EXPENSE' ? 'bg-rose-100 text-rose-600' : 'text-gray-500'
          }`}
        >
          Despesa
        </button>
        <button
          onClick={() => onTypeChange('INCOME')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            newCategoryType === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-500'
          }`}
        >
          Receita
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nome da categoria"
          value={newCategoryName}
          onChange={e => onNameChange(e.target.value)}
          className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border-none rounded-xl"
        />
        <Button onClick={onAddCategory} size="icon">
          <Plus size={20} />
        </Button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      {(['EXPENSE', 'INCOME'] as TransactionType[]).map(type => (
        <div key={type}>
          <h3
            className={`text-xs font-bold uppercase mb-2 ${
              type === 'EXPENSE' ? 'text-rose-500' : 'text-emerald-500'
            }`}
          >
            {type === 'EXPENSE' ? 'Despesas' : 'Receitas'}
          </h3>
          <div className="space-y-2">
            {categories
              .filter(c => c.type === type)
              .map(c => (
                <div
                  key={c.id}
                  className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg group"
                >
                  <span className="text-sm flex items-center gap-2">
                    <CategoryIcon iconName={c.icon} color={c.color || '#64748B'} size={16} />
                    {c.name}
                  </span>
                  <button
                    onClick={() => onDeleteCategory(c.id)}
                    className="text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
