import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '', fullScreen = false }) => {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
        xl: 'w-16 h-16 border-4'
    };

    const spinner = (
        <div className={`animate-spin rounded-full border-t-transparent border-primary ${sizeClasses[size]} ${className}`} />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
