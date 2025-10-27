import React from 'react';

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  children, 
  ...props 
}) => {
  const baseClass = 'font-medium rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    ghost: 'text-slate-600 hover:bg-slate-100'
  };
  
  const sizes = { 
    sm: 'px-3 py-1.5 text-sm', 
    md: 'px-4 py-2 text-sm', 
    lg: 'px-6 py-3' 
  };
  
  return (
    <button 
      className={`${baseClass} ${variants[variant]} ${sizes[size]}`} 
      disabled={disabled} 
      {...props}
    >
      {children}
    </button>
  );
};