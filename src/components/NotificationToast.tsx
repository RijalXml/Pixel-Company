import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'handover';
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        let borderStyle = 'border-cyan-400 bg-[#09152a] text-cyan-200';
        let icon = <Info className="h-4 w-4 text-cyan-400" />;

        if (toast.type === 'success') {
          borderStyle = 'border-emerald-400 bg-[#071912] text-emerald-200';
          icon = <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
        } else if (toast.type === 'warning') {
          borderStyle = 'border-amber-400 bg-[#1c1407] text-amber-200';
          icon = <AlertTriangle className="h-4 w-4 text-amber-400" />;
        } else if (toast.type === 'handover') {
          borderStyle = 'border-purple-400 bg-[#150a24] text-purple-200';
          icon = <Sparkles className="h-4 w-4 text-purple-400" />;
        }

        return (
          <div
            key={toast.id}
            onClick={() => onDismiss(toast.id)}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-lg border-2 p-3 shadow-xl transition-all animate-bounce ${borderStyle}`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1">
              <h5 className="font-pixel text-[11px] font-bold">{toast.title}</h5>
              <p className="font-terminal text-xs text-slate-300 mt-0.5">{toast.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
