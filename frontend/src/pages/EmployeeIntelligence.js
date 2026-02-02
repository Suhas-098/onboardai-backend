import { useState } from 'react';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { employees } from '../data/mockData';

const EmployeeIntelligence = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRiskVariant = (risk) => {
        switch (risk.toLowerCase()) {
            case 'high': return 'danger';
            case 'medium': return 'warning';
            default: return 'success';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Employee Intelligence
                    </h2>
                    <p className="text-text-secondary mt-1">Real-time workforce monitoring and risk assessment</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-surface border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all w-64"
                        />
                    </div>
                    <Button variant="secondary" size="md">
                        <Filter className="w-4 h-4 mr-2" /> Filter
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map((emp) => (
                    <Card key={emp.id} className="group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-surface-light border border-white/5 flex items-center justify-center text-lg font-bold text-primary shadow-inner">
                                    {emp.avatar}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary">{emp.name}</h3>
                                    <p className="text-xs text-text-secondary">{emp.role}</p>
                                </div>
                            </div>
                            <button className="text-text-secondary hover:text-white transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-secondary">Department</span>
                                <span className="text-text-primary">{emp.dept}</span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-secondary">Onboarding Progress</span>
                                <span className="font-mono text-primary">{emp.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-light rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${emp.progress}%` }}
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t border-white/5">
                                <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">AI Risk Score</span>
                                <Badge variant={getRiskVariant(emp.risk)}>
                                    {emp.risk} Risk
                                </Badge>
                            </div>

                            {emp.riskReason && (
                                <div className="mt-2 text-xs text-danger/80 bg-danger/5 p-2 rounded-lg border border-danger/10">
                                    ⚠️ {emp.riskReason}
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default EmployeeIntelligence;
