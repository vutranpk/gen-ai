
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = "px-6 py-3 font-black transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand-200/50 hover:shadow-brand-300/60 rounded-2xl hover:scale-[1.01] active:scale-[0.98] border-none",
    secondary: "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300 font-bold text-[11px] uppercase tracking-[0.15em] shadow-sm rounded-xl hover:scale-[1.01] active:scale-[0.98]",
    danger: "bg-rose-50 border border-rose-100/30 text-rose-600 hover:bg-rose-100/50 hover:border-rose-200 font-bold text-[11px] uppercase tracking-widest rounded-xl hover:scale-[1.01] active:scale-[0.98]",
    ghost: "bg-transparent hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-xl font-medium text-xs border-none"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="animate-pulse">Processing...</span>
        </>
      ) : children}
    </button>
  );
};
