import React, { useState, useEffect, useCallback } from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { endpoints } from '../../services/api';
import NotificationsPanel from './NotificationsPanel';

const Header = () => {
    const { user } = useAuth();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchNotifications = useCallback(async () => {
        if (!user?.id) return;
        try {
            const res = await endpoints.notifications.getAll(user.id);
            setAlerts(res.data);
            setUnreadCount(res.data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error("Failed to load notifications");
        }
    }, [user?.id]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleSearch = async (e) => {
        setSearchQuery(e.target.value);
        // In a real app, this would trigger a search results dropdown or page
        // For now, we will just log it or pass it to a context if needed
    };

    const isEmployee = user?.role === 'employee';

    return (
        <header className="fixed top-0 left-64 right-0 h-16 bg-background/50 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-8">
            <div className="flex items-center flex-1 max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder={isEmployee ? "Search your tasks, documents, or training..." : "Search employees, risks, or insights..."}
                        className="w-full bg-surface/50 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-text-secondary/50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <button
                        className="relative text-text-secondary hover:text-primary transition-colors p-1"
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-background animate-pulse" />
                        )}
                    </button>
                    <NotificationsPanel
                        isOpen={notificationsOpen}
                        onClose={() => setNotificationsOpen(false)}
                        alerts={alerts}
                        onMarkRead={fetchNotifications}
                    />
                </div>

                <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-text-primary">{user?.name || 'User'}</p>
                        <p className="text-xs text-text-secondary md:uppercase">{user?.role || 'Guest'}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary p-[1px]">
                        <div className="w-full h-full rounded-full bg-surface border border-surface overflow-hidden flex items-center justify-center">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerText = user.name?.charAt(0);
                                    }}
                                />
                            ) : (
                                <span className="text-xs font-bold text-primary">{user?.name?.charAt(0)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
