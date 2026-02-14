import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import { endpoints } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ icon: Icon, label, value, trend, trendUp }) => (
    <Card className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-surface-light text-primary">
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm text-text-secondary">{label}</p>
            <div className="flex items-end gap-2">
                <h4 className="text-2xl font-bold">{value}</h4>
                {trend && (
                    <span className={`text-xs mb-1 ${trendUp ? 'text-primary' : 'text-danger'}`}>
                        {trend}
                    </span>
                )}
            </div>
        </div>
    </Card>
);

const AIRiskCommand = () => {
    // 15 minutes stale time
    const staleTime = 15 * 60 * 1000;

    const { data: summary, isLoading: loadingSummary } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: () => endpoints.dashboard.getSummary().then(res => res.data),
        staleTime,
        refetchInterval: 10000
    });

    const { data: risks = [], isLoading: loadingRisks } = useQuery({
        queryKey: ['risks'],
        queryFn: () => endpoints.risks.getAll().then(res => res.data),
        staleTime,
        refetchInterval: 10000
    });

    const { data: riskTrend = [], isLoading: loadingTrend } = useQuery({
        queryKey: ['riskTrend'],
        queryFn: () => endpoints.dashboard.getRiskTrend().then(res => res.data),
        staleTime,
        refetchInterval: 10000
    });

    const { data: criticalFocus = [], isLoading: loadingCritical } = useQuery({
        queryKey: ['criticalFocus'],
        queryFn: () => endpoints.dashboard.getCriticalFocus().then(res => res.data),
        staleTime,
        refetchInterval: 10000
    });

    const { data: heatmap = [], isLoading: loadingHeatmap } = useQuery({
        queryKey: ['riskHeatmap'],
        queryFn: () => endpoints.dashboard.getRiskHeatmap().then(res => res.data),
        staleTime,
        refetchInterval: 10000
    });

    const { data: topImproved = [], isLoading: loadingTop } = useQuery({
        queryKey: ['topImproved'],
        queryFn: () => endpoints.dashboard.getTopImproved().then(res => res.data),
        staleTime,
        refetchInterval: 10000
    });

    const isLoading = loadingSummary || loadingRisks || loadingTrend || loadingCritical || loadingHeatmap || loadingTop;

    if (isLoading && !summary) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
                <LoadingSpinner size="xl" />
                <p className="mt-4 text-text-secondary animate-pulse">Analyzing workforce data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-enter">
            <h2 className="text-3xl font-bold">AI Risk Command Center</h2>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={AlertTriangle}
                    label="High Risk Employees"
                    value={summary ? (summary.at_risk + summary.delayed) : '-'}
                    trend={summary ? `${Math.round(((summary.at_risk + summary.delayed) / (summary.total_users || 1)) * 100)}% of total` : ''}
                    trendUp={false}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Avg Risk Score"
                    value={risks.length > 0 ? Math.round(risks.reduce((acc, r) => acc + (r.score || 0), 0) / risks.length) : '-'}
                    trend="AI Estimated"
                    trendUp={true}
                />
                <StatCard
                    icon={Users}
                    label="Total Monitored"
                    value={summary ? summary.total_users : '-'}
                    trend="Active"
                    trendUp={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <Card className="lg:col-span-2 min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-text-primary">Risk Trend Analysis</h3>
                        <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">Live Data</span>
                    </div>
                    <div className="h-[300px] w-full" style={{ height: 300, width: '100%', minHeight: '300px' }}>
                        {riskTrend && riskTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <AreaChart data={riskTrend}>
                                    <defs>
                                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgb(var(--text-secondary))" />
                                    <YAxis stroke="rgb(var(--text-secondary))" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', color: 'rgb(var(--text-primary))' }}
                                        itemStyle={{ color: 'rgb(var(--text-primary))' }}
                                    />
                                    <Area type="monotone" dataKey="risk" stroke="#10B981" fillOpacity={1} fill="url(#colorRisk)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-text-secondary">
                                No trend data available to display.
                            </div>
                        )}
                    </div>
                </Card>

                {/* Critical Focus - Real Data Only */}
                <Card className="flex flex-col">
                    <h3 className="text-lg font-semibold mb-4 text-danger flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Critical Focus
                    </h3>
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] custom-scrollbar">
                        {loadingCritical ? (
                            <div className="flex justify-center py-4"><LoadingSpinner size="sm" /></div>
                        ) : criticalFocus.length === 0 ? (
                            <div className="text-center py-4 text-text-secondary">No critical risk employees. System healthy.</div>
                        ) : (
                            criticalFocus.slice(0, 5).map((item, index) => (
                                <div key={item.id || index} className="p-3 rounded-lg bg-surface-light border border-white/5 hover:border-danger/20 transition-colors group cursor-pointer">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-text-primary text-sm">{item.name}</span>
                                        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-danger/10 text-danger">
                                            CRITICAL
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-secondary mb-2 line-clamp-2">{item.reason}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-text-secondary">
                                            <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                                            Action Needed
                                        </div>
                                        <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">View Details →</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Heatmap */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-text-primary">Department Risk Heatmap</h3>
                        <span className="text-xs text-text-secondary">Real-time Overview</span>
                    </div>
                    {heatmap.length === 0 && !loadingHeatmap ? (
                        <div className="text-center py-4 text-text-secondary">No department data available.</div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {heatmap.map((item, i) => (
                                <div key={item.department} className="p-3 rounded-lg bg-surface-light border border-white/5 flex flex-col items-center justify-center gap-1">
                                    <span className="text-xs text-text-secondary">{item.department}</span>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${item.risk_level === 'High' ? 'bg-danger/20 text-danger' :
                                        item.risk_level === 'Medium' ? 'bg-warning/20 text-warning' :
                                            'bg-primary/20 text-primary'
                                        }`}>
                                        {item.risk_level}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Top Improved */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-text-primary">Top Improved Employees</h3>
                        <span className="text-xs text-text-secondary">Last 7 Days</span>
                    </div>
                    <div className="space-y-3">
                        {topImproved.length === 0 && !loadingTop ? (
                            <div className="text-center py-4 text-text-secondary">No significant improvement data yet.</div>
                        ) : (
                            topImproved.map((item, i) => (
                                <div key={item.id} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center text-xs">
                                            {item.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-text-primary">{item.name}</div>
                                            <div className="text-xs text-text-secondary">{item.department}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-primary">{item.improvement_score}</div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AIRiskCommand;