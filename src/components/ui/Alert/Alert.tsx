// src/components/ui/Alert/Alert.tsx
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
  isVisible?: boolean;
}

const alertStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    icon: CheckCircleIcon,
    iconColor: 'text-green-400',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    icon: XCircleIcon,
    iconColor: 'text-red-400',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-yellow-400',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-700',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    icon: InformationCircleIcon,
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
  },
};

export function Alert({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
  isVisible = true,
}: AlertProps) {
  const styles = alertStyles[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`rounded-md border ${styles.bg} ${styles.border} p-4 ${className}`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <styles.icon className={`h-5 w-5 ${styles.iconColor}`} aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${styles.titleColor}`}>{title}</h3>
              {message && (
                <div className={`mt-2 text-sm ${styles.messageColor}`}>{message}</div>
              )}
            </div>
            {onClose && (
              <div className="ml-auto pl-3">
                <button
                  type="button"
                  className={`inline-flex rounded-md ${styles.bg} p-1.5 ${styles.iconColor} hover:opacity-80 focus:outline-none`}
                  onClick={onClose}
                >
                  <span className="sr-only">Dismiss</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}