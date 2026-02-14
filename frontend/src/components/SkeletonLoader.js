import React from 'react';

const SkeletonLoader = ({ className = '', count = 1, height = 'h-4', width = 'w-full' }) => {
    return (
        <div className={`animate-pulse space-y-3 ${className}`}>
            {[...Array(count)].map((_, i) => (
                <div
                    key={i}
                    className={`bg-surface-light rounded ${height} ${width}`}
                ></div>
            ))}
        </div>
    );
};

export default SkeletonLoader;
