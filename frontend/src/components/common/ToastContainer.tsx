import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto bg-white/95 backdrop-blur-2xl border shadow-xl rounded-2xl p-4 flex items-start gap-3.5 ${
              toast.type === 'success'
                ? 'border-emerald-200 border-l-4 border-l-emerald-500'
                : toast.type === 'error'
                ? 'border-rose-200 border-l-4 border-l-rose-500'
                : 'border-pink-200 border-l-4 border-l-[#EC4899]'
            }`}
          >
            <div className={`p-1.5 rounded-xl shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : toast.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-pink-50 text-[#EC4899]'
            }`}>
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
              {toast.type === 'info' && <Info className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-xs font-black text-slate-900 tracking-tight">{toast.title}</p>
              {toast.message && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-medium">{toast.message}</p>}
              {toast.actionLabel && toast.onAction && (
                <button
                  onClick={() => {
                    toast.onAction?.();
                    removeToast(toast.id);
                  }}
                  className="mt-2 text-[11px] font-bold text-[#EC4899] hover:underline cursor-pointer"
                >
                  {toast.actionLabel}
                </button>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
