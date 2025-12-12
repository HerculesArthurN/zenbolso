import React, { useRef, useState, useEffect } from 'react';
import { Account, Category, TransactionType, RecurringConfig } from '../../types';
import { Button } from '../ui/Button';
import { Download, Upload, Trash2, PieChart, Repeat, Plus, Clock, DollarSign, Wallet, FileSpreadsheet, AlertTriangle, Briefcase, Cloud, LogOut, User } from 'lucide-react';
import { exportToCSV, parseCSV } from '../../services/csv';
import { postAccount, removeAccount, updateSettings, getCategories, postCategory, removeCategory, getRecurringConfigs, removeRecurringConfig, getAccounts, getTransactions, getSettings, clearAllData, importData } from '../../services/api';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '../../context/ToastContext';
import { CATEGORY_ICONS } from '../../constants';
import { AppError } from '../../utils/AppError';
import { getErrorMessage, getUserFriendlyMessage } from '../../utils/errorMapper';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { CategoryIcon } from '../ui/CategoryIcon';

interface SettingsModalProps {
  onDataUpdate: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onDataUpdate }) => {
  const { addToast } = useToast();
  const { user, isAuthenticated, login, logout, syncStatus } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'recurring' | 'accounts' | 'data' | 'cloud'>('general');
  
  // Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({
      isOpen: false, message: '', onConfirm: () => {}
  });

  // Data State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accounts State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');

  // General Settings State
  const [budgetLimit, setBudgetLimit] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [workHours, setWorkHours] = useState('160');

  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<TransactionType>('expense');
  // Default to Tag icon for new categories for now, can be improved to a picker later
  const newCategoryIcon = 'Tag'; 

  // Recurring State
  const [recurringConfigs, setRecurringConfigs] = useState<RecurringConfig[]>([]);

  useEffect(() => {
      loadAllData();
  }, []);

  const loadAllData = async () => {
      try {
          const [accs, settings, cats, recur] = await Promise.all([
              getAccounts(),
              getSettings(),
              getCategories(),
              getRecurringConfigs()
          ]);

          setAccounts(accs);
          setBudgetLimit(settings.budgetLimit > 0 ? settings.budgetLimit.toString() : '');
          setMonthlyIncome(settings.monthlyIncome ? settings.monthlyIncome.toString() : '');
          setWorkHours(settings.workHoursPerMonth ? settings.workHoursPerMonth.toString() : '160');
          setCategories(cats);
          setRecurringConfigs(recur);
      } catch (e) {
          console.error("Settings init error", e);
          addToast(getUserFriendlyMessage('DB_READ_ERROR'), 'error');
      }
  };

  // --- Handlers: General ---

  const handleSaveGeneral = async () => {
      try {
          const limit = parseFloat(budgetLimit) || 0;
          const income = parseFloat(monthlyIncome) || 0;
          const hours = parseFloat(workHours) || 160;

          const current = await getSettings();

          await updateSettings({
              ...current,
              budgetLimit: limit,
              monthlyIncome: income,
              workHoursPerMonth: hours
          });
          
          addToast('Configurações salvas!', 'success');
          onDataUpdate();
      } catch (e) {
           addToast(getErrorMessage(e), 'error');
      }
  };

  // --- Handlers: Accounts ---

  const handleAddAccount = async () => {
      try {
          if (!newAccountName.trim()) throw new AppError('VALIDATION_REQUIRED_FIELD');

          const initialBalance = parseFloat(newAccountBalance) || 0;

          await postAccount({
              id: uuidv4(),
              name: newAccountName,
              type: 'checking', // Default for simplicity in this UI
              initialBalance: initialBalance,
              color: '#6366f1' // Default Indigo
          });
          
          setNewAccountName('');
          setNewAccountBalance('');
          await loadAllData();
          onDataUpdate();
          addToast('Conta criada!', 'success');
      } catch (e) {
          addToast(getErrorMessage(e), 'error');
      }
  };

  const handleDeleteAccount = async (id: string) => {
      setConfirmDialog({
          isOpen: true,
          message: 'Tem certeza? Transações vinculadas a esta conta podem ficar órfãs.',
          onConfirm: async () => {
              try {
                  await removeAccount(id);
                  await loadAllData();
                  onDataUpdate();
                  addToast('Conta removida.', 'success');
              } catch (e) {
                  addToast(getErrorMessage(e), 'error');
              }
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  // --- Handlers: Categories ---

  const handleAddCategory = async () => {
      try {
          if (!newCategoryName.trim()) throw new AppError('VALIDATION_REQUIRED_FIELD');
          
          await postCategory({
              id: uuidv4(),
              name: newCategoryName,
              type: newCategoryType,
              icon: newCategoryIcon,
              color: '#64748B' // Default slate color
          });

          setNewCategoryName('');
          await loadAllData();
          addToast('Categoria adicionada!', 'success');
      } catch (e) {
          addToast(getErrorMessage(e), 'error');
      }
  };

  const handleDeleteCategory = async (id: string) => {
      try {
           await removeCategory(id);
           await loadAllData();
           addToast('Categoria removida.', 'info');
      } catch (e) {
          addToast(getErrorMessage(e), 'error');
      }
  };

  // --- Handlers: Recurring ---

  const handleDeleteRecurring = async (id: string) => {
      try {
          await removeRecurringConfig(id);
          await loadAllData();
          addToast('Recorrência cancelada.', 'info');
      } catch (e) {
          addToast(getErrorMessage(e), 'error');
      }
  };

  // --- Handlers: Data ---

  const handleExport = async () => {
      try {
          const txs = await getTransactions();
          exportToCSV(txs);
          addToast('Download iniciado!', 'success');
      } catch (e) {
          addToast(getErrorMessage(e), 'error');
      }
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const text = event.target?.result as string;
              const transactions = parseCSV(text);
              await importData(transactions);
              addToast(`${transactions.length} transações importadas!`, 'success');
              onDataUpdate();
          } catch (error) {
              addToast(getErrorMessage(error), 'error');
          }
          // Reset input
          if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsText(file);
  };

  const handleClearData = () => {
      setConfirmDialog({
          isOpen: true,
          message: 'CUIDADO: Isso apagará TODAS as suas transações, contas e configurações. Essa ação é irreversível. Deseja continuar?',
          onConfirm: async () => {
              try {
                  await clearAllData();
                  addToast('Dados apagados com sucesso.', 'info');
                  // Reload app state
                  window.location.reload();
              } catch (e) {
                  addToast(getUserFriendlyMessage('DB_DELETE_ERROR'), 'error');
              }
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  // --- UI Components ---

  const TabButton = ({ id, label, icon: Icon }: any) => (
      <button
          onClick={() => setActiveTab(id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === id 
              ? 'bg-primary text-white shadow-lg shadow-primary/25' 
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'
          }`}
      >
          <Icon size={16} />
          <span className="hidden sm:inline">{label}</span>
      </button>
  );

  return (
    <>
        <div className="flex flex-col h-[70vh] sm:h-[600px]">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto p-1 mb-4 border-b border-gray-100 dark:border-gray-800 no-scrollbar">
                <TabButton id="general" label="Geral" icon={DollarSign} />
                <TabButton id="accounts" label="Contas" icon={Wallet} />
                <TabButton id="categories" label="Categorias" icon={PieChart} />
                <TabButton id="recurring" label="Recorrentes" icon={Repeat} />
                <TabButton id="cloud" label="Nuvem" icon={Cloud} />
                <TabButton id="data" label="Dados" icon={FileSpreadsheet} />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
                
                {/* GENERAL TAB */}
                {activeTab === 'general' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex gap-3 text-blue-800 dark:text-blue-300">
                            <Clock size={20} className="flex-shrink-0" />
                            <p className="text-sm">Defina seu teto de gastos e sua renda para habilitar os cálculos de "Custo de Vida" e alertas de orçamento.</p>
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Teto de Gastos Mensal</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                    <input 
                                        type="number" 
                                        value={budgetLimit}
                                        onChange={e => setBudgetLimit(e.target.value)}
                                        onBlur={handleSaveGeneral}
                                        placeholder="0,00"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Renda Mensal (Líquida)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                    <input 
                                        type="number" 
                                        value={monthlyIncome}
                                        onChange={e => setMonthlyIncome(e.target.value)}
                                        onBlur={handleSaveGeneral}
                                        placeholder="0,00"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Horas Trabalhadas / Mês</label>
                                <div className="relative">
                                    <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="number" 
                                        value={workHours}
                                        onChange={e => setWorkHours(e.target.value)}
                                        onBlur={handleSaveGeneral}
                                        placeholder="160"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 ml-1">Usado para calcular quanto vale sua hora de trabalho.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* CLOUD TAB (Google Drive) */}
                {activeTab === 'cloud' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                         <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl flex gap-3 text-indigo-800 dark:text-indigo-300">
                            <Cloud size={20} className="flex-shrink-0" />
                            <div>
                                <p className="text-sm font-bold mb-1">Backup Automático no Google Drive</p>
                                <p className="text-xs opacity-90">Seus dados são salvos em uma pasta segura e invisível (AppData) no seu Google Drive. Privacidade total.</p>
                            </div>
                        </div>

                        {isAuthenticated && user ? (
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    {user.picture ? (
                                        <img src={user.picture} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-600" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                            <User size={24} />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`w-2 h-2 rounded-full ${syncStatus === 'success' ? 'bg-emerald-500' : syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' : 'bg-gray-400'}`} />
                                            <span className="text-xs text-gray-400">
                                                {syncStatus === 'success' ? 'Sincronizado' : syncStatus === 'syncing' ? 'Sincronizando...' : 'Conectado'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button onClick={logout} variant="secondary" className="w-full gap-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                        <LogOut size={16} /> Desconectar Conta
                                    </Button>
                                    <p className="text-[10px] text-center text-gray-400 mt-2">
                                        Ao desconectar, o backup automático será pausado.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 space-y-4">
                                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-fit mx-auto text-gray-400">
                                    <Cloud size={32} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Não conectado</h3>
                                    <p className="text-sm text-gray-500 max-w-xs mx-auto">Conecte sua conta Google para habilitar o cofre seguro e backup automático.</p>
                                </div>
                                <Button onClick={login} className="gap-2">
                                    <User size={18} /> Entrar com Google
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* ACCOUNTS TAB */}
                {activeTab === 'accounts' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <input 
                                type="text" 
                                placeholder="Nome da Conta (Ex: Nubank)"
                                value={newAccountName}
                                onChange={e => setNewAccountName(e.target.value)}
                                className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl"
                             />
                             <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    placeholder="Saldo Inicial"
                                    value={newAccountBalance}
                                    onChange={e => setNewAccountBalance(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl"
                                />
                                <Button onClick={handleAddAccount} size="icon">
                                    <Plus size={20} />
                                </Button>
                             </div>
                        </div>

                        <div className="space-y-2">
                             <h3 className="text-xs font-bold text-gray-500 uppercase">Contas Ativas</h3>
                             {accounts.map(acc => (
                                 <div key={acc.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                             <Wallet size={16} />
                                         </div>
                                         <div>
                                             <p className="font-medium text-sm text-gray-900 dark:text-white">{acc.name}</p>
                                             <p className="text-xs text-gray-400">Saldo Inicial: R$ {acc.initialBalance.toFixed(2)}</p>
                                         </div>
                                     </div>
                                     <button 
                                        onClick={() => handleDeleteAccount(acc.id)}
                                        className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                                     >
                                         <Trash2 size={16} />
                                     </button>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}

                {/* CATEGORIES TAB */}
                {activeTab === 'categories' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                         <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl space-y-3">
                             <div className="flex p-1 bg-white dark:bg-gray-900 rounded-lg w-fit">
                                <button
                                    onClick={() => setNewCategoryType('expense')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${newCategoryType === 'expense' ? 'bg-rose-100 text-rose-600' : 'text-gray-500'}`}
                                >Despesa</button>
                                <button
                                    onClick={() => setNewCategoryType('income')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${newCategoryType === 'income' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-500'}`}
                                >Receita</button>
                             </div>
                             
                             <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Nome da categoria"
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border-none rounded-xl"
                                />
                                <Button onClick={handleAddCategory} size="icon">
                                    <Plus size={20} />
                                </Button>
                             </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <h3 className="text-xs font-bold text-rose-500 uppercase mb-2">Despesas</h3>
                                 <div className="space-y-2">
                                     {categories.filter(c => c.type === 'expense').map(c => (
                                         <div key={c.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg group">
                                             <span className="text-sm flex items-center gap-2">
                                                 <CategoryIcon iconName={c.icon} color={c.color || '#64748B'} size={16} /> 
                                                 {c.name}
                                             </span>
                                             <button onClick={() => handleDeleteCategory(c.id)} className="text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <Trash2 size={14} />
                                             </button>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                             <div>
                                 <h3 className="text-xs font-bold text-emerald-500 uppercase mb-2">Receitas</h3>
                                 <div className="space-y-2">
                                     {categories.filter(c => c.type === 'income').map(c => (
                                         <div key={c.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg group">
                                             <span className="text-sm flex items-center gap-2">
                                                 <CategoryIcon iconName={c.icon} color={c.color || '#64748B'} size={16} /> 
                                                 {c.name}
                                             </span>
                                             <button onClick={() => handleDeleteCategory(c.id)} className="text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <Trash2 size={14} />
                                             </button>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         </div>
                    </div>
                )}

                {/* RECURRING TAB */}
                {activeTab === 'recurring' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        {recurringConfigs.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <Repeat size={40} className="mx-auto mb-2 opacity-20" />
                                <p>Nenhuma transação recorrente.</p>
                                <p className="text-xs">Adicione uma ao criar uma nova transação.</p>
                            </div>
                        ) : (
                            recurringConfigs.map(config => (
                                <div key={config.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${config.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                            <Repeat size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">
                                                {config.description || config.category}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                R$ {config.value.toFixed(2)} • {config.frequency === 'monthly' ? 'Mensal' : config.frequency === 'weekly' ? 'Semanal' : 'Anual'}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteRecurring(config.id)}
                                        className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* DATA TAB */}
                {activeTab === 'data' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl flex gap-3 text-amber-800 dark:text-amber-300">
                            <AlertTriangle size={20} className="flex-shrink-0" />
                            <p className="text-sm">Seus dados ficam salvos apenas neste navegador. Faça backups regulares via CSV.</p>
                        </div>

                        <div className="grid gap-3">
                            <button 
                                onClick={handleExport}
                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                                        <Download size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">Exportar Backup (CSV)</p>
                                        <p className="text-xs text-gray-400">Salve suas transações em um arquivo.</p>
                                    </div>
                                </div>
                            </button>

                            <button 
                                onClick={handleImportClick}
                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                        <Upload size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">Restaurar Backup</p>
                                        <p className="text-xs text-gray-400">Importe transações de um arquivo CSV.</p>
                                    </div>
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    accept=".csv" 
                                    className="hidden" 
                                />
                            </button>

                            <button 
                                onClick={handleClearData}
                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-rose-100 dark:border-rose-900/30 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors group mt-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-100 text-rose-600 rounded-xl group-hover:scale-110 transition-transform">
                                        <Trash2 size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm text-rose-600">Apagar Tudo</p>
                                        <p className="text-xs text-rose-400">Resetar o aplicativo para o estado inicial.</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <ConfirmDialog 
            isOpen={confirmDialog.isOpen}
            onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            onConfirm={confirmDialog.onConfirm}
            message={confirmDialog.message}
            title="Atenção"
            confirmText="Sim, continuar"
        />
    </>
  );
};