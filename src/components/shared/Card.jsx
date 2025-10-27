import React from 'react';

export const Card = ({ title, children, className = '', footer = null }) => (
  <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
    )}
    <div className="px-6 py-4">{children}</div>
    {footer && (
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
        {footer}
      </div>
    )}
  </div>
);