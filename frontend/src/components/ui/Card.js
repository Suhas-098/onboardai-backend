import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ children, className, hover = true, ...props }) => {
    return (
        <div
            className={cn(
                "rounded-2xl border border-white/5 bg-surface/50 backdrop-blur-xl p-6 transition-all duration-300",
                hover && "hover:border-primary/20 hover:shadow-glow-primary hover:-translate-y-1",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
