import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-3 bg-background dark:bg-surface-dark text-text-muted dark:text-text-muted-dark rounded-xl hover:bg-border-color dark:hover:bg-border-color-dark transition-all active:scale-95 flex items-center justify-center shadow-sm border border-border-color dark:border-border-color-dark"
            aria-label="Alternar tema"
        >
            {theme === 'light' ? (
                <Moon size={20} className="text-secondary" />
            ) : (
                <Sun size={20} className="text-warning-dark" />
            )}
        </button>
    );
};
