import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastAction {
    label: string;
    onClick: () => void;
}

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    action?: ToastAction;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType, duration?: number, action?: ToastAction) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({} as ToastContextType);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info', duration = 3000, action?: ToastAction) => {
        const id = Math.random().toString(36).substring(7);
        const newToast = { id, message, type, action };

        setToasts(prev => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`p-4 rounded-2xl shadow-lg animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-emerald-500 text-white' :
                            toast.type === 'error' ? 'bg-rose-500 text-white' :
                                toast.type === 'warning' ? 'bg-amber-500 text-white' :
                                    'bg-indigo-500 text-white'
                        }`}
                >
                    <div className="flex items-center justify-between gap-3">
                        <p className="font-bold text-sm flex-1">{toast.message}</p>
                        {toast.action && (
                            <button
                                onClick={() => {
                                    toast.action?.onClick();
                                    removeToast(toast.id);
                                }}
                                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors"
                            >
                                {toast.action.label}
                            </button>
                        )}
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-white/80 hover:text-white text-xl leading-none"
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
