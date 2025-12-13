import React from 'react';
export type Severity = 'success' | 'error' | 'info' | 'warning';
interface ToastContextValue {
  showToast: (opts: { message: string; severity?: Severity; autoHideDuration?: number }) => void;
}
export const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);
export const useToast = (): ToastContextValue => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
