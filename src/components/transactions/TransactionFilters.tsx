import React, { useEffect, useState } from 'react';
import { Filter, X, Search } from 'lucide-react';
import { useTransactionFilters } from '../../hooks/useTransactionFilters';
import { DateRangeSelector } from '../filters/DateRangeSelector';
import { CategoryTypeSelector } from '../filters/CategoryTypeSelector';
import { getCategories } from '../../services/api';
import { TransactionType } from '../../types';
import { formatDateLocal } from '../../utils/datePresets';

export interface FilterState {
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  type?: 'ALL' | TransactionType;
  category?: string;
}

interface TransactionFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({ onFilterChange }) => {
    const { filters, setFilter, applyDatePreset, clearFilters } = useTransactionFilters();
    const [categories, setCategories] = useState<{ name: string; type: TransactionType }[]>([]);

    useEffect(() => {
        getCategories().then((cats: any[]) => setCategories(cats.map((c: any) => ({ name: c.name, type: c.type }))));
    }, []);

    // Sync upwards formatting Dates into 'yyyy-MM-dd' for the API
    useEffect(() => {
        if (onFilterChange) {
            onFilterChange({
                searchQuery: (filters as any).searchQuery || '',
                startDate: filters.startDate ? formatDateLocal(filters.startDate) : '',
                endDate: filters.endDate ? formatDateLocal(filters.endDate) : '',
                type: filters.type || 'ALL',
                category: filters.categoryId || 'ALL'
            });
        }
    }, [filters, onFilterChange]);

    const hasActiveFilters = filters.type || filters.categoryId || (filters as any).searchQuery;

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <Filter size={16} className="text-emerald-500" />
                    <span>Filtros & Busca</span>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 transition-colors"
                    >
                        <X size={14} />
                        Limpar
                    </button>
                )}
            </div>

            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar por descrição ou categoria..."
                    value={(filters as any).searchQuery || ''}
                    onChange={(e) => setFilter('searchQuery' as any, e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <DateRangeSelector
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    onPresetChange={applyDatePreset}
                    onStartDateChange={(d) => setFilter('startDate', d)}
                    onEndDateChange={(d) => setFilter('endDate', d)}
                />

                <CategoryTypeSelector
                    type={filters.type}
                    categoryId={filters.categoryId}
                    onTypeChange={(t) => setFilter('type', t === 'ALL' ? undefined : t)}
                    onCategoryChange={(c) => setFilter('categoryId', c === 'ALL' ? undefined : c)}
                    availableCategories={categories}
                />
            </div>
        </div>
    );
};