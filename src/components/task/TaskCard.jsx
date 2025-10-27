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
  showActions = true 
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
      bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 p-6
      ${isOverdue ? 'border-l-4 border-red-500' : ''}
    `}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
            {isOverdue && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                OVERDUE
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
          </div>
          
          {task.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        
        {showActions && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onEdit && onEdit(task)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Task"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => onDelete && onDelete(task.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Task"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
      
      {/* Task Details */}
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Tag size={16} className="flex-shrink-0" />
          <span className="truncate" title={task.categoryPath}>
            {task.categoryPath || 'No Category'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <User size={16} className="flex-shrink-0" />
          <span className="truncate" title={task.assignedToName}>
            {task.assignedToName || 'Unassigned'}
          </span>
        </div>
        
        <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
          <Clock size={16} className="flex-shrink-0" />
          <span>Due: {formatDate(task.dueDate)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={16} className="flex-shrink-0" />
          <span>Created: {formatDate(task.createdAt)}</span>
        </div>
      </div>

      {/* Additional Info */}
      {(task.comments?.length > 0 || task.attachments?.length > 0) && (
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pt-3 border-t">
          {task.comments?.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare size={14} />
              <span>{task.comments.length} {task.comments.length === 1 ? 'comment' : 'comments'}</span>
            </div>
          )}
          {task.attachments?.length > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip size={14} />
              <span>{task.attachments.length} {task.attachments.length === 1 ? 'file' : 'files'}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Action Buttons */}
      {showActions && task.status !== 'completed' && task.status !== 'cancelled' && (
        <div className="flex gap-2 pt-4 border-t">
          {task.status === 'pending' && (
            <button
              onClick={handleStartTask}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <PlayCircle size={16} />
              Start Task
            </button>
          )}
          
          {task.status === 'in-progress' && (
            <button
              onClick={handleCompleteTask}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
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