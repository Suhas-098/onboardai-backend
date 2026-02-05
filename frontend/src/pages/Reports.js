import { useState, useEffect } from 'react';
import { FileDown, PieChart, BarChart, TrendingUp, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';

const Reports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get('/reports/summary');
                setData(response.data);
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
                <Button variant="secondary">
                    <FileDown className="w-4 h-4 mr-2" /> Download Full Report
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-primary/5 border-primary/10">
                    <p className="text-sm text-text-secondary">Avg. Completion</p>
                    <h3 className="text-2xl font-bold text-primary mt-1">{data?.averages?.completion}%</h3>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="min-h-[300px]">
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
                                            style={{ width: `${(dept.count / data.total_employees) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium w-8 text-right">{dept.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="min-h-[300px]">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" /> Key Performance Indicators
                    </h3>
                    <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-surface-light/50 border border-white/5">
                            <p className="text-sm text-text-secondary mb-1">Time to Full Productivity</p>
                            <p className="text-xl font-bold">{data?.averages?.time_to_onboard}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-surface-light/50 border border-white/5">
                            <p className="text-sm text-text-secondary mb-1">First-Month Retention</p>
                            <p className="text-xl font-bold text-success">98.2%</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
