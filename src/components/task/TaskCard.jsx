// components/TaskCard.jsx - Task Card Component

import React from 'react';
import { 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  PlayCircle,
  MessageSquare,
  Paperclip
} from 'lucide-react';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange,
  showActions = true,
  isDarkMode = false
}) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  
  const handleStartTask = () => {
    if (onStatusChange) {
      onStatusChange(task.id, 'in-progress');
    }
  };

  const handleCompleteTask = () => {
    if (onStatusChange) {
      onStatusChange(task.id, 'completed');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`
      group rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border
      ${isDarkMode 
        ? 'bg-slate-800 border-slate-700 hover:border-slate-600' 
        : 'bg-white border-gray-100 hover:border-blue-200'
      }
      ${isOverdue ? 'border-l-4 border-red-500 bg-red-50/30' : ''}
      hover:-translate-y-1 hover:scale-[1.02]
    `}>
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className={`text-xl font-bold group-hover:transition-colors duration-200 ${
              isDarkMode 
                ? 'text-slate-200 group-hover:text-blue-400' 
                : 'text-gray-800 group-hover:text-blue-700'
            }`}>
              {task.title}
            </h3>
            {isOverdue && (
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold animate-pulse">
                OVERDUE
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
          </div>
          
          {task.description && (
            <p className={`text-sm mb-4 line-clamp-2 leading-relaxed ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}
        </div>
        
        {showActions && (
          <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit && onEdit(task)}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? 'text-blue-400 hover:bg-blue-900/30' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
              title="Edit Task"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => onDelete && onDelete(task.id)}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? 'text-red-400 hover:bg-red-900/30' 
                  : 'text-red-600 hover:bg-red-50'
              }`}
              title="Delete Task"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
      
      {/* Task Details */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-5">
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          isDarkMode 
            ? 'text-slate-300 bg-slate-700' 
            : 'text-gray-600 bg-gray-50'
        }`}>
          <div className="p-1.5 bg-blue-100 rounded-md">
            <Tag size={16} className="text-blue-600" />
          </div>
          <span className="truncate font-medium" title={task.categoryPath}>
            {task.categoryPath || 'No Category'}
          </span>
        </div>
        
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          isDarkMode 
            ? 'text-slate-300 bg-slate-700' 
            : 'text-gray-600 bg-gray-50'
        }`}>
          <div className="p-1.5 bg-green-100 rounded-md">
            <User size={16} className="text-green-600" />
          </div>
          <span className="truncate font-medium" title={task.assignedToName}>
            {task.assignedToName || 'Unassigned'}
          </span>
        </div>
        
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          isOverdue 
            ? isDarkMode 
              ? 'bg-red-900/30 text-red-400' 
              : 'bg-red-50 text-red-600'
            : isDarkMode 
              ? 'text-slate-300 bg-slate-700' 
              : 'bg-gray-50 text-gray-600'
        }`}>
          <div className={`p-1.5 rounded-md ${
            isOverdue 
              ? 'bg-red-100' 
              : 'bg-orange-100'
          }`}>
            <Clock size={16} className={isOverdue ? 'text-red-600' : 'text-orange-600'} />
          </div>
          <span className="font-medium">Due: {formatDate(task.dueDate)}</span>
        </div>
        
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          isDarkMode 
            ? 'text-slate-300 bg-slate-700' 
            : 'text-gray-600 bg-gray-50'
        }`}>
          <div className="p-1.5 bg-purple-100 rounded-md">
            <Calendar size={16} className="text-purple-600" />
          </div>
          <span className="font-medium">Created: {formatDate(task.createdAt)}</span>
        </div>
      </div>

      {/* Additional Info */}
      {(task.comments?.length > 0 || task.attachments?.length > 0) && (
        <div className={`flex items-center gap-6 text-sm mb-5 pt-4 border-t ${
          isDarkMode 
            ? 'text-slate-400 border-slate-700' 
            : 'text-gray-500 border-gray-100'
        }`}>
          {task.comments?.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-100 rounded-md">
                <MessageSquare size={14} className="text-blue-600" />
              </div>
              <span className="font-medium">{task.comments.length} {task.comments.length === 1 ? 'comment' : 'comments'}</span>
            </div>
          )}
          {task.attachments?.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="p-1 bg-green-100 rounded-md">
                <Paperclip size={14} className="text-green-600" />
              </div>
              <span className="font-medium">{task.attachments.length} {task.attachments.length === 1 ? 'file' : 'files'}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Action Buttons */}
      {showActions && task.status !== 'completed' && task.status !== 'cancelled' && (
        <div className={`flex gap-3 pt-4 border-t ${
          isDarkMode ? 'border-slate-700' : 'border-gray-100'
        }`}>
          {task.status === 'pending' && (
            <button
              onClick={handleStartTask}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <PlayCircle size={16} />
              Start Task
            </button>
          )}
          
          {task.status === 'in-progress' && (
            <button
              onClick={handleCompleteTask}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <CheckCircle size={16} />
              Mark Complete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;