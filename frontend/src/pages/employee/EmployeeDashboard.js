import React from 'react';
import { CheckCircle2, Circle, FileText, PlayCircle, Upload, Award } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

const TaskItem = ({ title, status, type, due }) => {
    const Icon = status === 'completed' ? CheckCircle2 : Circle;
    return (
        <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${status === 'completed' ? 'bg-primary/5 border-primary/20' : 'bg-surface border-white/5 hover:bg-surface/80'}`}>
            <div className="flex items-center gap-4">
                <Icon className={`w-5 h-5 ${status === 'completed' ? 'text-primary' : 'text-text-secondary'}`} />
                <div>
                    <h4 className={`font-medium ${status === 'completed' ? 'text-text-primary line-through opacity-50' : 'text-text-primary'}`}>{title}</h4>
                    <p className="text-xs text-text-secondary capitalize">{type} • Due {due}</p>
                </div>
            </div>
            {status !== 'completed' && (
                <Button size="sm" variant="secondary">Start</Button>
            )}
        </div>
    );
};

const EmployeeDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            {/* Employee Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Welcome back, {user?.name.split(' ')[0]}!</h1>
                    <p className="text-text-secondary mt-1">You are on Day 5 of your onboarding journey.</p>
                </div>
                <div className="flex items-center gap-4 bg-surface/50 border border-white/5 px-4 py-2 rounded-xl backdrop-blur-md">
                    <div className="text-right">
                        <p className="text-xs text-text-secondary">Overall Progress</p>
                        <p className="text-xl font-bold text-primary">62%</p>
                    </div>
                    <div className="w-12 h-12 relative">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-surface-light" />
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-primary" strokeDasharray="125.6" strokeDashoffset={125.6 * (1 - 0.62)} strokeLinecap="round" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Task List */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Your Action Items
                    </h3>

                    <div className="space-y-3">
                        <TaskItem title="Sign Employment Contract" status="completed" type="Document" due="Done" />
                        <TaskItem title="Setup Company Email & Slack" status="completed" type="IT Setup" due="Done" />
                        <TaskItem title="Upload Photo ID" status="pending" type="Compliance" due="Today" />
                        <TaskItem title="Security Awareness Training" status="pending" type="Training" due="Tomorrow" />
                        <TaskItem title="Benefits Enrollment" status="pending" type="HR" due="Friday" />
                    </div>

                    <Card className="p-6 bg-gradient-to-r from-surface to-surface-light border-white/5">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg">Keep it up!</h4>
                                <p className="text-text-secondary text-sm mt-1 mb-4">You're moving 15% faster than the average for your role.</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    <Card>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Quick Upload
                        </h3>
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/20 hover:bg-white/5 transition-all cursor-pointer">
                            <Upload className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                            <p className="text-sm text-text-primary font-medium">Drop files here</p>
                            <p className="text-xs text-text-secondary mt-1">PDF, JPG, PNG up to 10MB</p>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <PlayCircle className="w-4 h-4" /> Recommended Training
                        </h3>
                        <div className="space-y-4">
                            <div className="group cursor-pointer">
                                <div className="aspect-video bg-surface-light rounded-lg relative overflow-hidden mb-2">
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                                        <PlayCircle className="w-8 h-8 text-white opacity-80 group-hover:scale-110 transition-transform" />
                                    </div>
                                </div>
                                <p className="text-sm font-medium">Company Culture 101</p>
                                <p className="text-xs text-text-secondary">12 mins</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
