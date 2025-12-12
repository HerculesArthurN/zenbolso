import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, Search, Calendar, Tag, Check } from 'lucide-react';
import { TransactionType } from '../../types';
import { getCategories } from '../../services/api';

export interface FilterState {
  searchQuery: string;
  startDate: string;
  endDate: string;
  type: 'all' | TransactionType;
  category: string;
  tags: string[];
}

interface TransactionFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  availableTags: string[];
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({ filters, onFilterChange, availableTags }) => {
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const [allCategories, setAllCategories] = useState<{name: string, type: TransactionType}[]>([]);

  // Load categories
  useEffect(() => {
      getCategories().then(cats => {
          setAllCategories(cats.map(c => ({ name: c.name, type: c.type })));
      });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Flatten categories based on selected type
  const availableCategories = React.useMemo(() => {
    let cats = allCategories;
    if (filters.type !== 'all') {
        cats = allCategories.filter(c => c.type === filters.type);
    }
    return Array.from(new Set(cats.map(c => c.name))).sort();
  }, [filters.type, allCategories]);

  const handleChange = (key: keyof FilterState, value: any) => {
    if (key === 'type') {
      onFilterChange({ ...filters, type: value, category: 'all' });
    } else {
      onFilterChange({ ...filters, [key]: value });
    }
  };

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    handleChange('tags', newTags);
  };

  const formatDateLocal = (d: Date) => {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const now = new Date();
    let start = filters.startDate;
    let end = filters.endDate;

    if (value === 'this_month') {
        start = formatDateLocal(new Date(now.getFullYear(), now.getMonth(), 1));
        end = formatDateLocal(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    } else if (value === 'last_month') {
        start = formatDateLocal(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        end = formatDateLocal(new Date(now.getFullYear(), now.getMonth(), 0));
    } else if (value === 'last_30') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        start = formatDateLocal(d);
        end = formatDateLocal(now);
    } else if (value === 'this_year') {
        start = formatDateLocal(new Date(now.getFullYear(), 0, 1));
        end = formatDateLocal(new Date(now.getFullYear(), 11, 31));
    } else if (value === 'all') {
        start = '';
        end = '';
    }

    onFilterChange({ ...filters, startDate: start, endDate: end });
  };

  const getPresetValue = () => {
    const now = new Date();
    const start = filters.startDate;
    const end = filters.endDate;

    if (!start && !end) return 'all';

    const thisMonthStart = formatDateLocal(new Date(now.getFullYear(), now.getMonth(), 1));
    const thisMonthEnd = formatDateLocal(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    if (start === thisMonthStart && end === thisMonthEnd) return 'this_month';
    
    const lastMonthStart = formatDateLocal(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const lastMonthEnd = formatDateLocal(new Date(now.getFullYear(), now.getMonth(), 0));
    if (start === lastMonthStart && end === lastMonthEnd) return 'last_month';
    
    const thisYearStart = formatDateLocal(new Date(now.getFullYear(), 0, 1));
    const thisYearEnd = formatDateLocal(new Date(now.getFullYear(), 11, 31));
    if (start === thisYearStart && end === thisYearEnd) return 'this_year';

    return 'custom';
  };

  const clearFilters = () => {
    onFilterChange({
      searchQuery: '',
      startDate: '',
      endDate: '',
      type: 'all',
      category: 'all',
      tags: []
    });
  };

  const hasActiveFilters = filters.searchQuery !== '' || filters.startDate !== '' || filters.endDate !== '' || filters.type !== 'all' || filters.category !== 'all' || filters.tags.length > 0;

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
            type="text"
            placeholder="Buscar por descrição ou categoria..."
            value={filters.searchQuery}
            onChange={(e) => handleChange('searchQuery', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Preset Select */}
        <div className="relative col-span-2 sm:col-span-1">
          <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1 ml-1">Período</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            <select
                value={getPresetValue()}
                onChange={handlePresetChange}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
            >
                <option value="custom">Personalizado</option>
                <option value="this_month">Este Mês</option>
                <option value="last_month">Mês Passado</option>
                <option value="last_30">Últimos 30 dias</option>
                <option value="this_year">Este Ano</option>
                <option value="all">Todo o Período</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
          </div>
        </div>

        {/* Start Date */}
        <div className="relative">
          <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1 ml-1">De</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>

        {/* End Date */}
        <div className="relative">
          <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1 ml-1">Até</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1 ml-1">Tipo</label>
          <div className="relative">
            <select
                value={filters.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
            >
                <option value="all">Todos</option>
                <option value="income">Receitas</option>
                <option value="expense">Despesas</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="relative col-span-2 lg:col-span-1">
          <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1 ml-1">Categoria</label>
          <div className="relative">
            <select
                value={filters.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
            >
                <option value="all">Todas</option>
                {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
          </div>
        </div>

        {/* Tags Filter (Multi-select) */}
        <div className="relative col-span-2 lg:col-span-1" ref={tagDropdownRef}>
            <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1 ml-1">Tags</label>
            <button
                type="button"
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                className={`w-full px-3 py-2 text-left bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm transition-all flex items-center justify-between
                ${isTagDropdownOpen ? 'border-emerald-500 ring-2 ring-emerald-500 ring-opacity-20' : 'border-gray-200 dark:border-gray-700'}
                ${filters.tags.length > 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-900 dark:text-white'}`}
            >
                <span className="truncate block">
                    {filters.tags.length === 0 
                        ? 'Todas' 
                        : filters.tags.length === 1 
                            ? filters.tags[0] 
                            : `${filters.tags.length} selecionadas`}
                </span>
                <div className="text-gray-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </button>

            {/* Dropdown Menu */}
            {isTagDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto custom-scrollbar p-1">
                    {availableTags.length === 0 ? (
                        <div className="p-2 text-xs text-gray-400 text-center">Nenhuma tag encontrada</div>
                    ) : (
                        availableTags.map(tag => {
                            const isSelected = filters.tags.includes(tag);
                            return (
                                <div 
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg text-sm transition-colors ${
                                        isSelected 
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' 
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                        isSelected 
                                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                                            : 'border-gray-300 dark:border-gray-600'
                                    }`}>
                                        {isSelected && <Check size={10} strokeWidth={3} />}
                                    </div>
                                    <span>{tag}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};