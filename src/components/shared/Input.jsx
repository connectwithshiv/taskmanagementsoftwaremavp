import React from 'react';

export const Input = ({ label, error, required, ...props }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input 
      className={`w-full px-4 py-2 rounded-lg border transition-colors ${
        error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
      } focus:outline-none focus:ring-2`}
      {...props}
    />
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);