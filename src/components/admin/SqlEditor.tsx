import React, { useState } from 'react';
import { Play, Database, AlertCircle, Info, Table as TableIcon } from 'lucide-react';
import { useSqlRunner } from '../../hooks/useSqlRunner';

export const SqlEditor: React.FC = () => {
    const [query, setQuery] = useState('SELECT * FROM accounts LIMIT 10;');
    const { runSql, results, loading, error } = useSqlRunner();

    const handleRun = () => {
        runSql(query);
    };

    return (
        <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto animate-in fade-in duration-500 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                        <Database size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SQL Playground</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Execute queries diretamente no banco de dados.</p>
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-800">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Query Editor</span>
                    <button
                        onClick={handleRun}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-800 text-white rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-teal-500/20"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={14} />}
                        Run Query
                    </button>
                </div>
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-64 p-4 bg-slate-900 text-teal-400 font-mono text-sm outline-none resize-none placeholder:text-slate-700 custom-scrollbar"
                    placeholder="Enter your SQL query here..."
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <div>
                        <p className="font-bold text-sm">Query Error</p>
                        <p className="text-xs font-mono break-all mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Results Area */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <TableIcon size={18} />
                    <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-400">Results</h2>
                    {results && results.length > 0 && <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">{results.length} rows</span>}
                </div>

                {!results && !loading && !error && (
                    <div className="flex flex-col items-center justify-center py-16 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                        <Info size={32} className="mb-2 opacity-30" />
                        <p className="text-sm">Execute uma query para ver os resultados.</p>
                    </div>
                )}

                {results && results.length > 0 && results[0] && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto custom-scrollbar-horizontal">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/80">
                                    {Object.keys(results[0]).map((key) => (
                                        <th key={key} className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {results.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        {Object.values(row).map((val: any, j) => (
                                            <td key={j} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 font-mono truncate max-w-[250px]">
                                                {val === null ? (
                                                    <span className="text-slate-300 dark:text-slate-600 italic">null</span>
                                                ) : typeof val === 'object' ? (
                                                    <span className="text-amber-600 dark:text-amber-400">{JSON.stringify(val)}</span>
                                                ) : (
                                                    String(val)
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {results && results.length === 0 && (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl text-slate-500 border border-slate-100 dark:border-slate-800">
                        A query foi executada com sucesso, mas não retornou linhas.
                    </div>
                )}
            </div>
        </div>
    );
};
