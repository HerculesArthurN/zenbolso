import React from 'react';
import { Badge } from '../../types';
import { Flag, PiggyBank, Scale, TrendingUp, Zap, Lock, Sun, Target } from 'lucide-react';

interface AchievementsWidgetProps {
    badges: Badge[];
}

export const AchievementsWidget: React.FC<AchievementsWidgetProps> = ({ badges }) => {
    const unlockedBadges = badges.filter(b => b.unlocked);


    const getIcon = (name: string, size = 18) => {
        switch (name) {
            case 'Flag': return <Flag size={size} />;
            case 'PiggyBank': return <PiggyBank size={size} />;
            case 'Scale': return <Scale size={size} />;
            case 'TrendingUp': return <TrendingUp size={size} />;
            case 'Zap': return <Zap size={size} />;
            case 'Sun': return <Sun size={size} />;
            case 'Target': return <Target size={size} />;
            default: return <Flag size={size} />;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Conquistas
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                        {unlockedBadges.length}/{badges.length}
                    </span>
                </h3>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {badges.map(badge => (
                    <div
                        key={badge.id}
                        className={`flex-shrink-0 w-20 flex flex-col items-center gap-2 group relative`}
                        title={badge.description}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${badge.unlocked
                                ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 shadow-md scale-100'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 grayscale'
                            }`}>
                            {badge.unlocked ? getIcon(badge.icon, 24) : <Lock size={20} />}
                        </div>
                        <span className={`text-[10px] text-center font-medium leading-tight line-clamp-2 ${badge.unlocked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                            {badge.name}
                        </span>

                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-50">
                            <div className="bg-gray-900 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap">
                                {badge.description}
                                {!badge.unlocked && badge.progress !== undefined && (
                                    <div className="mt-1 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500" style={{ width: `${badge.progress}%` }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};