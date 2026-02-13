import React from 'react';

const SkeletonLoader = ({ type = 'text', count = 1, className = '', height, width }) => {
    // Helper to generate a single skeleton item
    const renderSkeleton = (key) => {
        let baseClasses = "animate-pulse bg-white/5 rounded";
        let style = {};

        if (width) style.width = width;
        if (height) style.height = height;

        switch (type) {
            case 'circle':
                baseClasses += " rounded-full";
                if (!width && !height) {
                    baseClasses += " w-12 h-12";
                }
                break;
            case 'card':
                baseClasses += " rounded-xl p-6 border border-white/5";
                if (!height) baseClasses += " h-32";
                break;
            case 'table-row':
                return (
                    <tr key={key} className="animate-pulse">
                        <td colSpan="100%" className="px-6 py-4">
                            <div className="h-4 bg-white/5 rounded w-full"></div>
                        </td>
                    </tr>
                );
            case 'text':
            default:
                if (!height) baseClasses += " h-4";
                if (!width) baseClasses += " w-full";
                break;
        }

        return (
            <div
                key={key}
                className={`${baseClasses} ${className}`}
                style={style}
            />
        );
    };

    const items = Array.from({ length: count }).map((_, i) => renderSkeleton(i));

    if (type === 'table-row') {
        return <>{items}</>;
    }

    return (
        <div className={count > 1 ? "space-y-3" : ""}>
            {items}
        </div>
    );
};

export default SkeletonLoader;
