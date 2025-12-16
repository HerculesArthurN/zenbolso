import React from 'react';
import { Wand2, Tag, Calendar, Wallet, DollarSign, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Transaction } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { ParsedTransaction } from '../../services/smartParser';

interface SmartInputProps {
  onConfirm?: (t: Transaction) => void;
  className?: string;
  value?: string;
  onChange?: (val: string) => void;
  isParsing?: boolean;
  parsedData?: ParsedTransaction | null;
}

export const SmartInput: React.FC<SmartInputProps> = ({ 
  onConfirm, 
  className = '',
  value,
  onChange,
  isParsing = false,
  parsedData
}) => {
  
  const handleConfirm = () => {
    if (!parsedData || !parsedData.value || !parsedData.description || !onConfirm) return;

    const transaction: Transaction = {
      id: uuidv4(),
      value: parsedData.value,
      description: parsedData.description,
      category: parsedData.category || 'Outros',
      accountId: parsedData.accountId, 
      type: parsedData.type || 'expense',
      date: parsedData.date || new Date().toISOString().split('T')[0],
      tags: ['smart-input']
    };

    onConfirm(transaction);
    if (onChange) onChange('');
  };

  // Validação mínima para habilitar botão
  const isValid = parsedData && parsedData.value && parsedData.value > 0 && parsedData.description;

  return (
    <div className={`space-y-3 ${className}`}>
        <div className="relative group">
            {/* Efeito de brilho no foco/parsing */}
            <div className={`absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur opacity-10 group-focus-within:opacity-20 transition-opacity ${isParsing ? 'animate-pulse opacity-30' : ''}`}></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex gap-3">
                    <div className="mt-1">
                      {isParsing ? (
                        <Loader2 className="text-emerald-500 animate-spin" size={20} />
                      ) : (
                        <Wand2 className="text-emerald-500" size={20} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <textarea
                          value={value || ''}
                          onChange={(e) => onChange?.(e.target.value)}
                          placeholder="Digite naturalmente: Ex: Almoço 35,90 no VR ontem..."
                          className="w-full bg-transparent border-none focus:ring-0 text-base md:text-lg resize-none placeholder-gray-400 text-gray-800 dark:text-gray-200 h-20 leading-relaxed"
                          style={{ minHeight: '80px' }}
                      />
                      
                      {/* Badges Area */}
                      <div className="flex flex-wrap items-center gap-2 mt-2 min-h-[24px]">
                        {!parsedData && !value && (
                          <span className="text-xs text-gray-400 italic">
                            A IA detecta valor, data, conta e categoria.
                          </span>
                        )}

                        {parsedData?.value && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 animate-in zoom-in duration-200">
                                <DollarSign size={12} /> 
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parsedData.value)}
                            </span>
                        )}
                        
                        {parsedData?.category && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 animate-in zoom-in duration-200 delay-75">
                                <Tag size={12} /> {parsedData.category}
                            </span>
                        )}

                        {parsedData?.accountId && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 animate-in zoom-in duration-200 delay-100">
                                <Wallet size={12} /> Conta Detectada
                            </span>
                        )}
                        
                        {parsedData?.date && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 animate-in zoom-in duration-200 delay-150">
                                <Calendar size={12} /> 
                                {parsedData.date.split('-').reverse().slice(0, 2).join('/')}
                            </span>
                        )}
                      </div>
                    </div>
                </div>

                {/* Confirm Button Overlay - Only visible when valid and onConfirm is provided */}
                {isValid && onConfirm && (
                  <div className="absolute bottom-4 right-4 animate-in fade-in slide-in-from-right-4">
                    <Button 
                      onClick={handleConfirm} 
                      size="sm" 
                      className="gap-2 shadow-lg shadow-primary/20"
                    >
                      Confirmar <ArrowRight size={16} />
                    </Button>
                  </div>
                )}
            </div>
        </div>
    </div>
  );
};