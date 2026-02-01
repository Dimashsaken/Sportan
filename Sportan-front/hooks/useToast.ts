import { useCallback } from 'react';
import useUIStore, { ToastType } from '@/store/uiStore';

interface ToastOptions {
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number;
}

export const useToast = () => {
  const showToastInStore = useUIStore((state) => state.showToast);

  const showToast = useCallback(
    ({ message, title, type = 'info', duration }: ToastOptions) => {
      if (!message) return;

      const resolvedTitle =
        title ||
        (type === 'error'
          ? 'Something went wrong'
          : type === 'success'
          ? 'Success'
          : type === 'warning'
          ? 'Heads up'
          : 'Notice');

      showToastInStore({
        title: resolvedTitle,
        message,
        type,
        duration,
      });
    },
    [showToastInStore]
  );

  return { showToast };
};

export default useToast;
