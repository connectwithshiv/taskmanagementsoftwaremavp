// pages/TaskPage.jsx - Main Task Management Page
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Upload,
  RefreshCw,
  CheckSquare,
  Trash2
} from 'lucide-react';
import TaskService from '../services/taskService';
import TaskCard from '../components/task/TaskCard';
import TaskForm from '../components/task/TaskForm';
import TaskRow from '../components/task/TaskRow';

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  
  // UI State
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    categoryId: 'all',
    assignedTo: 'all'
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [tasks, searchQuery, filters, sortBy, sortOrder]);

  // Load all data
  const loadData = () => {
    try {
      // Load tasks
      const allTasks = TaskService.getAllTasks();
      setTasks(allTasks);
      
      // Load categories
      const categoryData = loadCategoriesFromStorage();
      setCategories(categoryData);
      
      // Load users
      const userData = loadUsersFromStorage();
      setUsers(userData);
      
      // Load statistics
      const stats = TaskService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Load categories from localStorage
  const loadCategoriesFromStorage = () => {
    try {
      const stored = window.localStorage.getItem('categoryData');
      if (stored) {
        const data = JSON.parse(stored);
        return data.categories?.filter(c => c.status === 'active') || [];
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
    return [];
  };

  // Load users from localStorage
  const loadUsersFromStorage = () => {
    try {
      const stored = window.localStorage.getItem('userData');
      if (stored) {
        return JSON.parse(stored) || [];
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
    return [];
  };

  // Apply filters and search
  const applyFilters = () => {
    let result = TaskService.searchTasks(searchQuery, filters);
    result = TaskService.sortTasks(result, sortBy, sortOrder);
    setFilteredTasks(result);
  };

  // Handle create task
  const handleCreateTask = (taskData) => {
    const result = TaskService.createTask(taskData);
    if (result.success) {
      loadData();
      setShowTaskForm(false);
      alert('Task created successfully!');
    } else {
      alert(result.message);
    }
  };

  // Handle update task
  const handleUpdateTask = (taskData) => {
    const result = TaskService.updateTask(editingTask.id, taskData);
    if (result.success) {
      loadData();
      setShowTaskForm(false);
      setEditingTask(null);
      alert('Task updated successfully!');
    } else {
      alert(result.message);
    }
  };

  // Handle delete task
  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const result = TaskService.deleteTask(taskId);
      if (result.success) {
        loadData();
        alert('Task deleted successfully!');
      } else {
        alert(result.message);
      }
    }
  };

  // Handle status change
  const handleStatusChange = (taskId, newStatus) => {
    const result = TaskService.updateTaskStatus(taskId, newStatus);
    if (result.success) {
      loadData();
    } else {
      alert(result.message);
    }
  };

  // Handle edit
  const handleEdit = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // Handle task selection
  const handleSelectTask = (taskId, selected) => {
    if (selected) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    }
  };

  // Handle select all
  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedTasks(filteredTasks.map(t => t.id));
    } else {
      setSelectedTasks([]);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedTasks.length === 0) {
      alert('Please select tasks to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} task(s)?`)) {
      const result = TaskService.bulkDelete(selectedTasks);
      if (result.success) {
        loadData();
        setSelectedTasks([]);
        alert(result.message);
      } else {
        alert(result.message);
      }
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = (status) => {
    if (selectedTasks.length === 0) {
      alert('Please select tasks to update');
      return;
    }
    
    const result = TaskService.bulkUpdateStatus(selectedTasks, status);
    if (result.success) {
      loadData();
      setSelectedTasks([]);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  // Handle export
  const handleExport = () => {
    const data = TaskService.exportTasks();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Task Management</h1>
              <p className="text-gray-600 mt-1">Manage and assign tasks to users based on categories</p>
            </div>
            <button
              onClick={() => {
                setEditingTask(null);
                setShowTaskForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Plus size={20} />
              Create Task
            </button>
          </div>
          
          {/* Statistics */}
          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">Total Tasks</div>
                <div className="text-2xl font-bold text-blue-700">{statistics.total}</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 font-medium">Pending</div>
                <div className="text-2xl font-bold text-gray-700">{statistics.byStatus.pending}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-600 font-medium">In Progress</div>
                <div className="text-2xl font-bold text-purple-700">{statistics.byStatus.inProgress}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="text-sm text-green-600 font-medium">Completed</div>
                <div className="text-2xl font-bold text-green-700">{statistics.byStatus.completed}</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <div className="text-sm text-red-600 font-medium">Overdue</div>
                <div className="text-2xl font-bold text-red-700">{statistics.overdue}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Filters and Actions Bar */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tasks by title, description, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'card' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List size={20} />
              </button>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={loadData}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                title="Export"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            {/* Category Filter */}
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            
            {/* User Filter */}
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters({...filters, assignedTo: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Users</option>
              {users.filter(u => u.status === 'active').map(user => (
                <option key={user.user_id} value={user.user_id}>{user.username}</option>
              ))}
            </select>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="createdAt">Created Date</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="title">Title</option>
            </select>
          </div>
          
          {/* Bulk Actions */}
          {selectedTasks.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">
                {selectedTasks.length} task(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkStatusUpdate('in-progress')}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Selected
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('completed')}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Complete Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={16} />
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Task Form Modal */}
        {showTaskForm && (
          <TaskForm
            task={editingTask}
            categories={categories}
            users={users}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
            isEdit={!!editingTask}
          />
        )}
        
        {/* Tasks Display */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <CheckSquare size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filters.status !== 'all' || filters.priority !== 'all' || filters.categoryId !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Get started by creating your first task'}
            </p>
            {!showTaskForm && (
              <button
                onClick={() => setShowTaskForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Task
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Card View */}
            {viewMode === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEdit}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
            
            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Assigned To</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Priority</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map(task => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onEdit={handleEdit}
                          onDelete={handleDeleteTask}
                          onStatusChange={handleStatusChange}
                          selected={selectedTasks.includes(task.id)}
                          onSelect={handleSelectTask}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Results Count */}
            <div className="mt-4 text-center text-sm text-gray-600">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskPage;