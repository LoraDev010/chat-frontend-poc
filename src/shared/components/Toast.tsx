import type { Toast as ToastType } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: ToastType[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}
