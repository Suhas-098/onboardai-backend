import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    isLoading,
    ...props
}) => {
    const variants = {
        primary: "bg-primary text-background hover:bg-secondary hover:shadow-glow-primary",
        secondary: "bg-surface text-text-primary border border-white/10 hover:border-text-secondary hover:bg-white/5",
        danger: "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 hover:shadow-glow-danger",
        ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5",
        glow: "bg-gradient-to-r from-primary to-secondary text-background shadow-glow-primary hover:opacity-90",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-8 py-3 text-base",
    };

    return (
        <button
            className={cn(
                "relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
};

export default Button;
