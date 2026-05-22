import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss for success, info, warning after 4s. Errors persist.
    if (type !== "error") {
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="w-4 h-4 text-success" />,
    error: <AlertCircle className="w-4 h-4 text-error" />,
    info: <Info className="w-4 h-4 text-info" />,
    warning: <AlertTriangle className="w-4 h-4 text-warning" />,
  };

  const borders = {
    success: "border-success/30 bg-success/5",
    error: "border-error/30 bg-error/5",
    info: "border-info/30 bg-info/5",
    warning: "border-warning/30 bg-warning/5",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-80 p-3 bg-bg-elevated border rounded-lg shadow-lg pointer-events-auto select-none animate-slide-in-right",
        borders[toast.type]
      )}
      role="alert"
    >
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 text-sm font-medium text-text-primary break-words">
        {toast.message}
      </div>
      <button
        onClick={onClose}
        className="text-text-secondary hover:text-text-primary transition-colors mt-0.5"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
