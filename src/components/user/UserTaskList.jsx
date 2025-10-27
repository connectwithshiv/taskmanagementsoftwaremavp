// components/user/UserTaskList.jsx - Task List for Regular Users

import React, { useState, useEffect } from 'react';
import { 
  MdCheckCircle, 
  MdRadioButtonUnchecked, 
  MdPlayCircle,
  MdCancel,
  MdAccessTime,
  MdCalendarToday,
  MdFolder,
  MdComment,
  MdAttachFile,
  MdRefresh
} from 'react-icons/md';
import TaskService from '../../services/TaskService';

const UserTaskList = ({ 
  currentUser, 
  categories = [],
  isDarkMode = false,
  selectedCategoryId = null // Filter by category if provided
}) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });

  // Load tasks assigned to current user
  const loadMyTasks = () => {
    setLoading(true);
    try {
      const allTasks = TaskService.getAllTasks();
      
      // Filter tasks assigned to current user
      const myTasks = allTasks.filter(task => 
        task.assignedTo === (currentUser.id || currentUser.user_id)
      );
      
      setTasks(myTasks);
      calculateStats(myTasks);
      
      console.log(`Loaded ${myTasks.length} tasks for user ${currentUser.username}`);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (taskList) => {
    const now = new Date();
    setStats({
      total: taskList.length,
      pending: taskList.filter(t => t.status === 'pending').length,
      inProgress: taskList.filter(t => t.status === 'in-progress').length,
      completed: taskList.filter(t => t.status === 'completed').length,
      overdue: taskList.filter(t => 
        t.dueDate && 
        new Date(t.dueDate) < now && 
        t.status !== 'completed'
      ).length
    });
  };

  // Apply filters
  useEffect(() => {
    let result = [...tasks];

    // Filter by category if provided
    if (selectedCategoryId) {
      result = result.filter(t => t.categoryId === selectedCategoryId);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(t => t.status === filterStatus);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      result = result.filter(t => t.priority === filterPriority);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term) ||
        t.categoryPath?.toLowerCase().includes(term)
      );
    }

    setFilteredTasks(result);
  }, [tasks, filterStatus, filterPriority, searchTerm, selectedCategoryId]);

  // Load tasks on mount
  useEffect(() => {
    loadMyTasks();
  }, [currentUser]);

  // Listen for changes from admin or other windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'taskManagement_tasks' || !e.key) {
        console.log('Tasks updated in storage - refreshing...');
        loadMyTasks();
      }
    };

    const handleTasksUpdated = () => {
      console.log('Tasks updated event - refreshing...');
      loadMyTasks();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tasksUpdated', handleTasksUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tasksUpdated', handleTasksUpdated);
    };
  }, [currentUser]);

  // Update task status
  const handleStatusChange = (taskId, newStatus) => {
    const result = TaskService.updateTaskStatus(
      taskId, 
      newStatus, 
      currentUser.id || currentUser.user_id
    );

    if (result.success) {
      loadMyTasks();
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  // Get status color and icon
  const getStatusConfig = (status) => {
    const configs = {
      'pending': {
        icon: MdRadioButtonUnchecked,
        color: isDarkMode ? 'text-gray-400' : 'text-gray-500',
        bg: isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
        text: 'Pending'
      },
      'in-progress': {
        icon: MdPlayCircle,
        color: isDarkMode ? 'text-blue-400' : 'text-blue-600',
        bg: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100',
        text: 'In Progress'
      },
      'completed': {
        icon: MdCheckCircle,
        color: isDarkMode ? 'text-green-400' : 'text-green-600',
        bg: isDarkMode ? 'bg-green-900/30' : 'bg-green-100',
        text: 'Completed'
      },
      'cancelled': {
        icon: MdCancel,
        color: isDarkMode ? 'text-red-400' : 'text-red-600',
        bg: isDarkMode ? 'bg-red-900/30' : 'bg-red-100',
        text: 'Cancelled'
      }
    };
    return configs[status] || configs.pending;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'urgent': isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
      'high': isDarkMode ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800',
      'medium': isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      'low': isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
    };
    return colors[priority] || colors.medium;
  };

  // Check if task is overdue
  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={MdFolder}
          color="blue"
          isDarkMode={isDarkMode}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={MdRadioButtonUnchecked}
          color="gray"
          isDarkMode={isDarkMode}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={MdPlayCircle}
          color="blue"
          isDarkMode={isDarkMode}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={MdCheckCircle}
          color="green"
          isDarkMode={isDarkMode}
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon={MdAccessTime}
          color="red"
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Filters and Search */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-slate-700 border-slate-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-blue-500`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-slate-700 border-slate-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-blue-500`}
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={loadMyTasks}
            className={`p-2 rounded-lg ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
            title="Refresh tasks"
          >
            <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <MdRefresh size={40} className="animate-spin mx-auto text-blue-500" />
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading tasks...
            </p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          } shadow`}>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'No tasks match your filters'
                : 'No tasks assigned to you yet'}
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              statusConfig={getStatusConfig(task.status)}
              priorityColor={getPriorityColor(task.priority)}
              isOverdue={isOverdue(task)}
              onStatusChange={handleStatusChange}
              isDarkMode={isDarkMode}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, isDarkMode }) => {
  const colorClasses = {
    blue: isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600',
    gray: isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600',
    green: isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600',
    red: isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
  };

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, statusConfig, priorityColor, isOverdue, onStatusChange, isDarkMode }) => {
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow hover:shadow-lg transition-shadow ${
      isOverdue ? 'border-2 border-red-500' : ''
    }`}>
      <div className="flex items-start justify-between gap-4">
        {/* Task Info */}
        <div className="flex-1">
          {/* Title and Priority */}
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColor}`}>
              {task.priority?.toUpperCase()}
            </span>
            {isOverdue && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                OVERDUE
              </span>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            {/* Category */}
            <div className="flex items-center gap-1">
              <MdFolder className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {task.categoryPath}
              </span>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <MdCalendarToday className={isOverdue ? 'text-red-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                <span className={isOverdue ? 'text-red-500 font-medium' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Estimated Hours */}
            {task.estimatedHours && (
              <div className="flex items-center gap-1">
                <MdAccessTime className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {task.estimatedHours}h estimated
                </span>
              </div>
            )}

            {/* Comments Count */}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MdComment className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {task.comments.length} comments
                </span>
              </div>
            )}

            {/* Attachments Count */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <MdAttachFile className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {task.attachments.length} files
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {task.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded text-xs ${
                    isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status Change Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onStatusChange(task.id, 'in-progress')}
            disabled={task.status === 'in-progress'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              task.status === 'in-progress'
                ? isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                : isDarkMode ? 'bg-slate-700 hover:bg-blue-900/30 text-gray-300' : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <MdPlayCircle size={18} />
            <span className="text-sm">Start</span>
          </button>

          <button
            onClick={() => onStatusChange(task.id, 'completed')}
            disabled={task.status === 'completed'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              task.status === 'completed'
                ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
                : isDarkMode ? 'bg-slate-700 hover:bg-green-900/30 text-gray-300' : 'bg-gray-100 hover:bg-green-100 text-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <MdCheckCircle size={18} />
            <span className="text-sm">Complete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTaskList;