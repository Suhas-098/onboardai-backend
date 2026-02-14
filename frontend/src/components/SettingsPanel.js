import React from 'react';
import { X, Moon, Sun, Smartphone, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Card from './ui/Card';
import Button from './ui/Button';

const SettingsPanel = ({ isOpen, onClose }) => {
    const { theme, toggleTheme, notificationsEnabled, setNotificationsEnabled } = useTheme();
    const { user } = useAuth();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-enter">
            <Card className="w-full max-w-lg p-0 overflow-hidden border-white/10 shadow-glow-primary">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-surface-light">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Settings
                    </h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                    {/* Theme Settings */}
                    <section>
                        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Appearance</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => toggleTheme('dark')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-light border-white/5 text-text-secondary hover:bg-white/5'}`}
                            >
                                <Moon className="w-6 h-6 mb-2" />
                                <span className="text-sm font-medium">Dark</span>
                            </button>
                            <button
                                onClick={() => toggleTheme('light')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${theme === 'light' ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-light border-white/5 text-text-secondary hover:bg-white/5'}`}
                            >
                                <Sun className="w-6 h-6 mb-2" />
                                <span className="text-sm font-medium">Light</span>
                            </button>
                            <button
                                onClick={() => toggleTheme('system')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${theme === 'system' ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-light border-white/5 text-text-secondary hover:bg-white/5'}`}
                            >
                                <Smartphone className="w-6 h-6 mb-2" />
                                <span className="text-sm font-medium">System</span>
                            </button>
                        </div>
                    </section>

                    {/* Notifications */}
                    <section>
                        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Notifications</h3>
                        <div className="flex items-center justify-between p-4 bg-surface-light rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-text-primary">Push Notifications</div>
                                    <div className="text-xs text-text-secondary">Receive alerts about tasks and deadlines</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notificationsEnabled}
                                    onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </section>

                    {/* Profile Summary */}
                    <section>
                        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">My Profile</h3>
                        <div className="p-4 bg-surface-light rounded-xl border border-white/5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px]">
                                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center">
                                    <span className="font-bold text-lg text-white">{user?.avatar || '👤'}</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-text-primary">{user?.name}</h4>
                                <p className="text-sm text-text-secondary">{user?.email}</p>
                            </div>
                            <Badge variant="neutral">{user?.role}</Badge>
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t border-white/5 bg-surface-light flex justify-end">
                    <Button onClick={onClose}>Done</Button>
                </div>
            </Card>
        </div>
    );
};

const Badge = ({ children, variant }) => (
    <span className={`px-2 py-1 rounded text-xs font-medium border ${variant === 'neutral' ? 'bg-white/5 border-white/10 text-text-secondary' : 'bg-primary/10 border-primary/20 text-primary'
        }`}>
        {children}
    </span>
);

export default SettingsPanel;
