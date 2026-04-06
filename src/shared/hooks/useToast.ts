import { useState, useCallback, useRef } from 'react';
import { TOAST_DURATION_MS } from '../constants/app';

export interface Toast {
  id: number;
  msg: string;
  type: 'info' | 'error';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((msg: string, type: 'info' | 'error' = 'info') => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  return { toasts, addToast };
}
