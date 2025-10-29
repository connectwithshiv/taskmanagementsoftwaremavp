// components/TaskRow.jsx - Task Table Row Component

import React from 'react';
import { Edit2, Trash2, Eye, CheckCircle, PlayCircle, Tag, User, Clock } from 'lucide-react';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';

const TaskRow = ({ 
  task, 
  onEdit, 
  onDelete, 
  onView,
  onStatusChange,
  selected = false,
  onSelect,
  isDarkMode = false
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
      group border-b transition-all duration-200
      ${isDarkMode 
        ? 'border-slate-700 hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-600' 
        : 'border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
      }
      ${selected ? (isDarkMode 
        ? 'bg-gradient-to-r from-slate-700 to-slate-600' 
        : 'bg-gradient-to-r from-blue-50 to-indigo-50'
      ) : ''}
      ${isOverdue ? (isDarkMode 
        ? 'bg-gradient-to-r from-red-900/20 to-pink-900/20' 
        : 'bg-gradient-to-r from-red-50 to-pink-50'
      ) : ''}
    `}>
      {/* Checkbox */}
      {onSelect && (
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(task.id, e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
        </td>
      )}
      
      {/* Title */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className={`font-semibold group-hover:transition-colors duration-200 ${
            isDarkMode 
              ? 'text-slate-200 group-hover:text-blue-400' 
              : 'text-gray-900 group-hover:text-blue-700'
          }`} title={task.title}>
            {truncateText(task.title, 40)}
          </span>
          {task.description && (
            <span className={`text-xs mt-1 ${
              isDarkMode ? 'text-slate-400' : 'text-gray-500'
            }`} title={task.description}>
              {truncateText(task.description, 50)}
            </span>
          )}
        </div>
      </td>
      
      {/* Category */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-100 rounded-md">
            <Tag size={14} className="text-blue-600" />
          </div>
          <span className={`text-sm font-medium ${
            isDarkMode ? 'text-slate-300' : 'text-gray-700'
          }`} title={task.categoryPath}>
            {truncateText(task.categoryPath, 30)}
          </span>
        </div>
      </td>
      
      {/* Assigned To */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-green-100 rounded-md">
            <User size={14} className="text-green-600" />
          </div>
          <span className={`text-sm font-medium ${
            isDarkMode ? 'text-slate-300' : 'text-gray-700'
          }`}>
            {task.assignedToName || 'Unassigned'}
          </span>
        </div>
      </td>
      
      {/* Status */}
      <td className="px-6 py-4">
        <TaskStatusBadge status={task.status} size="sm" />
      </td>
      
      {/* Priority */}
      <td className="px-6 py-4">
        <TaskPriorityBadge priority={task.priority} size="sm" />
      </td>
      
      {/* Due Date */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-md ${
            isOverdue ? 'bg-red-100' : 'bg-orange-100'
          }`}>
            <Clock size={14} className={isOverdue ? 'text-red-600' : 'text-orange-600'} />
          </div>
          <div>
            <span className={`text-sm font-medium ${
              isOverdue 
                ? 'text-red-600' 
                : isDarkMode 
                  ? 'text-slate-300' 
                  : 'text-gray-700'
            }`}>
              {formatDate(task.dueDate)}
            </span>
            {isOverdue && (
              <span className="block text-xs text-red-500 font-semibold">Overdue</span>
            )}
          </div>
        </div>
      </td>
      
      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onView && (
            <button
              onClick={() => onView(task)}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? 'text-slate-400 hover:bg-slate-600' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title="View Details"
            >
              <Eye size={16} />
            </button>
          )}
          
          {task.status === 'pending' && onStatusChange && (
            <button
              onClick={() => onStatusChange(task.id, 'in-progress')}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? 'text-blue-400 hover:bg-blue-900/30' 
                  : 'text-blue-600 hover:bg-blue-100'
              }`}
              title="Start Task"
            >
              <PlayCircle size={16} />
            </button>
          )}
          
          {task.status === 'in-progress' && onStatusChange && (
            <button
              onClick={() => onStatusChange(task.id, 'completed')}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? 'text-green-400 hover:bg-green-900/30' 
                  : 'text-green-600 hover:bg-green-100'
              }`}
              title="Complete Task"
            >
              <CheckCircle size={16} />
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? 'text-blue-400 hover:bg-blue-900/30' 
                  : 'text-blue-600 hover:bg-blue-100'
              }`}
              title="Edit Task"
            >
              <Edit2 size={16} />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? 'text-red-400 hover:bg-red-900/30' 
                  : 'text-red-600 hover:bg-red-100'
              }`}
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