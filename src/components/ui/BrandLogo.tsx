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
            {/* Outline / Pig Body & Head */}
            <path
                d="M50 20C38 20 30 28 30 40C30 45 32 48 35 50C32 55 30 65 30 75C30 80 35 85 50 85C65 85 70 80 70 75C70 65 68 55 65 50C68 48 70 45 70 40C70 28 62 20 50 20Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isColor ? "text-teal-600 dark:text-teal-400" : ""}
            />

            {/* Ears */}
            <path
                d="M32 25C25 25 22 35 25 40"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className={isColor ? "text-teal-600 dark:text-teal-400" : ""}
            />
            <path
                d="M68 25C75 25 78 35 75 40"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className={isColor ? "text-teal-600 dark:text-teal-400" : ""}
            />

            {/* Pig Snout */}
            <rect
                x="44"
                y="38"
                width="12"
                height="8"
                rx="4"
                stroke="currentColor"
                strokeWidth="3"
                className={isColor ? "text-teal-500/50" : ""}
            />

            {/* Eyes - Closed/Meditating */}
            <path d="M40 33Q42 32 44 33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M56 33Q58 32 60 33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

            {/* Arms - Meditating / Seated */}
            <path
                d="M35 55C25 60 25 75 35 80"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className={isColor ? "text-teal-600 dark:text-teal-400" : ""}
            />
            <path
                d="M65 55C75 60 75 75 65 80"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className={isColor ? "text-teal-600 dark:text-teal-400" : ""}
            />

            {/* The Coin */}
            <circle
                cx="50"
                cy="68"
                r="10"
                fill="currentColor"
                className={isColor ? "text-amber-400" : "opacity-20"}
            />
            <circle
                cx="50"
                cy="68"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                className={isColor ? "text-amber-600" : ""}
            />
            <path
                d="M50 63V73M50 63C48 63 47 64 47 65C47 67 53 67 53 69C53 71 51 72 50 72M50 73"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className={isColor ? "text-amber-700" : ""}
            />
        </svg>
    );
};
