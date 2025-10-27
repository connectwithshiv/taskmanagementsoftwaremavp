import React from 'react';
import { AlertCircle } from 'lucide-react';

export const EmptyState = ({ title, description, icon: Icon = AlertCircle }) => (
  <div className="text-center py-12">
    <Icon size={40} className="mx-auto text-slate-300 mb-4" />
    <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>
    <p className="text-slate-600 text-sm">{description}</p>
  </div>
);

export default EmptyState;
