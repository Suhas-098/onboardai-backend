import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { cn } from '../../utils/cn';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Hi! I am your Onboarding AI Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking delay
        setTimeout(() => {
            const botMsg = {
                id: Date.now() + 1,
                type: 'bot',
                text: getResponse(userMsg.text)
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const getResponse = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('benefit') || lower.includes('insurance')) return "Enrollment for health insurance is open until Friday. You can upload your documents in the 'Compliance' tab.";
        if (lower.includes('salary') || lower.includes('pay')) return "Payroll is processed on the 15th and 30th of each month. Your first paycheck will be prorated.";
        if (lower.includes('holiday') || lower.includes('leave')) return "You have 15 days of PTO accrued annually. You can request leave through the HR portal.";
        if (lower.includes('wifi') || lower.includes('password')) return "The office guest network is 'Guest-WiFi' and the password is 'Welcome2026'.";
        return "I can help with onboarding tasks, documents, and company policies. Could you rephrase that?";
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] h-[500px] bg-surface border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-enter">
                    {/* Header */}
                    <div className="p-4 bg-surface-light border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">AI Assistant</h3>
                                <p className="text-xs text-primary flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    Online
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-text-secondary hover:text-text-primary">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/50" ref={scrollRef}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex gap-3", msg.type === 'user' ? "flex-row-reverse" : "")}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    msg.type === 'user' ? "bg-surface-light border border-white/5" : "bg-primary/10 text-primary"
                                )}>
                                    {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={cn(
                                    "p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed",
                                    msg.type === 'user'
                                        ? "bg-primary/10 text-primary rounded-tr-none border border-primary/10"
                                        : "bg-surface-light text-text-secondary rounded-tl-none border border-white/5"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-surface-light p-3 rounded-2xl rounded-tl-none border border-white/5">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-text-secondary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-text-secondary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-text-secondary/50 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-surface-light/30">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ask about onboarding..."
                                className="w-full bg-surface border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-text-secondary/50"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-background rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Float Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-primary text-background shadow-lg shadow-primary/30 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
                >
                    <MessageSquare className="w-6 h-6 fill-current" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse" />
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
