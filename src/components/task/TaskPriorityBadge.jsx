// components/TaskPriorityBadge.jsx - Task Priority Badge Component

import React from 'react';
import { AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const TaskPriorityBadge = ({ priority, size = 'md', showIcon = true }) => {
  const priorityConfig = {
    'urgent': {
      label: 'Urgent',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
      icon: AlertCircle
    },
    'high': {
      label: 'High',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-300',
      icon: ArrowUp
    },
    'medium': {
      label: 'Medium',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-300',
      icon: Minus
    },
    'low': {
      label: 'Low',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-300',
      icon: ArrowDown
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

  const config = priorityConfig[priority] || priorityConfig['medium'];
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

export default TaskPriorityBadge;