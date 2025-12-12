import React from 'react';
import { Insight } from '../../types';
import { AlertTriangle, TrendingUp, BarChart2, Award, Lightbulb, Sparkles } from 'lucide-react';

interface InsightsWidgetProps {
  insights: Insight[];
}

export const InsightsWidget: React.FC<InsightsWidgetProps> = ({ insights }) => {
  if (insights.length === 0) return null;

  const getIcon = (name?: string) => {
      switch(name) {
          case 'AlertTriangle': return <AlertTriangle size={18} />;
          case 'TrendingUp': return <TrendingUp size={18} />;
          case 'BarChart2': return <BarChart2 size={18} />;
          case 'Award': return <Award size={18} />;
          default: return <Lightbulb size={18} />;
      }
  };

  const getStyles = (type: string) => {
      switch(type) {
          case 'alert': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200';
          case 'success': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
          case 'info': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
          default: return 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200';
      }
  };

  return (
    <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1 flex items-center gap-1">
            <Sparkles size={14} className="text-primary" />
            Insights & Alertas
        </h3>
        <div className="grid grid-cols-1 gap-3">
            {insights.map(insight => (
                <div 
                    key={insight.id}
                    className={`p-4 rounded-2xl border flex gap-3 items-start transition-all animate-in slide-in-from-bottom-2 ${getStyles(insight.type)}`}
                >
                    <div className="mt-0.5 flex-shrink-0">
                        {getIcon(insight.icon)}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold mb-0.5">{insight.title}</h4>
                        <p className="text-xs opacity-90 leading-relaxed">
                            {insight.message}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};