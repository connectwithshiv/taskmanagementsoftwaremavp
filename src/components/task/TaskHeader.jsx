// components/TaskHeader.jsx - Task Statistics Header Component

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  ListTodo
} from 'lucide-react';
import TaskService from '../services/TaskService';

const TaskHeader = ({ onNavigateToTasks }) => {
  const [stats, setStats] = useState(null);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [showQuickView, setShowQuickView] = useState(false);

  useEffect(() => {
    loadStatistics();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStatistics = () => {
    const statistics = TaskService.getStatistics();
    const overdue = TaskService.getOverdueTasks();
    const upcoming = TaskService.getUpcomingTasks(3);
    
    setStats(statistics);
    setOverdueTasks(overdue);
    setUpcomingTasks(upcoming);
  };

  if (!stats) return null;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Quick Stats */}
          <div className="flex items-center gap-6">
            {/* Total Tasks */}
            <div 
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              onClick={onNavigateToTasks}
              title="View all tasks"
            >
              <ListTodo size={20} className="text-gray-600" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-800">{stats.total}</span>
                <span className="text-xs text-gray-500">Total</span>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="flex items-center gap-2 px-3 py-2">
              <Clock size={20} className="text-yellow-600" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-yellow-700">{stats.byStatus.pending}</span>
                <span className="text-xs text-gray-500">Pending</span>
              </div>
            </div>

            {/* In Progress Tasks */}
            <div className="flex items-center gap-2 px-3 py-2">
              <TrendingUp size={20} className="text-blue-600" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-blue-700">{stats.byStatus.inProgress}</span>
                <span className="text-xs text-gray-500">In Progress</span>
              </div>
            </div>

            {/* Completed Tasks */}
            <div className="flex items-center gap-2 px-3 py-2">
              <CheckCircle size={20} className="text-green-600" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-green-700">{stats.byStatus.completed}</span>
                <span className="text-xs text-gray-500">Completed</span>
              </div>
            </div>

            {/* Overdue Tasks */}
            {stats.overdue > 0 && (
              <div 
                className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => setShowQuickView(!showQuickView)}
                title="View overdue tasks"
              >
                <AlertTriangle size={20} className="text-red-600" />
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-red-700">{stats.overdue}</span>
                  <span className="text-xs text-red-600">Overdue</span>
                </div>
              </div>
            )}

            {/* Due Today */}
            {stats.dueToday > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
                <Calendar size={20} className="text-orange-600" />
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-orange-700">{stats.dueToday}</span>
                  <span className="text-xs text-orange-600">Due Today</span>
                </div>
              </div>
            )}
          </div>

          {/* Completion Rate */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-500">Completion Rate</div>
              <div className="text-xl font-bold text-gray-800">{stats.completionRate}%</div>
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick View Panel */}
        {showQuickView && (overdueTasks.length > 0 || upcomingTasks.length > 0) && (
          <div className="border-t border-gray-200 py-4 mb-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Overdue Tasks */}
              {overdueTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Overdue Tasks ({overdueTasks.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {overdueTasks.slice(0, 5).map(task => (
                      <div 
                        key={task.id}
                        className="bg-red-50 border border-red-200 rounded-lg p-3 hover:bg-red-100 transition-colors cursor-pointer"
                        onClick={onNavigateToTasks}
                      >
                        <div className="font-medium text-sm text-gray-800 truncate">{task.title}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Due: {new Date(task.dueDate).toLocaleDateString()} • {task.assignedToName}
                        </div>
                      </div>
                    ))}
                    {overdueTasks.length > 5 && (
                      <div 
                        className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer text-center py-2"
                        onClick={onNavigateToTasks}
                      >
                        View all {overdueTasks.length} overdue tasks →
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upcoming Tasks */}
              {upcomingTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <Calendar size={16} />
                    Due This Week ({upcomingTasks.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {upcomingTasks.slice(0, 5).map(task => (
                      <div 
                        key={task.id}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-3 hover:bg-blue-100 transition-colors cursor-pointer"
                        onClick={onNavigateToTasks}
                      >
                        <div className="font-medium text-sm text-gray-800 truncate">{task.title}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Due: {new Date(task.dueDate).toLocaleDateString()} • {task.assignedToName}
                        </div>
                      </div>
                    ))}
                    {upcomingTasks.length > 5 && (
                      <div 
                        className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer text-center py-2"
                        onClick={onNavigateToTasks}
                      >
                        View all {upcomingTasks.length} upcoming tasks →
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskHeader;