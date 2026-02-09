import { useState, useEffect } from 'react';
import { FileDown, PieChart, BarChart, TrendingUp, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { endpoints } from '../services/api';

const Reports = () => {
    const [data, setData] = useState(null);
    const [weeklyTrend, setWeeklyTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const [summaryRes, trendRes] = await Promise.all([
                    endpoints.reports.getSummary(),
                    endpoints.reports.getWeeklyRiskTrend()
                ]);
                setData(summaryRes.data);
                setWeeklyTrend(trendRes.data);
            } catch (error) {
                console.error("Failed to load reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Enterprise Reports</h2>
                    <p className="text-text-secondary mt-1">Detailed organizational onboarding analytics</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-primary/5 border-primary/10">
                    <p className="text-sm text-text-secondary">Avg. Completion</p>
                    <h3 className="text-2xl font-bold text-primary mt-1">{data?.averages?.completion ?? 0}%</h3>
                </Card>
                <Card>
                    <p className="text-sm text-text-secondary">Total Employees</p>
                    <h3 className="text-2xl font-bold mt-1">{data?.total_employees}</h3>
                </Card>
                <Card>
                    <p className="text-sm text-text-secondary">On Track</p>
                    <h3 className="text-2xl font-bold text-success mt-1">{data?.risk_summary?.on_track}</h3>
                </Card>
                <Card>
                    <p className="text-sm text-text-secondary">At Risk / Delayed</p>
                    <h3 className="text-2xl font-bold text-danger mt-1">
                        {data?.risk_summary?.at_risk + data?.risk_summary?.delayed}
                    </h3>
                </Card>
            </div>

            {/* Trends Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top 3 At Risk - Replaces the old KPI card or sits next to it? Let's assume we replace or add to it. User asked for "Report 2" view. */}
                <Card className="min-h-[300px]">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-danger" /> Top At-Risk Employees
                    </h3>
                    <div className="space-y-4">
                        {data?.top_risks && data.top_risks.length > 0 ? (
                            data.top_risks.map((emp, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-danger/5 rounded-lg border border-danger/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center text-danger font-bold text-xs">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-text-primary text-sm">{emp.name}</p>
                                            <p className="text-xs text-text-secondary">{emp.department}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-danger text-white text-xs rounded font-bold">{emp.risk}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-text-secondary text-sm">No high-risk employees detected.</p>
                        )}
                    </div>
                </Card>

                {/* Risk Trends - Simulated Graph */}
                <Card className="min-h-[300px]">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-primary" /> Weekly Risk Trends
                    </h3>
                    <div className="flex items-end justify-between h-48 px-4">
                        {weeklyTrend.length > 0 ? weeklyTrend.map((day, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 w-full">
                                <div
                                    className="w-full max-w-[40px] bg-primary/20 hover:bg-primary/40 transition-all rounded-t-sm relative group"
                                    style={{ height: `${(day.risks / 5) * 100}%` }} // Scale based on max 5 risks for demo
                                >
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        {day.risks}
                                    </span>
                                </div>
                                <span className="text-xs text-text-secondary">{day.day}</span>
                            </div>
                        )) : <p className="text-center w-full text-text-secondary">No trend data available.</p>}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="min-h-[250px]">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-secondary" /> Department Distribution
                    </h3>
                    <div className="space-y-4">
                        {data?.department_breakdown.map((dept, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-text-secondary">{dept.department}</span>
                                <div className="flex items-center gap-4 flex-1 max-w-[200px] mx-4">
                                    <div className="flex-1 h-2 bg-surface-light rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-secondary rounded-full"
                                            style={{ width: `${data.total_employees > 0 ? (dept.count / data.total_employees) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium w-8 text-right">{dept.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold mb-4 text-text-primary">Download Reports</h3>
                    <p className="text-text-secondary text-sm mb-6">Get detailed insights in PDF or CSV format.</p>
                    <Button
                        variant="primary"
                        className="w-full mb-3"
                        onClick={() => alert("Report generation started! You will be notified when it's ready.")}
                    >
                        <FileDown className="w-4 h-4 mr-2" /> Download Full Analytics PDF
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => alert("CSV export unavailable in demo mode.")}
                    >
                        <FileDown className="w-4 h-4 mr-2" /> Export Raw CSV
                    </Button>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
