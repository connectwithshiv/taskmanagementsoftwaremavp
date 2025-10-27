import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`${sizeClass[size]} border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin`}></div>
      {text && <p className="text-slate-600 text-sm mt-4">{text}</p>}
    </div>
  );
};
export default LoadingSpinner;