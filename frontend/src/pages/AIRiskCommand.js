import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import { endpoints } from '../services/api';

// Keep chart data mock for now as backend doesn't store history
const data = [
    { name: 'Mon', risk: 40 },
    { name: 'Tue', risk: 30 },
    { name: 'Wed', risk: 65 },
    { name: 'Thu', risk: 45 },
    { name: 'Fri', risk: 80 },
    { name: 'Sat', risk: 55 },
    { name: 'Sun', risk: 70 },
];

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
    const [summary, setSummary] = useState(null);
    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, risksRes] = await Promise.all([
                    endpoints.risks.getStats ? endpoints.risks.getStats() : fetch('/dashboard/summary').then(res => res.json()), // Fallback or use direct fetch if endpoints not updated
                    endpoints.risks.getAll()
                ]);

                // Handle different response structures if necessary
                setSummary(summaryRes.data || summaryRes);
                setRisks(risksRes.data);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const highRiskEmployees = risks
        .filter(r => r.risk === 'Delayed' || r.risk === 'At Risk')
        .sort((a, b) => a.score - b.score); // Lowest score first (assuming score is completion)

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold">AI Risk Command Center</h2>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={AlertTriangle}
                    label="High Risk Employees"
                    value={summary ? (summary.at_risk + summary.delayed) : '-'}
                    trend={summary ? `${Math.round(((summary.at_risk + summary.delayed) / summary.total_users) * 100)}% of total` : ''}
                    trendUp={false}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Avg Risk Score"
                    value="42"
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
                    <h3 className="text-lg font-semibold mb-6">Risk Trend Analysis</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#181B21', border: '1px solid #333' }}
                                    itemStyle={{ color: '#F8FAFC' }}
                                />
                                <Area type="monotone" dataKey="risk" stroke="#10B981" fillOpacity={1} fill="url(#colorRisk)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* High Risk Spotlight */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4 text-danger flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Critical Focus
                    </h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-4 text-text-secondary">Loading risks...</div>
                        ) : highRiskEmployees.length === 0 ? (
                            <div className="text-center py-4 text-text-secondary">No high risk employees.</div>
                        ) : (
                            highRiskEmployees.map((risk, index) => (
                                <div key={risk.user_id || index} className="p-4 rounded-xl bg-surface border border-white/5 hover:border-danger/20 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-text-primary">{risk.name}</span>
                                        <span className="text-danger font-bold">{risk.score}%</span>
                                    </div>
                                    <div className="w-full bg-surface-light h-1.5 rounded-full mb-2">
                                        <div className="bg-danger h-full rounded-full" style={{ width: `${risk.score}%` }} />
                                    </div>
                                    <p className="text-xs text-text-secondary">Risk: {risk.risk}</p>
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
