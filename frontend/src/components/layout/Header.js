import React from 'react';
import { Search, Bell } from 'lucide-react';
import { cn } from '../../utils/cn';

const Header = () => {
    return (
        <header className="fixed top-0 left-64 right-0 h-16 bg-background/50 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-8">
            <div className="flex items-center flex-1 max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search employees, risks, or insights..."
                        className="w-full bg-surface/50 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-text-secondary/50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative text-text-secondary hover:text-primary transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-background animate-pulse" />
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-text-primary">Alex Johnson</p>
                        <p className="text-xs text-text-secondary">Senior HR Admin</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px]">
                        <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
                            <span className="font-bold text-xs text-primary">AJ</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
