import React, { InputHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = ({ label, className = '', ...props }: InputProps) => {
  return (
    <div className="space-y-3 w-full">
      {label && (
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">
          {label}
        </label>
      )}
      <input 
        className={`block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all outline-none font-bold text-gray-900 shadow-sm disabled:opacity-50 placeholder:text-gray-300 ${className}`}
        {...props} 
      />
    </div>
  );
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'black';
  isLoading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
};

export const Button = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon, 
  className = '', 
  ...props 
}: ButtonProps) => {
  const variants = {
    primary: 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-100 border-none',
    secondary: 'bg-white border border-gray-100 text-gray-500 hover:text-gray-900 hover:border-gray-200 shadow-sm',
    danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white shadow-sm',
    black: 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200 border-none',
  };

  return (
    <button 
      className={`h-14 px-8 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer active:scale-95 ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && icon}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export const Select = ({ label, className = '', children, ...props }: SelectProps) => {
  return (
    <div className="space-y-3 w-full">
      {label && (
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">
          {label}
        </label>
      )}
      <select 
        className={`block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all outline-none font-bold text-gray-900 shadow-sm disabled:opacity-50 appearance-none ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export const Textarea = ({ label, className = '', ...props }: TextareaProps) => {
  return (
    <div className="space-y-3 w-full">
      {label && (
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block">
          {label}
        </label>
      )}
      <textarea 
        className={`block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-6 py-4 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all outline-none font-bold text-gray-900 shadow-sm disabled:opacity-50 placeholder:text-gray-300 ${className}`}
        rows={4}
        {...props}
      />
    </div>
  );
};

