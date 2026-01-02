import React from 'react';
import { SqlEditor } from '../components/admin/SqlEditor';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                    <ShieldCheck className="text-indigo-600" />
                    <span>Admin Panel</span>
                </div>
                <Link to="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Back to Dashboard
                </Link>
            </nav>

            <main className="py-8">
                <SqlEditor />
            </main>
        </div>
    );
};
