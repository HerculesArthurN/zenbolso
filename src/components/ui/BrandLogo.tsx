import React from 'react';

interface BrandLogoProps {
    className?: string;
    variant?: 'color' | 'monochrome';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = "h-8 w-8", variant = 'color' }) => {
    const isColor = variant === 'color';

    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Body - Vertical Oval/Pill shape */}
            <rect
                x="28"
                y="18"
                width="44"
                height="64"
                rx="22"
                stroke="currentColor"
                strokeWidth="6"
                className={isColor ? "text-teal-600 dark:text-teal-400" : ""}
            />

            {/* Ears */}
            <circle
                cx="32"
                cy="22"
                r="8"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                className={isColor ? "text-teal-600 dark:text-teal-400" : ""}
            />
            <circle
                cx="68"
                cy="22"
                r="8"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                className={isColor ? "text-teal-600 dark:text-teal-400" : ""}
            />

            {/* Eyes */}
            <circle cx="43" cy="38" r="2.5" fill="currentColor" className={isColor ? "text-slate-900 dark:text-slate-100" : ""} />
            <circle cx="57" cy="38" r="2.5" fill="currentColor" className={isColor ? "text-slate-900 dark:text-slate-100" : ""} />

            {/* Snout */}
            <circle
                cx="50"
                cy="48"
                r="6"
                stroke="currentColor"
                strokeWidth="3"
                className={isColor ? "text-teal-500/50" : ""}
            />
            <circle cx="48" cy="48" r="1.5" fill="currentColor" className={isColor ? "text-teal-600" : ""} />
            <circle cx="52" cy="48" r="1.5" fill="currentColor" className={isColor ? "text-teal-600" : ""} />

            {/* The Huge Golden Coin */}
            <circle
                cx="50"
                cy="64"
                r="15"
                fill="currentColor"
                className={isColor ? "text-amber-400" : "opacity-20"}
            />
            <circle
                cx="50"
                cy="64"
                r="15"
                stroke="currentColor"
                strokeWidth="3"
                className={isColor ? "text-amber-600" : ""}
            />
            <path
                d="M50 58V70M50 58C48 58 46.5 59.5 46.5 61C46.5 64 53.5 64 53.5 67C53.5 68.5 52 70 50 70M50 71"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className={isColor ? "text-amber-700" : ""}
            />
        </svg>
    );
};
