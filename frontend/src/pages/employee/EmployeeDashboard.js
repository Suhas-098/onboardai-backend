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

const TaskItem = ({ task, onComplete, onContactHR, alerts = [] }) => {
    // Check if there is a warning/critical alert relevant to this task
    const relatedAlert = alerts.find(a =>
        (a.type === 'Critical' || a.type === 'Warning') &&
        a.message.toLowerCase().includes(task.name.toLowerCase())
    );

    const isCompleted = task.status === 'Completed';
    // Logic for missed deadline
    // Use dueDateRaw if available (ISO), else fallback to dueDate
    const deadlineDate = task.dueDateRaw ? new Date(task.dueDateRaw) : (task.dueDate ? new Date(task.dueDate) : null);
    const isMissed = !isCompleted && deadlineDate && deadlineDate < new Date();

    const Icon = isCompleted ? CheckCircle : (isMissed || relatedAlert ? AlertTriangle : FileText);

    return (
        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-white/5 group ${isMissed ? 'border-danger/50 bg-danger/5' : relatedAlert && !isCompleted ? 'border-warning/50 bg-warning/5' : 'bg-surface border-white/5'
            }`}>
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${isCompleted ? 'bg-success/20 text-success' :
                    isMissed ? 'bg-danger/20 text-danger' :
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
                        <span className={`flex items-center gap-1 ${isMissed ? 'text-danger font-medium' : ''}`}>
                            <Clock className="w-3 h-3" /> Due {task.dueDate}
                            {isMissed && " (Overdue)"}
                        </span>
                    </div>
                    {isMissed && (
                        <div className="mt-2 text-xs text-danger font-medium flex items-center gap-1 uppercase tracking-tight">
                            ⚠️ You missed the deadline. Please contact HR.
                        </div>
                    )}
                    {relatedAlert && !isCompleted && !isMissed && (
                        <div className="mt-2 text-xs text-warning font-medium flex items-center gap-1">
                            ⚠️ HR: {relatedAlert.message}
                        </div>
                    )}
                </div>
            </div>
            {!isCompleted && (
                isMissed ? (
                    <Button size="sm" variant="danger" onClick={() => onContactHR(task)}>Contact HR</Button>
                ) : (
                    <Button size="sm" variant="secondary" onClick={() => onComplete(task.id)}>Mark Complete</Button>
                )
            )}
        </div>
    );
};

const EmployeeDashboard = () => {
    const { user, setUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [overallProgress, setOverallProgress] = useState(0);
    const [contactTask, setContactTask] = useState(null);
    const [sendingMsg, setSendingMsg] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!user?.id) return;
            try {
                const [tasksRes, alertsRes] = await Promise.all([
                    endpoints.employees.getTasks(user.id),
                    endpoints.employees.getAlerts ? endpoints.employees.getAlerts(user.id) : endpoints.alerts.getAll() // Fallback
                ]);

                // Sort tasks: Missed -> Pending -> Completed
                const sortedTasks = tasksRes.data.sort((a, b) => {
                    const statusOrder = { 'Completed': 2, 'Pending': 1 };
                    // Custom logic: Missed is pending + overdue
                    const now = new Date();
                    const aDate = a.dueDateRaw ? new Date(a.dueDateRaw) : new Date(a.dueDate);
                    const bDate = b.dueDateRaw ? new Date(b.dueDateRaw) : new Date(b.dueDate);

                    const aMissed = a.status !== 'Completed' && aDate < now;
                    const bMissed = b.status !== 'Completed' && bDate < now;

                    if (aMissed && !bMissed) return -1;
                    if (!aMissed && bMissed) return 1;

                    if (a.status !== b.status) return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
                    return aDate - bDate;
                });

                setTasks(sortedTasks);
                setAlerts(alertsRes.data || []);

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
            const res = await endpoints.tasks.complete(taskId);

            // Update local tasks state instantly
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t));

            // Update user state if backend returned risk updates
            if (res.data.user_update && setUser) {
                setUser(prev => ({
                    ...prev,
                    risk: res.data.user_update.risk,
                    risk_message: res.data.user_update.risk_message
                }));
            }

            // Recalculate progress locally for immediate UI update
            setTasks(prev => {
                const updated = prev.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t);
                const completed = updated.filter(t => t.status === 'Completed').length;
                const total = updated.length;
                setOverallProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
                return updated;
            });

        } catch (err) {
            console.error("Task completion failed", err);
            // If it's a 401, the interceptor might handle it, but we show a message
            alert("Failed to complete task. Please ensure you are logged in.");
        }
    };

    const handleSendHRMessage = async () => {
        if (!contactTask) return;
        setSendingMsg(true);
        try {
            await endpoints.alerts.create({
                type: 'MISSED_DEADLINE_CONTACT',
                target_user_id: user.id, // Or HR ID if strictly targeted, but context implies we are sending alert TO system
                message: `I have missed the deadline for ${contactTask.name}. Please guide next steps.`
            });
            alert("👉 Message sent to HR successfully.");
            setContactTask(null);
        } catch (err) {
            console.error("Failed to send message", err);
            alert("Failed to send message. Please try again.");
        } finally {
            setSendingMsg(false);
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
                                    onContactHR={setContactTask}
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

                    {/* Removed Hardcoded Recommended Training Widget as per requirements to remove hardcoded data */}

                    {/* Contact HR Modal */}
                    {contactTask && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                            <Card className="max-w-md w-full shadow-2xl border-primary/20 animate-in zoom-in-95 duration-200">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-full bg-danger/10 text-danger">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Contact HR</h3>
                                        <p className="text-text-secondary text-sm">Action required for missed deadline</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="p-4 rounded-xl bg-surface-light border border-white/5">
                                        <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Overdue Task</p>
                                        <p className="font-medium">{contactTask.name}</p>
                                    </div>

                                    <p className="text-text-primary">
                                        "I have missed the deadline for {contactTask.name}. Please guide next steps."
                                    </p>

                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                        <FileText className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium">hr@company.com</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        onClick={handleSendHRMessage}
                                        disabled={sendingMsg}
                                    >
                                        {sendingMsg ? "Sending..." : "Send to HR"}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={() => setContactTask(null)}
                                        disabled={sendingMsg}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
