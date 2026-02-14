import React, { useRef, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsPanel = ({ isOpen, onClose, alerts = [] }) => {
    const panelRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={panelRef}
            className="absolute top-16 right-20 w-80 md:w-96 bg-surface border border-white/10 rounded-xl shadow-2xl z-50 animate-enter overflow-hidden"
        >
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-surface-light">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                    <Bell className="w-4 h-4" /> Notifications
                </h3>
                <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
                {alerts.length === 0 ? (
                    <div className="p-8 text-center text-text-secondary flex flex-col items-center">
                        <Bell className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">No new notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${alert.type === 'Critical' ? 'bg-danger/5' : ''}`}
                                onClick={() => {
                                    // Navigate or mark as read logic could go here
                                    onClose();
                                    if (alert.type === 'Critical') navigate('/my-dashboard'); // Example redirect
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-1.5 rounded-full ${alert.type === 'Critical' ? 'bg-danger/20 text-danger' :
                                        alert.type === 'Warning' ? 'bg-warning/20 text-warning' :
                                            'bg-primary/20 text-primary'
                                        }`}>
                                        <Bell className="w-3 h-3" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-text-primary leading-snug">{alert.message}</p>
                                        <p className="text-xs text-text-secondary mt-1">{alert.created_at || 'Just now'}</p>
                                    </div>
                                    {!alert.read && (
                                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-2 border-t border-white/5 bg-surface-light text-center">
                <button className="text-xs text-primary hover:text-primary/80 font-medium py-1">
                    Mark all as read
                </button>
            </div>
        </div>
    );
};

export default NotificationsPanel;
