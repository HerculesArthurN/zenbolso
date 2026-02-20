import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return <>{children}</>;

  return (
    <div 
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-1 duration-200">
          <div className="relative">
            {/* Tooltip Content */}
            <div className="bg-gray-800 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl w-max max-w-[200px] break-words text-center leading-relaxed">
              {content}
            </div>
            
            {/* Triangle/Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-gray-800 dark:border-t-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
};
