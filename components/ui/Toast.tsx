import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, RotateCcw } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
  action?: ToastAction;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 3000, onClose, action }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const styles = {
    success: "bg-surface dark:bg-surface-dark border-l-4 border-income text-slate-800 dark:text-slate-100 shadow-xl",
    error: "bg-surface dark:bg-surface-dark border-l-4 border-expense text-slate-800 dark:text-slate-100 shadow-xl",
    info: "bg-surface dark:bg-surface-dark border-l-4 border-primary text-slate-800 dark:text-slate-100 shadow-xl",
  };

  const icons = {
    success: <CheckCircle className="text-income" size={20} />,
    error: <AlertCircle className="text-expense" size={20} />,
    info: <Info className="text-primary" size={20} />,
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg min-w-[300px] max-w-md transform transition-all duration-500 hover:scale-[1.02] animate-in slide-in-from-bottom-5 ${styles[type]}`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1 flex flex-col">
        <p className="text-sm font-medium leading-tight">{message}</p>
      </div>
      
      {action && (
        <button
          onClick={() => {
            action.onClick();
            onClose(id);
          }}
          className="ml-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-xs font-semibold transition-colors flex items-center gap-1"
        >
          <RotateCcw size={12} />
          {action.label}
        </button>
      )}

      <button 
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-1"
      >
        <X size={16} />
      </button>
    </div>
  );
};