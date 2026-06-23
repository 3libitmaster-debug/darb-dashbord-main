import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type?: AlertType;
  message: ReactNode;
  className?: string;
}

export const Alert = ({ type = 'info', message, className = '' }: AlertProps) => {
  const styles = {
    success: {
      wrapper: 'bg-green-50 text-green-700 border-green-100',
      icon: <CheckCircle2 size={18} className="shrink-0 text-green-600" />
    },
    error: {
      wrapper: 'bg-orange-50 text-orange-700 border-orange-100',
      icon: <AlertCircle size={18} className="shrink-0 text-orange-600" />
    },
    warning: {
      wrapper: 'bg-amber-50 text-amber-700 border-amber-100',
      icon: <AlertTriangle size={18} className="shrink-0 text-amber-600" />
    },
    info: {
      wrapper: 'bg-sky-50 text-sky-700 border-sky-100',
      icon: <Info size={18} className="shrink-0 text-sky-600" />
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 rounded-2xl p-4 text-xs font-bold border ${styles[type].wrapper} ${className}`}
    >
      {styles[type].icon}
      <div className="flex-1 leading-relaxed">{message}</div>
    </motion.div>
  );
};
