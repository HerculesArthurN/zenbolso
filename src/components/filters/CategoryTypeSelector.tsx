import React from 'react';
import { TransactionType } from '../../types';

interface CategoryTypeSelectorProps {
    type?: TransactionType | 'ALL';
    categoryId?: string;
    onTypeChange: (val: TransactionType | 'ALL') => void;
    onCategoryChange: (val: string) => void;
    availableCategories: { name: string; type: TransactionType }[];
}

export const CategoryTypeSelector: React.FC<CategoryTypeSelectorProps> = ({
    type,
    categoryId,
    onTypeChange,
    onCategoryChange,
    availableCategories
}) => {
    // Flatten categories based on selected type
    const categoriesToShow = React.useMemo(() => {
        let cats = availableCategories;
        if (type && type !== 'ALL') {
            cats = availableCategories.filter(c => c.type === type);
        }
        return Array.from(new Set(cats.map(c => c.name))).sort();
    }, [type, availableCategories]);

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-end">
            {/* Type Filter */}
            <div className="relative flex-1 w-full">
                <label className="block text-[10px] font-medium text-slate-400 uppercase mb-1 ml-1">Tipo</label>
                <div className="relative">
                    <select
                        value={type || 'ALL'}
                        onChange={(e) => onTypeChange(e.target.value as TransactionType | 'ALL')}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="ALL">Todos</option>
                        <option value="INCOME">Receitas</option>
                        <option value="EXPENSE">Despesas</option>
                        <option value="TRANSFER">Transferências</option>
                    </select>
                </div>
            </div>

            {/* Category Filter */}
            <div className="relative flex-1 w-full">
                <label className="block text-[10px] font-medium text-slate-400 uppercase mb-1 ml-1">Categoria</label>
                <div className="relative">
                    <select
                        value={categoryId || 'ALL'}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="ALL">Todas</option>
                        {categoriesToShow.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
