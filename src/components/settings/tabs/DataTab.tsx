import React, { useRef } from 'react';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';

interface DataTabProps {
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearData: () => void;
}

export const DataTab: React.FC<DataTabProps> = ({ onExport, onImport, onClearData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl flex gap-3 text-amber-800 dark:text-amber-300">
        <AlertTriangle size={20} className="flex-shrink-0" />
        <p className="text-sm">
          Seus dados ficam salvos apenas neste navegador. Faça backups regulares via CSV.
        </p>
      </div>

      <div className="grid gap-3">
        {/* Exportar */}
        <button
          onClick={onExport}
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

        {/* Importar */}
        <button
          onClick={() => fileInputRef.current?.click()}
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
            onChange={onImport}
            accept=".csv"
            className="hidden"
          />
        </button>

        {/* Resetar — Golden Rule: usa resetApp() via useSettingsData, não localStorage.clear() */}
        <button
          onClick={onClearData}
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
  );
};
