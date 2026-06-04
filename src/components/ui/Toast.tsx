"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  error: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  info: "border-[#0066ff]/25 bg-[#0066ff]/10 text-sky-200",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed top-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 sm:w-[min(100%,22rem)] pointer-events-none"
        aria-live="polite"
        aria-relevant="additions"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const Icon = icons[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 12, scale: 0.98 }}
                className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl border shadow-lg backdrop-blur-md text-xs leading-relaxed ${styles[t.type]}`}
              >
                <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                <p className="flex-1 font-medium">{t.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 p-0.5 rounded opacity-70 hover:opacity-100 transition-opacity"
                  aria-label="Хаах"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
