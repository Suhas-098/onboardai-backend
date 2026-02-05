import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((msg, variant = 'default', duration = 5000) => {
        const id = Date.now();
        let toastObj = { id, variant, duration };

        if (typeof msg === 'string') {
            toastObj.title = msg;
        } else {
            toastObj = { ...toastObj, ...msg };
        }

        setToasts(prev => [...prev, toastObj]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cn(
                            "pointer-events-auto flex items-start w-full p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all animate-enter",
                            toast.variant === 'success' && "bg-background/90 border-primary/20 text-text-primary",
                            toast.variant === 'error' && "bg-background/90 border-danger/20 text-text-primary",
                            toast.variant === 'info' && "bg-background/90 border-primary/20 text-text-primary",
                            toast.variant === 'default' && "bg-surface border-white/10 text-text-primary"
                        )}
                    >
                        <div className="shrink-0 mr-3 mt-0.5">
                            {toast.variant === 'success' && <CheckCircle className="w-5 h-5 text-primary" />}
                            {toast.variant === 'error' && <AlertCircle className="w-5 h-5 text-danger" />}
                            {toast.variant === 'info' && <Info className="w-5 h-5 text-secondary" />}
                        </div>
                        <div className="flex-1">
                            {toast.title && <h3 className="text-sm font-semibold">{toast.title}</h3>}
                            {toast.description && <p className="text-xs text-text-secondary mt-1">{toast.description}</p>}
                        </div>
                        <button onClick={() => removeToast(toast.id)} className="shrink-0 ml-4 text-text-secondary hover:text-text-primary">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
