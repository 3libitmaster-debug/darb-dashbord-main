import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  maxWidth?: string;
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  footer, 
  icon,
  maxWidth = 'max-w-xl' 
}: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            className={`relative w-full ${maxWidth} bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 font-sans rtl shadow-orange-100/50`}
            dir="rtl"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-20">
              <div className="flex items-center gap-5">
                {icon && (
                  <div className="h-14 w-14 bg-orange-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-orange-100">
                    {icon}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight mb-1">{title}</h3>
                  {subtitle && (
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{subtitle}</p>
                  )}
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="h-12 w-12 rounded-2xl hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-all hover:text-gray-900 border border-transparent hover:border-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-6 bg-gray-50/50 border-t border-gray-200">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
