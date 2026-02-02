import React from 'react';
import { cn } from '../../utils/cn';

const Badge = ({ variant = 'neutral', children, className }) => {
    const variants = {
        neutral: "bg-surface text-text-secondary border-white/10",
        success: "bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]",
        warning: "bg-accent/10 text-accent border-accent/20 shadow-[0_0_10px_-3px_rgba(245,158,11,0.3)]",
        danger: "bg-danger/10 text-danger border-danger/20 shadow-[0_0_10px_-3px_rgba(239,68,68,0.3)] animate-pulse-slow",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                variants[variant],
                className
            )}
        >
            {variant === 'danger' && (
                <span className="w-1.5 h-1.5 rounded-full bg-danger mr-1.5 animate-pulse" />
            )}
            {children}
        </span>
    );
};

export default Badge;
