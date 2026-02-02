import React from 'react';
import { Bell, Info, ShieldAlert, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import { alerts } from '../data/mockData';

const AlertsInsights = () => {
    const getIcon = (level) => {
        switch (level) {
            case 'Critical': return ShieldAlert;
            case 'Warning': return Bell;
            case 'Success': return CheckCircle;
            default: return Info;
        }
    };

    const getColor = (level) => {
        switch (level) {
            case 'Critical': return 'text-danger';
            case 'Warning': return 'text-accent';
            case 'Success': return 'text-primary';
            default: return 'text-secondary';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Alerts & Insights</h2>
                <div className="text-sm text-text-secondary">Updating live...</div>
            </div>

            <div className="space-y-4">
                {alerts.map((alert) => {
                    const Icon = getIcon(alert.level);
                    const colorClass = getColor(alert.level);

                    return (
                        <Card key={alert.id} className="flex gap-4 items-start hover:bg-surface/80">
                            <div className={`p-2 rounded-lg bg-surface-light border border-white/5 ${colorClass}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-semibold ${colorClass}`}>{alert.title}</h3>
                                    <span className="text-xs text-text-secondary">{alert.time}</span>
                                </div>
                                <p className="text-text-secondary mt-1 text-sm leading-relaxed">{alert.desc}</p>

                                <div className="mt-3 flex gap-2">
                                    <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface border border-white/10 hover:bg-white/5 transition-colors">
                                        View Details
                                    </button>
                                    <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                                        Take Action
                                    </button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default AlertsInsights;
