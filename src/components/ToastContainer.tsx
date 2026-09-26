import React from 'react';
import { AlertTriangle, X, ShieldAlert, ArrowRight, Bell } from 'lucide-react';
import { PHCNode } from '../types/health';

export interface ToastNotification {
  id: string;
  phcId: string;
  phcName: string;
  phcCode: string;
  medicineName: string;
  currentUnits: number;
  safeBufferUnits: number;
  percentageRemaining: number;
  timestamp: string;
}

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
  onInspectNode: (phcId: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  onInspectNode,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto p-4 rounded-xl bg-slate-900/95 backdrop-blur-md border border-rose-800/90 shadow-2xl shadow-rose-950/40 text-slate-100 animate-in slide-in-from-bottom-5 fade-in duration-200 flex flex-col gap-2"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-950 border border-rose-700/80 text-rose-400 shrink-0">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white tracking-tight">
                    CRITICAL DEPLETION ALERT (&lt;15% Threshold)
                  </h4>
                  <span className="font-mono text-[10px] text-rose-300 bg-rose-950 px-1.5 py-0.2 rounded border border-rose-800">
                    {toast.phcCode}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Sync Telemetry Tick · {toast.timestamp}
                </span>
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors shrink-0"
              title="Dismiss Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Details */}
          <div className="text-xs text-slate-200 pl-8 space-y-1">
            <div>
              <span className="font-semibold text-white">{toast.phcName}</span> reporting stock level of{' '}
              <span className="font-bold text-rose-400">{toast.medicineName}</span> at{' '}
              <span className="font-mono font-bold text-rose-400">{toast.percentageRemaining}%</span> of safe buffer.
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400">
              <span>
                Current: <strong className="text-rose-300">{toast.currentUnits}</strong> / Safe Buffer: {toast.safeBufferUnits}
              </span>
              <button
                onClick={() => {
                  onInspectNode(toast.phcId);
                  onDismiss(toast.id);
                }}
                className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-semibold font-sans hover:underline"
              >
                <span>Inspect Node</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
