import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ShieldAlert,
    Activity,
    Settings,
    LogOut,
    FileText,
    UserCog
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' }, // Changed from '/' to '/dashboard' to avoid conflict with Landing
        { icon: Users, label: 'Employees', path: '/employees' },
        { icon: ShieldAlert, label: 'Risk Command', path: '/risk' },
        { icon: Activity, label: 'Insights', path: '/insights' },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: UserCog, label: 'Manage', path: '/manage' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 bg-surface border-r border-white/5 flex flex-col z-50">
            <div className="p-6 cursor-pointer" onClick={() => navigate('/')}>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary filter drop-shadow-glow">
                    OnboardAI
                </h1>
                <p className="text-xs text-text-secondary mt-1 tracking-wider uppercase">Enterprise Edition</p>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]"
                                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                            )
                        }
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                        {item.path === '/risk' && (
                            <span className="ml-auto w-2 h-2 rounded-full bg-danger animate-pulse" />
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5">
                <button className="flex items-center w-full px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-xl transition-colors">
                    <Settings className="w-5 h-5 mr-3" />
                    <span className="font-medium">Settings</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-danger hover:bg-danger/10 rounded-xl transition-colors mt-1"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
