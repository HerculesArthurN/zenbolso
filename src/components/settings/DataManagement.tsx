import React, { useRef, useState } from 'react';
import { Download, Upload, FileJson, FileText, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { dataExportService } from '../../services/dataExportService';
import { useToast } from '../../contexts/ToastContext';

export const DataManagement: React.FC = () => {
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState<string | null>(null);

    const handleExportJSON = async () => {
        setLoading('json_export');
        try {
            await dataExportService.exportToJSON();
            addToast('Backup baixado com sucesso!', 'success');
        } catch (error) {
            addToast('Erro ao criar backup.', 'error');
        } finally {
            setLoading(null);
        }
    };

    const handleExportCSV = async () => {
        setLoading('csv_export');
        try {
            await dataExportService.exportToCSV();
            addToast('Relatório CSV baixado com sucesso!', 'success');
        } catch (error) {
            addToast('Erro ao criar relatório CSV.', 'error');
        } finally {
            setLoading(null);
        }
    };

    const handleImportClick = () => {
        if (window.confirm('CUIDADO: Ao restaurar um backup, TODOS os dados atuais serão substituídos. Deseja continuar?')) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading('import');
        try {
            await dataExportService.importFromJSON(file);
            addToast('Dados restaurados com sucesso! Recarregando...', 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error(error);
            addToast('Arquivo de backup inválido ou corrompido.', 'error');
        } finally {
            setLoading(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Download size={24} className="text-indigo-500" />
                    Seus Dados
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Exporte seus dados para backup ou análise externa. Tudo roda localmente.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export JSON */}
                <button
                    onClick={handleExportJSON}
                    disabled={!!loading}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 group transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
                            <FileJson size={20} />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-slate-700 dark:text-slate-200">Backup Completo</span>
                            <span className="text-xs text-slate-500">Arquivo JSON criptografado</span>
                        </div>
                    </div>
                    {loading === 'json_export' ? <Loader2 className="animate-spin text-indigo-500" /> : <Download size={20} className="text-slate-400 group-hover:text-indigo-500" />}
                </button>

                {/* Export CSV */}
                <button
                    onClick={handleExportCSV}
                    disabled={!!loading}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 group transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                            <FileText size={20} />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-slate-700 dark:text-slate-200">Relatório Excel</span>
                            <span className="text-xs text-slate-500">Formato CSV legível</span>
                        </div>
                    </div>
                    {loading === 'csv_export' ? <Loader2 className="animate-spin text-emerald-500" /> : <Download size={20} className="text-slate-400 group-hover:text-emerald-500" />}
                </button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/20">
                    <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm mb-2 flex items-center gap-2">
                        <AlertTriangle size={16} />
                        Área de Perigo
                    </h4>
                    <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mb-4">
                        Restaurar um backup substituirá todos os dados atuais do aplicativo.
                    </p>

                    <button
                        onClick={handleImportClick}
                        disabled={!!loading}
                        className="w-full py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading === 'import' ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                        Restaurar Backup
                    </button>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
            />
        </div>
    );
};
