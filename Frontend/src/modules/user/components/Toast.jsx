import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from './ui/toast';

const ToastContext = createContext(null);

export function ToastManager({ children }) {
    const [toasts, setToasts] = useState([]);

    const toast = useCallback(({ title, description, variant = "default", duration = 3000 }) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, title, description, variant, duration }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            <ToastProvider>
                {children}
                {toasts.map(({ id, title, description, variant, ...props }) => (
                    <Toast key={id} variant={variant} {...props}>
                        <div className="grid gap-1">
                            {title && <ToastTitle>{title}</ToastTitle>}
                            {description && <ToastDescription>{description}</ToastDescription>}
                        </div>
                        <ToastClose />
                    </Toast>
                ))}
                <ToastViewport />
            </ToastProvider>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastManager");
    return context;
};
