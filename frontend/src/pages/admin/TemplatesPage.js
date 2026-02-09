import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Video, FileText, Upload, CheckSquare, Pencil } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { endpoints } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const TemplatesPage = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { showToast } = useToast();

    // New Template State
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTasks, setNewTasks] = useState([]);
    const [editingTemplate, setEditingTemplate] = useState(null); // Objects if editing, null if creating

    // Task Input State
    const [taskInput, setTaskInput] = useState({
        task_name: '',
        due_days: 3,
        task_type: 'Form',
        description: ''
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await endpoints.templates.getAll();
            setTemplates(res.data);
        } catch (error) {
            console.error("Failed to load templates", error);
            showToast("Failed to load templates", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAddTaskToDraft = () => {
        if (!taskInput.task_name) return;
        setNewTasks([...newTasks, { ...taskInput }]);
        setTaskInput({ task_name: '', due_days: 3, task_type: 'Form', description: '' });
    };

    const handleDeleteTaskFromDraft = (index) => {
        const updated = [...newTasks];
        updated.splice(index, 1);
        setNewTasks(updated);
    }

    const handleSaveTemplate = async () => {
        if (!newTemplateName || newTasks.length === 0) {
            showToast("Please provide a name and at least one task", "error");
            return;
        }

        try {
            if (editingTemplate) {
                // Update
                await endpoints.templates.update(editingTemplate.id, {
                    name: newTemplateName,
                    tasks: newTasks
                });
                showToast("Template updated successfully", "success");
            } else {
                // Create
                await endpoints.templates.create({
                    name: newTemplateName,
                    tasks: newTasks
                });
                showToast("Template created successfully", "success");
            }

            closeModal();
            fetchTemplates();
        } catch (error) {
            showToast("Failed to save template", "error");
        }
    };

    const handleEditTemplate = (template) => {
        setEditingTemplate(template);
        setNewTemplateName(template.name);
        setNewTasks(template.tasks || []); // Ensure tasks are loaded. If API returns shallow, might need fetch.
        // Assuming getAll returns tasks as per backend
        setShowCreateModal(true);
    }

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingTemplate(null);
        setNewTemplateName('');
        setNewTasks([]);
    }

    const handleDeleteTemplate = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await endpoints.templates.delete(id);
            setTemplates(templates.filter(t => t.id !== id));
            showToast("Template deleted", "success");
        } catch (error) {
            showToast("Failed to delete template", "error");
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Video': return <Video className="w-4 h-4 text-blue-400" />;
            case 'Upload': return <Upload className="w-4 h-4 text-orange-400" />;
            default: return <FileText className="w-4 h-4 text-green-400" />;
        }
    };

    return (
        <div className="space-y-6 animate-enter">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Onboarding Templates</h1>
                    <p className="text-text-secondary mt-1">Manage standard onboarding flows</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Create Template
                </Button>
            </div>

            {loading ? (
                <div className="text-center text-text-secondary">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(t => (
                        <Card key={t.id} className="hover:border-primary/30 transition-colors group relative">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-text-primary">{t.name}</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditTemplate(t)} className="text-text-secondary hover:text-primary p-1 rounded hover:bg-white/5 transition-all">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteTemplate(t.id)} className="text-text-secondary hover:text-danger p-1 rounded hover:bg-white/5 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4 space-y-2">
                                <div className="flex items-center text-sm text-text-secondary">
                                    <CheckSquare className="w-4 h-4 mr-2" />
                                    {t.tasks ? t.tasks.length : t.task_count} Tasks
                                </div>
                                <div className="flex items-center text-sm text-text-secondary">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Created on {t.created_at}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-2xl border border-white/10 max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-6">{editingTemplate ? 'Edit Template' : 'Create New Template'}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Template Name</label>
                                <input
                                    className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-text-primary focus:border-primary/50 outline-none"
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                    placeholder="e.g. Sales Onboarding"
                                />
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <h4 className="font-semibold mb-4">Add Tasks</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input
                                        className="px-4 py-2 bg-background border border-white/10 rounded-lg text-text-primary outline-none focus:border-primary/50"
                                        placeholder="Task Name"
                                        value={taskInput.task_name}
                                        onChange={(e) => setTaskInput({ ...taskInput, task_name: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTaskToDraft()}
                                    />
                                    <select
                                        className="px-4 py-2 bg-background border border-white/10 rounded-lg text-text-primary outline-none focus:border-primary/50"
                                        value={taskInput.task_type}
                                        onChange={(e) => setTaskInput({ ...taskInput, task_type: e.target.value })}
                                    >
                                        <option value="Form">Form</option>
                                        <option value="Video">Video</option>
                                        <option value="Upload">Document Upload</option>
                                    </select>
                                    <input
                                        type="number"
                                        className="px-4 py-2 bg-background border border-white/10 rounded-lg text-text-primary outline-none focus:border-primary/50"
                                        placeholder="Due (Days)"
                                        value={taskInput.due_days}
                                        onChange={(e) => setTaskInput({ ...taskInput, due_days: e.target.value })}
                                    />
                                </div>
                                <Button size="sm" variant="secondary" onClick={handleAddTaskToDraft} className="w-full">
                                    <Plus className="w-4 h-4 mr-2" /> Add Task
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-56 overflow-y-auto bg-background/50 p-4 rounded-lg">
                                {newTasks.map((task, i) => (
                                    <div key={i} className="flex justify-between items-center bg-surface p-2 rounded border border-white/5 group">
                                        <div className="flex items-center gap-2">
                                            {getIcon(task.task_type)}
                                            <span className="text-sm">{task.task_name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-text-secondary">Day {task.due_days}</span>
                                            <button onClick={() => handleDeleteTaskFromDraft(i)} className="text-text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {newTasks.length === 0 && <p className="text-center text-sm text-text-secondary">No tasks added yet.</p>}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-white/10">
                                <Button variant="secondary" className="flex-1" onClick={closeModal}>Cancel</Button>
                                <Button className="flex-1" onClick={handleSaveTemplate}>
                                    {editingTemplate ? 'Update Template' : 'Save Template'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplatesPage;
