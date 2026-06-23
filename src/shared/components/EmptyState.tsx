import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2rem] border border-gray-100 shadow-sm shadow-orange-50/20 max-w-lg mx-auto"
    >
      <div className="h-16 w-16 bg-gradient-to-br from-orange-50 to-orange-100/50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-black text-gray-900 mb-2 leading-none">{title}</h3>
      <p className="text-xs text-gray-400 font-bold leading-relaxed max-w-xs">{description}</p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </motion.div>
  );
};
