import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, X, Users as UsersIcon, Mail, Building, Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Button from '../components/ui/Button';
import SkeletonLoader from '../components/SkeletonLoader';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        department: ''
    });

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const fetchTemplates = useCallback(async () => {
        try {
            const res = await api.get('/templates');
            setTemplates(res.data);
        } catch (error) {
            console.error("Failed to load templates");
        }
    }, []);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/employees');
            setEmployees(response.data);
        } catch (error) {
            showToast('Failed to load employees', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchEmployees();
        fetchTemplates();
    }, [fetchEmployees, fetchTemplates]);

    const openAssignModal = (employee) => {
        setSelectedEmployee(employee);
        setIsAssignModalOpen(true);
    };

    const handleAssignTemplate = async () => {
        if (!selectedTemplate) return;
        setLoading(true);
        try {
            await api.post(`/employees/${selectedEmployee.id}/assign-template/${selectedTemplate}`);
            showToast(`Template assigned to ${selectedEmployee.name}`, 'success');
            setIsAssignModalOpen(false);
            fetchEmployees(); // Refresh progress
        } catch (error) {
            console.error("Assign template failed:", error.response?.data || error.message);
            showToast(error.response?.data?.message || 'Failed to assign template', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                fullName: formData.name // Ensure fullName is sent as requested
            };
            console.log("Creating employee with payload:", payload);
            await api.post('/users', payload);
            showToast(`Successfully created ${formData.name}`, 'success');
            setIsModalOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'employee', department: '' });
            fetchEmployees();
        } catch (error) {
            console.error("Create employee failed:", error.response?.data || error.message);
            showToast(error.response?.data?.message || 'Failed to create user. Please check your inputs.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Employee Management</h1>
                    <p className="text-text-secondary mt-1">Manage team members and roles</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2"
                >
                    <UserPlus className="w-5 h-5" />
                    Create Employee
                </Button>
            </div>

            {/* Employee List */}
            <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Role</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Department</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">Progress</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading && employees.length === 0 ? (
                            // Show 5 skeleton rows
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><SkeletonLoader /></td>
                                    <td className="px-6 py-4"><SkeletonLoader /></td>
                                    <td className="px-6 py-4"><SkeletonLoader width="80px" /></td>
                                    <td className="px-6 py-4"><SkeletonLoader width="100px" /></td>
                                    <td className="px-6 py-4"><SkeletonLoader /></td>
                                    <td className="px-6 py-4"><SkeletonLoader width="60px" /></td>
                                </tr>
                            ))
                        ) : (
                            employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-text-primary font-medium">{emp.name}</td>
                                    <td className="px-6 py-4 text-text-secondary">{emp.email || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary">{emp.dept || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all"
                                                    style={{ width: `${emp.progress || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-text-secondary w-12">{emp.progress || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openAssignModal(emp)}
                                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                                        >
                                            Assign Template
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Employee Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-2xl border border-white/10 max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-text-primary">Create New Employee</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    <UsersIcon className="w-4 h-4 inline mr-2" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-primary transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-primary transition-colors"
                                    placeholder="john@company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    <Lock className="w-4 h-4 inline mr-2" />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-primary transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-primary transition-colors"
                                >
                                    <option value="employee">Employee</option>
                                    <option value="intern">Intern</option>
                                    <option value="hr">HR</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    <Building className="w-4 h-4 inline mr-2" />
                                    Department
                                </label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Engineering"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-text-primary rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <Button
                                    type="submit"
                                    isLoading={loading}
                                    className="flex-1"
                                >
                                    Create Employee
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Template Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-2xl border border-white/10 max-w-sm w-full p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Assign Template</h2>
                        <p className="text-text-secondary mb-4">Select a template for {selectedEmployee?.name}</p>

                        <select
                            className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl mb-6"
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                        >
                            <option value="">Select Template...</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.task_count} tasks)</option>
                            ))}
                        </select>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsAssignModalOpen(false)}
                                className="flex-1 px-4 py-2 bg-white/5 rounded-lg text-text-primary"
                            >
                                Cancel
                            </button>
                            <Button
                                onClick={handleAssignTemplate}
                                disabled={!selectedTemplate || loading}
                                isLoading={loading}
                                className="flex-1"
                            >
                                Assign
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;
