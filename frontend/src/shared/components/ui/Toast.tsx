import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp } from '../../theme/animations';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextProps {
  toasts: ToastItem[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType, duration = 4000) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const toast = {
    success: (msg: string, duration?: number) => context.addToast(msg, 'success', duration),
    warning: (msg: string, duration?: number) => context.addToast(msg, 'warning', duration),
    error: (msg: string, duration?: number) => context.addToast(msg, 'error', duration),
    info: (msg: string, duration?: number) => context.addToast(msg, 'info', duration),
  };

  return toast;
};

// Internal Toast Container component
const ToastContainer: React.FC<{ toasts: ToastItem[]; removeToast: (id: string) => void }> = ({
  toasts,
  removeToast,
}) => {
  const icons = {
    success: <CheckCircle2 size={18} className="text-success flex-shrink-0" />,
    warning: <AlertTriangle size={18} className="text-warning flex-shrink-0" />,
    error: <AlertOctagon size={18} className="text-danger flex-shrink-0" />,
    info: <Info size={18} className="text-info flex-shrink-0" />,
  };

  const containerMarkup = (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3.5 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            variants={fadeUp}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
            className="flex items-center gap-3.5 bg-card border border-border/80 text-foreground px-4 py-3.5 rounded-xl shadow-xl pointer-events-auto w-full font-sans text-sm font-semibold select-none"
          >
            <div>{icons[toast.type]}</div>
            <div className="flex-1 text-foreground/90">{toast.message}</div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5 hover:bg-secondary/60 rounded focus:outline-none"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(containerMarkup, document.body);
};
