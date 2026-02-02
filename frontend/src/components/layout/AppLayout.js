import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatWidget from '../ui/ChatWidget';

const AppLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background text-text-primary selection:bg-primary/30">
            <Sidebar />
            <Header />
            <main className="pl-64 pt-16 min-h-screen">
                <div className="max-w-7xl mx-auto p-8 animate-enter">
                    {children}
                </div>
            </main>

            {/* Background Ambient Glow */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px]" />
            </div>

            <ChatWidget />
        </div>
    );
};

export default AppLayout;
