import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lightbulb, X, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ActionModal = ({ isOpen, onClose, employee }) => {
    if (!isOpen || !employee) return null;

    // Get recommendations from AI insight if available, otherwise from old analysis
    const recommendations = employee.ai_insight?.recommended_actions || employee.recommended_actions || [];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-2xl border border-white/10 max-w-lg w-full p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-primary" />
                    Recommended Actions
                </h2>
                <p className="text-text-secondary mb-6">AI-generated recommendations for {employee.name}</p>

                <div className="space-y-4">
                    {recommendations && recommendations.length > 0 ? (
                        recommendations.map((action, idx) => (
                            <div key={idx} className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5 items-start">
                                <div className="mt-1 bg-primary/20 p-1 rounded-full text-primary">
                                    <ArrowRight className="w-3 h-3" />
                                </div>
                                <span className="text-text-primary text-sm">{action}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-text-secondary italic">No specific actions recommended at this time.</p>
                    )}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const AlertsInsights = () => {
    const navigate = useNavigate();
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // 15 minutes stale time
    const staleTime = 15 * 60 * 1000;

    const { data: risks = [], isLoading } = useQuery({
        queryKey: ['risks-insights'],
        queryFn: () => api.get('/risks').then(res => res.data),
        staleTime,
        refetchInterval: 10000
    });

    const alerts = risks.filter(r => r.risk === 'Critical' || r.risk === 'Warning');
    const insights = risks.filter(r => r.ai_insight);
    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Alerts & Insights</h2>
                    <p className="text-text-secondary mt-1">AI-driven real-time monitoring and predictions</p>
                </div>
                <div className="text-sm text-text-secondary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live Updates
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <>
                    {/* ALERTS SECTION */}
                    <section className="space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2 text-danger">
                            <ShieldAlert className="w-5 h-5" />
                            Active Alerts
                        </h3>

                        <div className="space-y-4">
                            {alerts.length === 0 ? (
                                <div className="text-text-secondary p-4 border border-white/5 rounded-xl bg-surface-light/50">
                                    No critical alerts at this moment.
                                </div>
                            ) : (
                                alerts.map((item) => (
                                    <Card key={item.user_id} className="flex gap-5 items-start border-l-4 border-l-danger hover:transform hover:translate-x-1 transition-all duration-300">
                                        <div className="p-3 rounded-xl bg-danger/10 text-danger shrink-0">
                                            <ShieldAlert className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-lg text-text-primary">{item.risk_message}</h4>
                                                    <p className="text-text-secondary mt-1">
                                                        Employee <span className="text-text-primary font-medium">{item.name}</span> is at <span className="text-danger font-medium">{item.risk} Risk</span> level.
                                                    </p>
                                                </div>
                                                <span className="text-xs font-mono text-text-secondary bg-white/5 px-2 py-1 rounded">
                                                    Score: {item.score}%
                                                </span>
                                            </div>

                                            <div className="mt-4 flex gap-3">
                                                <Button
                                                    onClick={() => navigate(`/employees/${item.user_id}`)}
                                                    variant="secondary"
                                                    size="sm"
                                                >
                                                    View Details
                                                </Button>
                                                <Button
                                                    onClick={() => setSelectedEmployee(item)}
                                                    variant="danger"
                                                    size="sm"
                                                >
                                                    Take Action
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </section>

                    {/* INSIGHTS SECTION */}
                    <section className="space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                            <Lightbulb className="w-5 h-5" />
                            AI Insights
                        </h3>

                        <div className="space-y-4">
                            {insights.length === 0 ? (
                                <div className="text-text-secondary p-4 border border-white/5 rounded-xl bg-surface-light/50">
                                    No detailed insights available at this time.
                                </div>
                            ) : (
                                insights.map((item) => {
                                    const insight = item.ai_insight;
                                    return (
                                        <Card key={item.user_id} className="flex gap-5 items-start border-l-4 border-l-primary hover:transform hover:translate-x-1 transition-all duration-300 space-y-4">
                                            <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 mt-2">
                                                <Lightbulb className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 w-full">
                                                {/* Title Section */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-bold text-lg text-text-primary">AI Risk Insight</h4>
                                                        <p className="text-sm text-text-secondary mt-1">
                                                            Employee: <span className="text-text-primary font-medium">{item.name}</span>
                                                        </p>
                                                    </div>
                                                    <span className="text-xs font-mono text-text-secondary bg-white/5 px-3 py-1 rounded-lg">
                                                        Engagement: {insight.engagement_score}%
                                                    </span>
                                                </div>

                                                {/* Risk Insight Text */}
                                                <div className="bg-white/5 p-4 rounded-lg border border-white/5 mb-4">
                                                    <p className="text-sm text-text-primary leading-relaxed">
                                                        {insight.risk_insight}
                                                    </p>
                                                </div>

                                                {/* Detected Signals */}
                                                <div className="mb-4">
                                                    <h5 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Detected Signals</h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {insight.detected_signals && insight.detected_signals.map((signal, idx) => (
                                                            <span key={idx} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                                                                {signal}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* AI Prediction */}
                                                <div className="bg-white/5 p-3 rounded-lg border border-white/5 mb-4">
                                                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">AI Prediction</p>
                                                    <p className="text-sm text-text-primary italic font-medium">
                                                        "{insight.ai_prediction}"
                                                    </p>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-3">
                                                    <Button
                                                        onClick={() => navigate(`/employees/${item.user_id}`)}
                                                        variant="secondary"
                                                        size="sm"
                                                    >
                                                        View Details
                                                    </Button>
                                                    <Button
                                                        onClick={() => setSelectedEmployee(item)}
                                                        className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                                                        size="sm"
                                                    >
                                                        View Recommendations
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </section>
                </>
            )}

            <ActionModal
                isOpen={!!selectedEmployee}
                onClose={() => setSelectedEmployee(null)}
                employee={selectedEmployee}
            />
        </div>
    );
};

export default AlertsInsights;
