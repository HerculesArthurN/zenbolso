import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

interface UserWidgetProps {
    mode: 'compact' | 'expanded';
}

export const UserWidget: React.FC<UserWidgetProps> = ({ mode }) => {
    const navigate = useNavigate();

    // In local-first mode, we don't have a user avatar or name
    // So we just show a Settings button

    if (mode === 'expanded') {
        return (
            <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-3 w-full p-2.5 text-sm text-slate-400 hover:bg-slate-800 rounded-xl transition-colors mt-auto mb-4"
            >
                <Settings size={20} />
                <span className="font-medium">Configurações</span>
            </button>
        );
    }

    // Compact mode (Mobile Header)
    return (
        <button
            onClick={() => navigate('/settings')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
            <Settings size={18} />
        </button>
    );
};
