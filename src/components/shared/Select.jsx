import React from 'react';

export const Select = ({ label, options, error, required, ...props }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select 
      className={`w-full px-4 py-2 rounded-lg border transition-colors ${
        error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
      } focus:outline-none focus:ring-2`}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);