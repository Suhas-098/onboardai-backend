import {
    CheckCircle,
    Clock,
    FileText,
    PlayCircle,
    AlertTriangle,
    Upload
} from 'lucide-react';
import { endpoints } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useState, useEffect } from 'react';
import Timeline from '../../components/employee/Timeline';
import SkeletonLoader from '../../components/SkeletonLoader';
import { Sparkles } from 'lucide-react';

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



const AINudge = ({ nudge }) => (
    <div className={`p-3 rounded-lg border text-sm mb-3 ${nudge.type === 'warning' ? 'bg-warning/10 border-warning/20 text-warning' :
        'bg-primary/10 border-primary/20 text-primary'
        }`}>
        <div className="flex gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
                <p className="font-medium mb-1">Message from HR</p>
                <p>{nudge.message}</p>
            </div>
        </div>
    </div>
);

const EmployeeDashboard = () => {
    const { user, setUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [notifications, setNotifications] = useState([]); // New state for nudges
    const [loading, setLoading] = useState(true);
    const [overallProgress, setOverallProgress] = useState(0);
    const [contactTask, setContactTask] = useState(null);
    const [sendingMsg, setSendingMsg] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'timeline'

    useEffect(() => {
        const loadData = async () => {
            if (!user?.id) return;
            try {
                const [tasksRes, alertsRes, notifRes] = await Promise.all([
                    endpoints.employees.getTasks(user.id),
                    endpoints.employees.getAlerts ? endpoints.employees.getAlerts(user.id) : endpoints.alerts.getAll(),
                    endpoints.notifications.getAll(user.id) // Fetch AI Nudges
                ]);

                // Sort tasks... (existing logic)
                const sortedTasks = tasksRes.data.sort((a, b) => {
                    const statusOrder = { 'Completed': 2, 'Pending': 1 };
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
                setNotifications(notifRes.data || []);

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
        // ... (existing completion logic)
        try {
            const res = await endpoints.tasks.complete(taskId);
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t));

            if (res.data.user_update && setUser) {
                setUser(prev => ({
                    ...prev,
                    risk: res.data.user_update.risk,
                    risk_message: res.data.user_update.risk_message
                }));
            }

            setTasks(prev => {
                const updated = prev.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t);
                const completed = updated.filter(t => t.status === 'Completed').length;
                const total = updated.length;
                setOverallProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
                return updated;
            });
        } catch (err) {
            console.error(err);
            alert("Failed to complete task.");
        }
    };

    const handleSendHRMessage = async () => {
        // ... (existing logic)
        if (!contactTask) return;
        setSendingMsg(true);
        try {
            await endpoints.alerts.create({
                type: 'MISSED_DEADLINE_CONTACT',
                target_user_id: user.id,
                message: `I have missed the deadline for ${contactTask.name}. Please guide next steps.`
            });
            alert("👉 Message sent to HR successfully.");
            setContactTask(null);
        } catch (err) {
            alert("Failed to send message.");
        } finally {
            setSendingMsg(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="h-20 w-1/3"><SkeletonLoader /></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-10 w-full"><SkeletonLoader /></div>
                        <div className="space-y-3">
                            <SkeletonLoader type="card" className="h-24" />
                            <SkeletonLoader type="card" className="h-24" />
                            <SkeletonLoader type="card" className="h-24" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <SkeletonLoader type="card" className="h-32" />
                        <SkeletonLoader type="card" className="h-40" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Welcome back, {user?.name.split(' ')[0]}! 👋
                </h2>
                <div className="flex items-center gap-4 mt-2">
                    <p className="text-text-secondary">Your onboarding progress: {overallProgress}%</p>
                    <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${overallProgress}%` }} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Tasks/Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Your Action Items
                        </h3>
                        <div className="flex bg-white/5 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1 rounded-md text-sm transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}
                            >
                                List
                            </button>
                            <button
                                onClick={() => setViewMode('timeline')}
                                className={`px-3 py-1 rounded-md text-sm transition-all ${viewMode === 'timeline' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}
                            >
                                Timeline
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="p-4 text-center text-text-secondary">Loading...</div>
                        ) : tasks.length === 0 ? (
                            <div className="p-4 text-center text-text-secondary">No tasks assigned.</div>
                        ) : viewMode === 'timeline' ? (
                            <Timeline tasks={tasks.map(t => ({
                                ...t,
                                title: t.name,
                                description: t.description || 'Complete this task',
                                due_date: t.dueDateRaw || t.dueDate
                            }))} />
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

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Message from HR Section */}
                    <Card className="border-primary/20 bg-primary/5">
                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-primary">
                            <Sparkles className="w-4 h-4" /> Message from HR
                        </h3>
                        {notifications.length > 0 ? (
                            notifications.map(n => <AINudge key={n.id} nudge={n} />)
                        ) : (
                            <p className="text-sm text-text-secondary">No new messages from HR.</p>
                        )}
                    </Card>

                    {/* Quick Upload */}
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

                    {/* Onboarding Training Playlist */}
                    <Card>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <PlayCircle className="w-4 h-4 text-primary" /> Onboarding Training
                        </h3>
                        <div className="space-y-4">
                            {[
                                { title: "Welcome to the Team", duration: "5:24", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop" },
                                { title: "Company Policies Overview", duration: "12:10", img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=600&auto=format&fit=crop" },
                                { title: "Security & Compliance", duration: "8:45", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop" },
                                { title: "Workplace Safety Basics", duration: "6:30", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop" }
                            ].map((video, idx) => (
                                <div key={idx} className="flex gap-3 items-center group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                                    <div className="relative w-24 h-16 bg-black rounded overflow-hidden flex-shrink-0">
                                        <img src={video.img} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <PlayCircle className="w-6 h-6 text-white opacity-80 group-hover:scale-110 transition-transform" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-text-primary leading-tight group-hover:text-primary transition-colors">{video.title}</h4>
                                        <p className="text-xs text-text-secondary mt-1">{video.duration}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

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
                                    <p className="text-text-primary">"I have missed the deadline for {contactTask.name}. Please guide next steps."</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="primary" className="flex-1" onClick={handleSendHRMessage} disabled={sendingMsg}>
                                        {sendingMsg ? "Sending..." : "Send to HR"}
                                    </Button>
                                    <Button variant="secondary" className="flex-1" onClick={() => setContactTask(null)} disabled={sendingMsg}>
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


