import React from 'react';
import { Wand2, Sparkles, Tag, Calendar, Wallet, DollarSign, Repeat } from 'lucide-react';
import { ParsedTransaction } from '../../services/smartParser';

interface SmartInputProps {
  value: string;
  onChange: (val: string) => void;
  isParsing: boolean;
  parsedData: ParsedTransaction | null;
  className?: string;
}

export const SmartInput: React.FC<SmartInputProps> = ({ 
  value, 
  onChange, 
  isParsing, 
  parsedData, 
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
        <div className="relative group">
            {/* Background Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity ${isParsing ? 'animate-pulse' : ''}`}></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-2 px-3 py-1">
                    <Wand2 size={18} className="text-emerald-500 flex-shrink-0" />
                    <input 
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Ex: Almoço 35,90 padaria ontem..."
                        className="w-full py-2 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400 text-gray-800 dark:text-gray-200"
                    />
                    {isParsing && (
                        <Sparkles size={14} className="text-amber-500 animate-spin" />
                    )}
                </div>
            </div>
        </div>

        {/* Feedback Tags (Visualização do que foi entendido) */}
        {value && parsedData && (
            <div className="flex flex-wrap gap-2 px-1 animate-in slide-in-from-top-1 duration-200">
                {parsedData.value !== undefined && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <DollarSign size={10} /> R$ {parsedData.value.toFixed(2)}
                    </span>
                )}
                {parsedData.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Tag size={10} /> {parsedData.category}
                    </span>
                )}
                {parsedData.date && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        <Calendar size={10} /> {parsedData.date.split('-').reverse().slice(0, 2).join('/')}
                    </span>
                )}
                {parsedData.isRecurring && (
                     <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        <Repeat size={10} /> {parsedData.recurrenceFrequency === 'monthly' ? 'Mensal' : 'Recorrente'}
                    </span>
                )}
            </div>
        )}
        
        {!value && (
            <p className="text-[10px] text-gray-400 mt-1 px-1">
                IA: Digite texto livre e o app preenche tudo.
            </p>
        )}
    </div>
  );
};
