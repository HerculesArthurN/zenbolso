
import React, { useState } from 'react';
import { Transaction, Account, Category } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { parseBankText, ImportedDraft } from '../../services/importer';
import { Wand2, Check, AlertCircle, ArrowRight, Tag } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '../../context/ToastContext';
import { AppError } from '../../utils/AppError';
import { getErrorMessage, getUserFriendlyMessage } from '../../utils/errorMapper';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Transaction[]) => void;
  accounts: Account[];
  categories: Category[];
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport, accounts, categories }) => {
  const { addToast } = useToast();
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [text, setText] = useState('');
  const [drafts, setDrafts] = useState<ImportedDraft[]>([]);
  const [targetAccount, setTargetAccount] = useState<string>(accounts[0]?.id || '');

  const handleParse = () => {
      try {
          const parsed = parseBankText(text);
          if (parsed.length === 0) {
              addToast(getUserFriendlyMessage('IMPORT_NO_VALID_DATA'), 'error');
              return; 
          }
          setDrafts(parsed);
          setStep('review');
      } catch (e) {
          addToast(getErrorMessage(e), 'error');
      }
  };

  const handleToggleDraft = (id: string) => {
      setDrafts(drafts.map(d => d.id === id ? { ...d, selected: !d.selected } : d));
  };

  const handleCategoryChange = (id: string, newCategory: string) => {
      setDrafts(drafts.map(d => d.id === id ? { ...d, category: newCategory } : d));
  };

  const handleFinalize = () => {
      const selectedDrafts = drafts.filter(d => d.selected);
      
      const transactions: Transaction[] = selectedDrafts.map(d => ({
          id: uuidv4(),
          date: d.date,
          value: d.value,
          description: d.description,
          category: d.category || 'Outros', 
          type: d.type,
          accountId: targetAccount,
          tags: ['importado']
      }));

      onImport(transactions);
      reset();
  };

  const reset = () => {
      setText('');
      setDrafts([]);
      setStep('input');
      onClose();
  };

  const uniqueCategories = Array.from(new Set(categories.map(c => c.name))).sort();

  return (
    <Modal isOpen={isOpen} onClose={reset} title="Importação Inteligente">
        {step === 'input' ? (
            <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                    <Wand2 className="flex-shrink-0" size={20} />
                    <p>Cole abaixo o texto da sua fatura (Nubank, Inter, etc) ou extrato. Nossa IA irá detectar datas, valores e <b>categorias</b> automaticamente.</p>
                </div>
                
                <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Ex: 12 OUT Uber *Eats 35,90..."
                    className="w-full h-48 p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary resize-none"
                />

                <div className="flex justify-end">
                    <Button onClick={handleParse} disabled={!text.trim()} className="gap-2">
                        Processar Texto <ArrowRight size={16} />
                    </Button>
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Revisar Transações ({drafts.filter(d => d.selected).length})</h3>
                    <select 
                        value={targetAccount}
                        onChange={(e) => setTargetAccount(e.target.value)}
                        className="text-xs bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-1 px-2"
                    >
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                </div>

                <div className="max-h-[50vh] overflow-y-auto custom-scrollbar space-y-2">
                    {drafts.map(draft => (
                        <div 
                            key={draft.id}
                            className={`p-3 rounded-xl border transition-all ${
                                draft.selected 
                                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500/50' 
                                : 'bg-gray-50 dark:bg-gray-800 border-transparent opacity-60'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div 
                                    onClick={() => handleToggleDraft(draft.id)}
                                    className={`mt-1 w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                                        draft.selected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-400'
                                    }`}
                                >
                                    {draft.selected && <Check size={12} strokeWidth={3} />}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate pr-2">{draft.description}</p>
                                        <span className="font-bold text-sm text-gray-900 dark:text-white flex-shrink-0">
                                            {draft.value.toFixed(2)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{draft.date}</span>
                                        <span>•</span>
                                        <div className="relative group">
                                            <div className="flex items-center gap-1 cursor-pointer hover:text-primary">
                                                <Tag size={10} />
                                                <select 
                                                    value={draft.category}
                                                    onChange={(e) => handleCategoryChange(draft.id, e.target.value)}
                                                    className="bg-transparent border-none p-0 text-xs font-medium cursor-pointer focus:ring-0 text-gray-600 dark:text-gray-400"
                                                >
                                                    <option value="Outros">Outros</option>
                                                    {uniqueCategories.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {drafts.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            <AlertCircle className="mx-auto mb-2" />
                            <p>Nenhum padrão reconhecido.</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setStep('input')} className="flex-1">Voltar</Button>
                    <Button onClick={handleFinalize} className="flex-1" disabled={drafts.filter(d => d.selected).length === 0}>
                        Importar Selecionados
                    </Button>
                </div>
            </div>
        )}
    </Modal>
  );
};
