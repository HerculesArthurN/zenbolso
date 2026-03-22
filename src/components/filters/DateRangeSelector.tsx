import React from 'react';
import { Calendar } from 'lucide-react';
import { DatePreset, formatDateLocal } from '../../utils/datePresets';

interface DateRangeSelectorProps {
    startDate?: Date;
    endDate?: Date;
    onPresetChange: (preset: DatePreset) => void;
    onStartDateChange: (date: Date) => void;
    onEndDateChange: (date: Date) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
    startDate,
    endDate,
    onPresetChange,
    onStartDateChange,
    onEndDateChange
}) => {
    return (
        <div className="flex flex-col sm:flex-row gap-3 items-end">
            {/* Preset Select */}
            <div className="relative flex-1 w-full">
                <label className="block text-[10px] font-medium text-slate-400 uppercase mb-1 ml-1">Período</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    <select
                        onChange={(e) => onPresetChange(e.target.value as DatePreset)}
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="CURRENT_MONTH">Este Mês</option>
                        <option value="LAST_7_DAYS">Últimos 7 dias</option>
                        <option value="LAST_30_DAYS">Últimos 30 dias</option>
                        <option value="CUSTOM">Personalizado</option>
                    </select>
                </div>
            </div>

            {/* Start Date */}
            <div className="relative flex-1 w-full">
                <label className="block text-[10px] font-medium text-slate-400 uppercase mb-1 ml-1">De</label>
                <input
                    type="date"
                    value={startDate ? formatDateLocal(startDate) : ''}
                    onChange={(e) => onStartDateChange(new Date(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
            </div>

            {/* End Date */}
            <div className="relative flex-1 w-full">
                <label className="block text-[10px] font-medium text-slate-400 uppercase mb-1 ml-1">Até</label>
                <input
                    type="date"
                    value={endDate ? formatDateLocal(endDate) : ''}
                    onChange={(e) => onEndDateChange(new Date(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
            </div>
        </div>
    );
};
