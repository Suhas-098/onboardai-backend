import React from 'react';
import Card from './ui/Card';
import { Clock } from 'lucide-react';

const ActivityLog = ({ activities }) => {
    return (
        <Card className="h-full">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Activity Log
            </h3>

            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {activities.map((log, index) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-surface shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                        </div>

                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-surface-light/50 backdrop-blur-sm shadow-sm transition hover:border-primary/20">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                                <span className="font-bold text-text-primary">{log.action}</span>
                                <time className="font-mono text-xs text-text-secondary">{log.timestamp}</time>
                            </div>
                            {log.details && (
                                <p className="text-text-secondary text-sm">{log.details}</p>
                            )}
                        </div>
                    </div>
                ))}

                {activities.length === 0 && (
                    <div className="text-center text-text-secondary py-4">No recent activity.</div>
                )}
            </div>
        </Card>
    );
};

export default ActivityLog;
