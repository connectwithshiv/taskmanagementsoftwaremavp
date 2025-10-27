// components/TaskStatusBadge.jsx - Task Status Badge Component

import React from 'react';
import { CheckCircle, Clock, PlayCircle, XCircle } from 'lucide-react';

const TaskStatusBadge = ({ status, size = 'md', showIcon = true }) => {
  const statusConfig = {
    'pending': {
      label: 'Pending',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
      icon: Clock
    },
    'in-progress': {
      label: 'In Progress',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300',
      icon: PlayCircle
    },
    'completed': {
      label: 'Completed',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-300',
      icon: CheckCircle
    },
    'cancelled': {
      label: 'Cancelled',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
      icon: XCircle
    }
  };

  const sizeConfig = {
    'sm': {
      padding: 'px-2 py-0.5',
      fontSize: 'text-xs',
      iconSize: 12
    },
    'md': {
      padding: 'px-3 py-1',
      fontSize: 'text-xs',
      iconSize: 14
    },
    'lg': {
      padding: 'px-4 py-1.5',
      fontSize: 'text-sm',
      iconSize: 16
    }
  };

  const config = statusConfig[status] || statusConfig['pending'];
  const sizeStyle = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span className={`
      inline-flex items-center gap-1.5 
      ${config.bgColor} 
      ${config.textColor} 
      ${sizeStyle.padding} 
      ${sizeStyle.fontSize}
      rounded-full 
      font-medium 
      border 
      ${config.borderColor}
    `}>
      {showIcon && <Icon size={sizeStyle.iconSize} />}
      {config.label}
    </span>
  );
};

export default TaskStatusBadge;