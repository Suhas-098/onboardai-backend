import {
    CheckCircle,
    Clock,
    FileText,
    PlayCircle,
    AlertTriangle,
    Upload,
    Award
} from 'lucide-react';
import { endpoints } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useState, useEffect } from 'react';

const TaskItem = ({ task, onComplete, alerts = [] }) => {
    // Check if there is a warning/critical alert relevant to this task
    const relatedAlert = alerts.find(a =>
        (a.type === 'Critical' || a.type === 'Warning') &&
        a.message.toLowerCase().includes(task.name.toLowerCase())
    );

    const isCompleted = task.status === 'Completed';
    // Use dynamic icon logic
    const Icon = isCompleted ? CheckCircle : (relatedAlert ? AlertTriangle : FileText);

    return (
        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-white/5 group ${relatedAlert && !isCompleted ? 'border-warning/50 bg-warning/5' : 'bg-surface border-white/5'
            }`}>
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${isCompleted ? 'bg-success/20 text-success' :
                    relatedAlert ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
                    }`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className={`font-medium ${isCompleted ? 'text-text-primary line-through opacity-50' : 'text-text-primary'}`}>
                        {task.name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                        <span className="capitalize">{task.type || 'Standard'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due {task.dueDate}</span>
                    </div>
                    {relatedAlert && !isCompleted && (
                        <div className="mt-2 text-xs text-warning font-medium flex items-center gap-1">
                            ⚠️ HR: {relatedAlert.message}
                        </div>
                    )}
                </div>
            </div>
            {!isCompleted && (
                <Button size="sm" variant="secondary" onClick={() => onComplete(task.id)}>Mark Complete</Button>
            )}
        </div>
    );
};

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [overallProgress, setOverallProgress] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            if (!user?.id) return;
            try {
                const [tasksRes, alertsRes] = await Promise.all([
                    endpoints.employees.getTasks(user.id),
                    endpoints.alerts.getAll() // Assuming this returns relevant alerts
                ]);

                setTasks(tasksRes.data);
                setAlerts(alertsRes.data);

                // Calc progress based on tasks
                const completed = tasksRes.data.filter(t => t.status === 'Completed').length;
                const total = tasksRes.data.length;
                setOverallProgress(total > 0 ? Math.round((completed / total) * 100) : 0);

            } catch (err) {
                console.error("Dashboard load failed", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user?.id]);

    const handleCompleteTask = async (taskId) => {
        try {
            await endpoints.tasks.complete(taskId);
            // Refresh tasks
            const res = await endpoints.employees.getTasks(user.id);
            setTasks(res.data);

            // Re-calc progress
            const completed = res.data.filter(t => t.status === 'Completed').length;
            const total = res.data.length;
            setOverallProgress(total > 0 ? Math.round((completed / total) * 100) : 0);

        } catch (err) {
            console.error(err);
            alert("Failed to complete task");
        }
    };

    if (loading) return <div className="p-8 text-center text-text-secondary">Loading your workspace...</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Welcome back, {user?.name.split(' ')[0]}! 👋
                </h2>
                <p className="text-text-secondary mt-1">Here is your onboarding progress for today.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Tasks */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Your Action Items
                    </h3>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="p-4 text-center text-text-secondary">Loading tasks...</div>
                        ) : tasks.length === 0 ? (
                            <div className="p-4 text-center text-text-secondary">No tasks assigned.</div>
                        ) : (
                            tasks.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onComplete={handleCompleteTask}
                                    alerts={alerts}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Widgets (Strict Order: Upload -> Video -> Recommended) */}
                <div className="space-y-6">
                    {/* 1. Quick Upload */}
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

                    {/* 2. Video Training Player (New) */}
                    <Card>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <PlayCircle className="w-4 h-4 text-primary" /> Onboarding Training
                        </h3>
                        <div className="aspect-video bg-black rounded-lg overflow-hidden relative group cursor-pointer">
                            {/* Placeholder for Video Player */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
                                <PlayCircle className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform" />
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"
                                alt="Training Video"
                                className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute bottom-2 left-2 right-2">
                                <p className="text-white text-sm font-medium drop-shadow-md">Welcome to the Team</p>
                                <p className="text-white/80 text-xs">5:24</p>
                            </div>
                        </div>
                    </Card>

                    {/* 3. Recommended Training */}
                    <Card>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Award className="w-4 h-4" /> Recommended Training
                        </h3>
                        <div className="space-y-3">
                            {['Company Culture 101', 'Cybersecurity Basics', 'IT Setup Guide'].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-light hover:bg-white/5 cursor-pointer transition-colors group">
                                    <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <PlayCircle className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
