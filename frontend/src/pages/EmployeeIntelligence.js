import { useState, useRef, useMemo, useEffect } from 'react';
// ... (rest of imports remain the same, I will use a StartLine to just replace the import line)
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, Shield, UserCog, KeyRound, Power, ShieldAlert } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
// Button removed
import { endpoints } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ActionMenu = ({ isOpen, onClose, role, onNavigate, onAction }) => {
    const menuRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div ref={menuRef} className="absolute right-0 top-8 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {role === 'admin' ? (
                <div className="flex flex-col">
                    <button onClick={() => onNavigate()} className="px-4 py-3 text-sm text-left text-text-primary hover:bg-surface-light flex items-center gap-2">
                        <UserCog className="w-4 h-4 text-text-secondary" /> View Basic Profile
                    </button>
                    <button onClick={() => onAction('reset_login')} className="px-4 py-3 text-sm text-left text-text-primary hover:bg-surface-light flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-text-secondary" /> Reset Login
                    </button>
                    <button onClick={() => onAction('activate')} className="px-4 py-3 text-sm text-left text-text-primary hover:bg-surface-light flex items-center gap-2">
                        <Power className="w-4 h-4 text-text-secondary" /> Activate User
                    </button>
                </div>
            ) : (
                <div className="flex flex-col">
                    <button onClick={() => onNavigate()} className="px-4 py-3 text-sm text-left text-text-primary hover:bg-surface-light">
                        View Full Details
                    </button>
                </div>
            )}
        </div>
    );
};

const EmployeeAvatar = ({ emp }) => {
    const [imgError, setImgError] = useState(false);

    return (
        <div className="w-12 h-12 rounded-full bg-surface-light border border-border flex items-center justify-center text-lg font-bold text-primary shadow-inner overflow-hidden">
            {emp.avatar && !imgError ? (
                <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                <span>{emp.name.charAt(0)}</span>
            )}
        </div>
    );
};

const EmployeeIntelligence = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    const [openMenuId, setOpenMenuId] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    // 15 minutes stale time
    const staleTime = 15 * 60 * 1000;

    const { data: employees = [], isLoading, error } = useQuery({
        queryKey: ['employees'],
        queryFn: () => endpoints.employees.getAll().then(res => res.data),
        staleTime,
        refetchInterval: 10000
    });

    const handleAction = (action, employeeId) => {
        console.log(`Action: ${action} for employee: ${employeeId}`);
        // Implement actual action logic here (e.g., API calls)
        setOpenMenuId(null); // Close menu after action
    };

    const uniqueDepartments = useMemo(() => {
        return ['All', ...new Set(employees.map(e => e.department || e.dept).filter(Boolean))];
    }, [employees]);

    const processedEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (emp.dept && emp.dept.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesDept = selectedDept === 'All' || (emp.department === selectedDept || emp.dept === selectedDept);

            return matchesSearch && matchesDept;
        });
    }, [employees, searchTerm, selectedDept]);

    const getRiskVariant = (risk) => {
        if (!risk) return 'success';
        switch (risk.toLowerCase()) {
            case 'critical': return 'danger';
            case 'warning': return 'warning';
            case 'neutral': return 'warning';
            case 'good': return 'success';
            default: return 'success';
        }
    };

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><LoadingSpinner size="lg" /></div>;
    }

    if (error) {
        return (
            <div className="flex h-96 items-center justify-center text-danger">
                <p>Failed to load employee data.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-enter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-text-primary">
                        {user?.role === 'admin' ? 'User Administration' : 'Employee Intelligence'}
                    </h2>
                    <p className="text-text-secondary mt-1">
                        {user?.role === 'admin' ? 'Manage user accounts and access' : 'Real-time workforce monitoring and risk assessment'}
                    </p>
                </div>
                {/* Search & Filter */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-surface border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-all w-64"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="appearance-none bg-surface border border-border rounded-xl pl-10 pr-8 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-all cursor-pointer hover:bg-surface-light min-w-[140px]"
                        >
                            {uniqueDepartments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedEmployees.length > 0 ? (
                    processedEmployees.map((emp) => (
                        <Card key={emp.id} className="group relative overflow-visible">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex items-center gap-4">
                                    <EmployeeAvatar emp={emp} />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-text-primary">{emp.name}</h3>
                                            {user?.role === 'admin' && (
                                                <Shield className="w-3 h-3 text-text-secondary" />
                                            )}
                                        </div>
                                        <p className="text-xs text-text-secondary">{emp.role}</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <button
                                        className="text-text-secondary hover:text-primary transition-colors p-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === emp.id ? null : emp.id);
                                        }}
                                    >
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                    <ActionMenu
                                        isOpen={openMenuId === emp.id}
                                        onClose={() => setOpenMenuId(null)}
                                        role={user?.role}
                                        onNavigate={() => navigate(`/employees/${emp.id}`)}
                                        onAction={(action) => handleAction(action, emp.id)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-text-secondary">Department</span>
                                    <span className="text-text-primary">{emp.department || emp.dept || 'N/A'}</span>
                                </div>

                                {emp.score !== null && emp.score !== undefined ? (
                                    <>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-text-secondary">Onboarding Progress</span>
                                            <span className="font-mono text-primary">{emp.score}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-surface-light rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${emp.score}%` }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-text-secondary">Login Status</span>
                                        <Badge variant="success">Active</Badge>
                                    </div>
                                )}

                                {emp.risk && (
                                    <div className="pt-4 flex items-center justify-between border-t border-border">
                                        <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">AI Risk Score</span>
                                        <Badge variant={getRiskVariant(emp.risk)}>
                                            {emp.risk === 'Good' ? 'On Track' : (emp.risk === 'Critical' ? 'High Risk' : (emp.risk + ' Risk'))}
                                        </Badge>
                                    </div>
                                )}

                                {emp.risk_message && (
                                    <div className={`mt-2 text-xs p-2 rounded-lg border flex items-center gap-2 ${emp.risk === 'Critical' ? 'text-danger/80 bg-danger/5 border-danger/10' :
                                        emp.risk === 'Warning' ? 'text-alert bg-alert/5 border-alert/10' :
                                            emp.risk === 'Neutral' ? 'text-warning bg-warning/5 border-warning/10' :
                                                'text-success bg-success/5 border-success/10'
                                        }`}>
                                        <ShieldAlert className="w-3 h-3" />
                                        {emp.risk_message}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-text-secondary bg-surface rounded-xl border border-dashed border-border">
                        <UserCog className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No employees found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeIntelligence;
