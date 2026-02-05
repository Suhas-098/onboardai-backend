import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Calendar, Target, Clock, AlertTriangle, Shield, CheckCircle, ArrowLeft, Send, Lock } from 'lucide-react';
import { endpoints } from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ActivityLog from '../components/ActivityLog';
import { useAuth } from '../context/AuthContext';

const EmployeeDetailPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // Current logged in user (Admin/HR)

    const [employee, setEmployee] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Alert Modal State
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("Warning");
    const [sendingAlert, setSendingAlert] = useState(false);

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        const loadDat = async () => {
            setLoading(true);
            try {
                // Parallel fetch for speed
                const [empRes, tasksRes, actRes] = await Promise.all([
                    endpoints.employees.getOne(userId),
                    isAdmin ? { data: [] } : endpoints.employees.getTasks(userId),
                    isAdmin ? { data: [] } : endpoints.employees.getActivity(userId)
                ]);

                setEmployee(empRes.data);
                setTasks(tasksRes.data);
                setActivities(actRes.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load employee details.");
            } finally {
                setLoading(false);
            }
        };

        if (userId) loadDat();
    }, [userId, isAdmin]);

    const handleSendAlert = async () => {
        if (!alertMessage) return;
        setSendingAlert(true);
        try {
            await endpoints.alerts.create({
                target_user_id: userId,
                type: alertType,
                message: alertMessage
            });
            setShowAlertModal(false);
            setAlertMessage("");
            alert("Alert sent successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to send alert.");
        } finally {
            setSendingAlert(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-text-secondary">Loading Profile...</div>;
    if (error) return <div className="p-8 text-center text-danger">{error}</div>;
    if (!employee) return <div className="p-8 text-center">Employee not found.</div>;

    const getRiskColor = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'delayed': return 'danger';
            case 'at risk': return 'warning';
            default: return 'success';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/employees')} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Employees
                </Button>
                {!isAdmin && (
                    <Button variant="danger" onClick={() => setShowAlertModal(true)}>
                        <AlertTriangle className="w-4 h-4 mr-2" /> Send Alert
                    </Button>
                )}
            </div>

            {/* Profile Header */}
            <Card className="p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl" />
                <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-surface-light to-surface border border-white/10 flex items-center justify-center text-4xl shadow-lg">
                        {employee.avatar}
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white">{employee.name}</h1>
                            {/* Only show Risk info if not admin and data exists */}
                            {!isAdmin && employee.risk && (
                                <Badge variant={getRiskColor(employee.risk)}>{employee.risk}</Badge>
                            )}
                            {isAdmin && (
                                <Badge variant="neutral"><Lock className="w-3 h-3 mr-1" /> Admin View</Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-text-secondary">
                            <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> {employee.role}</span>
                            <span className="flex items-center gap-1"><Target className="w-4 h-4" /> {employee.department}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {employee.joinedDate}</span>
                            <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {employee.email}</span>
                        </div>
                    </div>
                    {!isAdmin && (
                        <div className="text-right">
                            <div className="text-sm text-text-secondary mb-1">Onboarding Progress</div>
                            <div className="text-3xl font-mono font-bold text-primary">{employee.progress}%</div>
                        </div>
                    )}
                </div>
            </Card>

            {isAdmin ? (
                <Card className="p-12 text-center border-dashed border-white/10 bg-transparent">
                    <div className="flex flex-col items-center gap-4 text-text-secondary">
                        <Shield className="w-12 h-12 opacity-20" />
                        <h3 className="text-lg font-medium text-text-primary">Restricted Access</h3>
                        <p className="max-w-md mx-auto">
                            As an Administrator, you have limited visibility into employee onboarding details.
                            Task lists, documents, and risk assessments are strictly confidential to HR.
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Task List (2 cols) */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-primary" /> Onboarding Checklist
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs text-text-secondary uppercase border-b border-white/10">
                                            <th className="py-3 px-4">Task</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4">Due Date</th>
                                            <th className="py-3 px-4">Completed At</th>
                                            <th className="py-3 px-4">Time Spent</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {tasks.length > 0 ? tasks.map((task) => (
                                            <tr key={task.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4 font-medium text-text-primary">{task.name}</td>
                                                <td className="py-3 px-4">
                                                    <Badge variant={
                                                        task.status === 'Completed' ? 'success' :
                                                            task.status === 'In Progress' ? 'warning' : 'neutral'
                                                    }>
                                                        {task.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-text-secondary">{task.dueDate}</td>
                                                <td className="py-3 px-4 text-text-secondary">{task.completedAt}</td>
                                                <td className="py-3 px-4 text-text-secondary">{task.timeSpent}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="py-4 text-center text-text-secondary">No tasks assigned.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Explainable AI Risk */}
                        <Card>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" /> AI Risk Assessment
                            </h3>
                            <div className="flex gap-4 items-start bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="p-2 bg-surface rounded-lg">
                                    🤖
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-white mb-1">Risk Status: {employee.risk}</h4>
                                    <p className="text-text-secondary text-sm mb-2">{employee.riskReason}</p>
                                    <div className="text-xs text-text-secondary italic">
                                        AI Confidence: High. Based on task completion velocity and engagement delays.
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Activity Log (1 col) */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* HR Task Assignment Panel */}
                        {!isAdmin && (
                            <Card>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary" /> Assign New Task
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-text-secondary mb-1">Task Title</label>
                                        <input
                                            type="text"
                                            className="w-full bg-surface-light border border-white/10 rounded-lg p-2 text-white"
                                            placeholder="e.g. Upload Bank Details"
                                            id="taskTitle"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-text-secondary mb-1">Due Date</label>
                                            <input
                                                type="date"
                                                className="w-full bg-surface-light border border-white/10 rounded-lg p-2 text-white"
                                                id="taskDue"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-text-secondary mb-1">Priority</label>
                                            <select className="w-full bg-surface-light border border-white/10 rounded-lg p-2 text-white" id="taskPriority">
                                                <option value="Medium">Medium</option>
                                                <option value="High">High 🚨</option>
                                                <option value="Low">Low</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-text-secondary mb-1">Type</label>
                                        <select className="w-full bg-surface-light border border-white/10 rounded-lg p-2 text-white" id="taskType">
                                            <option value="Document">📄 Document</option>
                                            <option value="Training">🎓 Training</option>
                                            <option value="Form">📝 Form</option>
                                        </select>
                                    </div>
                                    <Button className="w-full" onClick={async () => {
                                        const title = document.getElementById('taskTitle').value;
                                        const date = document.getElementById('taskDue').value;
                                        const priority = document.getElementById('taskPriority').value;
                                        const type = document.getElementById('taskType').value;

                                        if (!title) return alert("Task title is required");

                                        try {
                                            await endpoints.tasks.assign({
                                                title,
                                                due_date: date,
                                                priority,
                                                type,
                                                target_user_id: userId
                                            });
                                            alert("Task assigned successfully!");
                                            // Reload to show new task
                                            window.location.reload();
                                        } catch (e) {
                                            console.error(e);
                                            alert("Failed to assign task");
                                        }
                                    }}>
                                        + Assign Task
                                    </Button>
                                </div>
                            </Card>
                        )}

                        <ActivityLog activities={activities} />
                    </div>
                </div>
            )}

            {/* Alert Modal */}
            {showAlertModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-6 border-primary/20 shadow-glow-primary">
                        <h3 className="text-xl font-bold mb-4">Send Alert to {employee.name}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Alert Type</label>
                                <select
                                    className="w-full bg-surface-light border border-white/10 rounded-lg p-2 text-white"
                                    value={alertType}
                                    onChange={(e) => setAlertType(e.target.value)}
                                >
                                    <option value="Warning">⚠️ Warning</option>
                                    <option value="Critical">🚨 Urgent</option>
                                    <option value="Info">ℹ️ Info</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Message</label>
                                <textarea
                                    className="w-full bg-surface-light border border-white/10 rounded-lg p-2 text-white h-24"
                                    placeholder="Enter your message..."
                                    value={alertMessage}
                                    onChange={(e) => setAlertMessage(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="ghost" onClick={() => setShowAlertModal(false)}>Cancel</Button>
                                <Button variant="primary" onClick={handleSendAlert} disabled={sendingAlert}>
                                    {sendingAlert ? "Sending..." : "Send Alert"} <Send className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default EmployeeDetailPage;
