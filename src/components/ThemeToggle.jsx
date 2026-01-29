import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = "" }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-sunset dark:hover:text-sunset transition-all shadow-sm active:scale-95 flex items-center justify-center ${className}`}
            aria-label={theme === 'light' ? "Ganti ke tema gelap" : "Ganti ke tema terang"}
        >
            {theme === 'light' ? (
                <Moon size={20} className="animate-in fade-in zoom-in duration-300" />
            ) : (
                <Sun size={20} className="animate-in fade-in zoom-in duration-300" />
            )}
        </button>
    );
};

export default ThemeToggle;
