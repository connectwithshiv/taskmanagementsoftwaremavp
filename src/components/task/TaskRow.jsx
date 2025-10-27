// components/TaskRow.jsx - Task Table Row Component

import React from 'react';
import { Edit2, Trash2, Eye, CheckCircle, PlayCircle } from 'lucide-react';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';

const TaskRow = ({ 
  task, 
  onEdit, 
  onDelete, 
  onView,
  onStatusChange,
  selected = false,
  onSelect 
}) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <tr className={`
      border-b border-gray-200 hover:bg-gray-50 transition-colors
      ${selected ? 'bg-blue-50' : ''}
      ${isOverdue ? 'bg-red-50' : ''}
    `}>
      {/* Checkbox */}
      {onSelect && (
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(task.id, e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
        </td>
      )}
      
      {/* Title */}
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900" title={task.title}>
            {truncateText(task.title, 40)}
          </span>
          {task.description && (
            <span className="text-xs text-gray-500" title={task.description}>
              {truncateText(task.description, 50)}
            </span>
          )}
        </div>
      </td>
      
      {/* Category */}
      <td className="px-4 py-3">
        <span className="text-sm text-gray-700" title={task.categoryPath}>
          {truncateText(task.categoryPath, 30)}
        </span>
      </td>
      
      {/* Assigned To */}
      <td className="px-4 py-3">
        <span className="text-sm text-gray-700">
          {task.assignedToName || 'Unassigned'}
        </span>
      </td>
      
      {/* Status */}
      <td className="px-4 py-3">
        <TaskStatusBadge status={task.status} size="sm" />
      </td>
      
      {/* Priority */}
      <td className="px-4 py-3">
        <TaskPriorityBadge priority={task.priority} size="sm" />
      </td>
      
      {/* Due Date */}
      <td className="px-4 py-3">
        <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
          {formatDate(task.dueDate)}
          {isOverdue && (
            <span className="block text-xs text-red-500">Overdue</span>
          )}
        </span>
      </td>
      
      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {onView && (
            <button
              onClick={() => onView(task)}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="View Details"
            >
              <Eye size={16} />
            </button>
          )}
          
          {task.status === 'pending' && onStatusChange && (
            <button
              onClick={() => onStatusChange(task.id, 'in-progress')}
              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              title="Start Task"
            >
              <PlayCircle size={16} />
            </button>
          )}
          
          {task.status === 'in-progress' && onStatusChange && (
            <button
              onClick={() => onStatusChange(task.id, 'completed')}
              className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
              title="Complete Task"
            >
              <CheckCircle size={16} />
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              title="Edit Task"
            >
              <Edit2 size={16} />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Delete Task"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TaskRow;