import React from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Transaction } from '../../types';
import { Trash2, Edit2, TrendingUp, TrendingDown, Tag, CreditCard } from 'lucide-react';
import { safeNumber } from '../../utils/numberUtils';

interface TransactionListItemProps {
    transaction: Transaction;
    categoryName?: string;
    accountName?: string;
    onEdit: (tx: Transaction) => void;
    onDelete: (id: string, description: string | null) => void;
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
    transaction,
    categoryName,
    accountName,
    onEdit,
    onDelete
}) => {
    const controls = useAnimation();

    const SWIPE_THRESHOLD = 80;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const handleDragEnd = async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset < -SWIPE_THRESHOLD || velocity < -500) {
            // Swipe Left -> Delete
            onDelete(transaction.id, transaction.description);
            // Animate it leaving, then snap back (for visual reset if parent doesn't unmount it)
            await controls.start({ x: -window.innerWidth, opacity: 0 });
            controls.start({ x: 0, opacity: 1 });
        } else if (offset > SWIPE_THRESHOLD || velocity > 500) {
            // Swipe Right -> Edit
            onEdit(transaction);
            controls.start({ x: 0 }); // Snap back
        } else {
            // Snap back
            controls.start({ x: 0 });
        }
    };

    const isIncome = transaction.type === 'INCOME';

    return (
        <div className="relative overflow-hidden group touch-pan-y rounded-[32px] mb-3 bg-slate-50 dark:bg-slate-800">
            {/* Background Actions */}
            <div className="absolute inset-0 flex items-center justify-between px-6 rounded-[32px]">
                {/* Left Action (Edit) - Blue */}
                <div className="flex-1 flex items-center justify-start h-full">
                    <div className="flex flex-col items-center justify-center w-16 text-indigo-500 font-bold">
                        <Edit2 size={24} />
                        <span className="text-[10px] mt-1 uppercase tracking-widest">Editar</span>
                    </div>
                </div>
                {/* Right Action (Delete) - Red */}
                <div className="flex-1 flex items-center justify-end h-full">
                    <div className="flex flex-col items-center justify-center w-16 text-rose-500 font-bold">
                        <Trash2 size={24} />
                        <span className="text-[10px] mt-1 uppercase tracking-widest">Excluir</span>
                    </div>
                </div>
            </div>

            {/* Foreground Swipable Card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={handleDragEnd}
                animate={controls}
                className="relative bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200/50 flex items-center justify-between flex-wrap sm:flex-nowrap cursor-grab active:cursor-grabbing z-10 will-change-transform"
                style={{ touchAction: 'pan-y' }}
            >
                <div className="flex items-center gap-4 min-w-0 pointer-events-none">
                    <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-[20px] ${isIncome ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-500'}`}>
                        {isIncome ? <TrendingUp size={24} strokeWidth={2.5} /> : <TrendingDown size={24} strokeWidth={2.5} />}
                    </div>
                    <div className="min-w-0 flex flex-col items-start text-left">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate uppercase tracking-widest">
                            {transaction.description}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs font-semibold text-slate-400">
                            {categoryName ? (
                                <span className="flex items-center gap-1.5 max-w-[120px] truncate">
                                    <Tag size={12} className="opacity-70" />
                                    <span className="truncate">{categoryName}</span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 truncate">
                                    <Tag size={12} className="opacity-30" />
                                    <span className="italic opacity-50 truncate">Sem categoria</span>
                                </span>
                            )}
                            
                            {accountName && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 flex-shrink-0" />
                                    <span className="flex items-center gap-1.5 max-w-[100px] truncate">
                                        <CreditCard size={12} className="opacity-70" />
                                        <span className="truncate">{accountName}</span>
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-auto pointer-events-none pt-2 sm:pt-0">
                    <span className={`text-[15px] font-black tracking-tight ${isIncome ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(safeNumber(transaction.amount, 0))}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                        transaction.is_paid 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                    }`}>
                        {transaction.is_paid ? 'Concluído' : 'Pendente'}
                    </span>
                </div>
            </motion.div>
        </div>
    );
};
