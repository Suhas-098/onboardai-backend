import React from 'react';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';

const Timeline = ({ tasks }) => {
    // Sort tasks by due date
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    const getStatusIcon = (status, dueDate) => {
        if (status === 'Completed') return <CheckCircle className="w-5 h-5 text-green-500" />;
        if (new Date(dueDate) < new Date() && status !== 'Completed') return <AlertCircle className="w-5 h-5 text-red-500" />;
        if (status === 'In Progress') return <Clock className="w-5 h-5 text-blue-500" />;
        return <Circle className="w-5 h-5 text-gray-500" />;
    };

    const isOverdue = (task) => {
        return new Date(task.due_date) < new Date() && task.status !== 'Completed';
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-text-primary mb-4">Onboarding Timeline</h3>
            <div className="relative border-l-2 border-white/10 ml-3 space-y-8 pb-4">
                {sortedTasks.map((task, index) => (
                    <div key={task.id} className="relative pl-8">
                        {/* Timeline Connector Dot */}
                        <div className={`absolute -left-[9px] top-1 bg-background rounded-full p-1 border-2 ${isOverdue(task) ? 'border-red-500' : 'border-white/20'}`}>
                            {getStatusIcon(task.status, task.due_date)}
                        </div>

                        <div className={`p-4 rounded-xl border transition-all ${isOverdue(task) ? 'bg-red-500/5 border-red-500/20' : 'bg-surface border-white/5 hover:border-primary/20'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-semibold ${task.status === 'Completed' ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                                    {task.title}
                                </h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                                        isOverdue(task) ? 'bg-red-500/10 text-red-500' :
                                            'bg-blue-500/10 text-blue-500'
                                    }`}>
                                    {isOverdue(task) ? 'Overdue' : task.status}
                                </span>
                            </div>
                            <p className="text-sm text-text-secondary mb-2">{task.description}</p>
                            <div className="flex items-center text-xs text-text-secondary">
                                <Clock className="w-3 h-3 mr-1" />
                                Due: {new Date(task.due_date).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
                {sortedTasks.length === 0 && (
                    <div className="text-text-secondary ml-8">No tasks assigned yet.</div>
                )}
            </div>
        </div>
    );
};

export default Timeline;
