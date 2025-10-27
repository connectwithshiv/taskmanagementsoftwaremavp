// // components/TaskList.jsx - Task List Display Component

// import React, { useState, useEffect } from 'react';
// import { 
//   Search, 
//   Filter, 
//   Plus, 
//   Edit, 
//   Trash2, 
//   CheckCircle, 
//   Circle, 
//   Clock, 
//   AlertTriangle,
//   User,
//   Calendar,
//   Tag,
//   ChevronDown,
//   ChevronUp,
//   MoreVertical
// } from 'lucide-react';
// import TaskService, { TASK_STATUS, TASK_PRIORITY } from '../services/TaskService';
// import TaskForm from './TaskForm';

// const TaskList = ({ categories = [], users = [], currentUser = null }) => {
//   const [tasks, setTasks] = useState([]);
//   const [filteredTasks, setFilteredTasks] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showTaskForm, setShowTaskForm] = useState(false);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedTasks, setSelectedTasks] = useState([]);
//   const [sortConfig, setSortConfig] = useState({ field: 'createdAt', order: 'desc' });
  
//   const [filters, setFilters] = useState({
//     status: 'all',
//     priority: 'all',
//     categoryId: 'all',
//     assignedTo: 'all'
//   });

//   // Load tasks on mount
//   useEffect(() => {
//     loadTasks();
//   }, []);

//   // Apply filters and search whenever they change
//   useEffect(() => {
//     applyFiltersAndSearch();
//   }, [tasks, searchTerm, filters, sortConfig]);

//   const loadTasks = () => {
//     const allTasks = TaskService.getAllTasks();
//     setTasks(allTasks);
//   };

//   const applyFiltersAndSearch = () => {
//     let result = TaskService.searchTasks(searchTerm, filters);
//     result = TaskService.sortTasks(result, sortConfig.field, sortConfig.order);
//     setFilteredTasks(result);
//   };

// //   const handleCreateTask = async (taskData) => {
// //   console.log('🚨 FORM HANDLER CALLED!');     // ← ADD THIS LINE
// //   console.log('🚨 Data received:', taskData);  // ← ADD THIS LINE
// //     console.log('=== TASKLIST CREATE DEBUG ===');
// //     console.log('Received taskData:', taskData);
// //     console.log('assignedTo:', taskData.assignedTo, typeof taskData.assignedTo);
// //     console.log('assignedToName:', taskData.assignedToName);

// const handleCreateTask = async (taskData) => {
//   console.group('🔵 CREATE TASK HANDLER');
//   console.log('Handler called!');
//   console.log('taskData:', taskData);
  
//   try {
//     // Validate
//     if (!taskData.title || !taskData.assignedTo) {
//       throw new Error('Missing required fields');
//     }
    
//     // Find user
//     const userId = String(taskData.assignedTo);
//     const user = users.find(u => String(u.id || u.user_id) === userId);
    
//     if (!user) {
//       throw new Error('User not found: ' + userId);
//     }
    
//     console.log('Found user:', user.username);
    
//     // Prepare final data
//     const finalData = {
//       ...taskData,
//       assignedTo: userId,
//       assignedToName: user.username,
//       createdBy: currentUser?.id || currentUser?.user_id || 'admin'
//     };
    
//     console.log('Calling TaskService.createTask...');
//     const result = TaskService.createTask(finalData);
//     console.log('Result:', result);
    
//     if (result.success) {
//       console.log('✅ Success!');
      
//       // Verify
//       const stored = JSON.parse(localStorage.getItem('taskManagement_tasks') || '{}');
//       console.log('💾 In storage:', stored.tasks?.length);
      
//       // Close form
//       setShowTaskForm(false);
      
//       // Wait
//       console.log('⏱️ Waiting 300ms...');
//       await new Promise(resolve => setTimeout(resolve, 300));
      
//       // Reload
//       console.log('🔄 Reloading...');
//       loadTasks();
      
//       alert('✅ Task created!');
//       console.groupEnd();
//     } else {
//       throw new Error(result.message);
//     }
//   } catch (error) {
//     console.error('❌ Error:', error);
//     console.groupEnd();
//     alert('Error: ' + error.message);
//   }
// };
    
//     // Normalize ID for comparison (handle both id and user_id)
//     const normalizedAssignedTo = String(taskData.assignedTo);
//     const selectedUser = users.find(u => String(u.id || u.user_id) === normalizedAssignedTo);
//     console.log('Found user:', selectedUser);
    
//     if (!selectedUser) {
//       console.error('ERROR: User not found for ID:', taskData.assignedTo);
//       console.log('Available users:', users.map(u => ({ id: u.id || u.user_id, name: u.username })));
//       alert('Error: User not found. Please check console.');
//       return;
//     }
    
//     const finalData = {
//       ...taskData,
//       assignedTo: String(taskData.assignedTo),
//       assignedToName: selectedUser.username,
//       createdBy: currentUser?.user_id || currentUser?.id || 'system'
//     };
    
//     console.log('Final data to TaskService:', finalData);
//     console.log('============================');
    
//     const result = TaskService.createTask(finalData);

//     if (result.success) {
//       console.log('✅ Task created successfully!');
      
//       // Verify it was saved to localStorage
//       const storedData = JSON.parse(localStorage.getItem('taskManagement_tasks') || '{}');
//       console.log('💾 Tasks in localStorage:', storedData.tasks?.length || 0);
      
//       // Close form immediately
//       setShowTaskForm(false);
      
//       // Wait for storage event to propagate
//       await new Promise(resolve => setTimeout(resolve, 300));
      
//       // Now reload tasks
//       console.log('🔄 Reloading tasks from storage...');
//       loadTasks();
      
//       alert('✅ Task created and assigned to ' + selectedUser.username);
//     } else {
//       console.error('❌ Failed to create task:', result.message);
//       alert(`❌ Error: ${result.message}`);
//     }
//   };

//   const handleUpdateTask = async (taskData) => {
//     console.log('=== TASKLIST UPDATE DEBUG ===');
//     console.log('Received taskData:', taskData);
//     console.log('assignedTo:', taskData.assignedTo, typeof taskData.assignedTo);
//     console.log('assignedToName:', taskData.assignedToName);
    
//     // Normalize ID for comparison (handle both id and user_id)
//     const normalizedAssignedTo = String(taskData.assignedTo);
//     const selectedUser = users.find(u => String(u.id || u.user_id) === normalizedAssignedTo);
//     console.log('Found user:', selectedUser);
    
//     if (!selectedUser) {
//       console.error('ERROR: User not found for ID:', taskData.assignedTo);
//       console.log('Available users:', users.map(u => ({ id: u.id || u.user_id, name: u.username })));
//       alert('Error: User not found. Please check console.');
//       return;
//     }
    
//     const finalData = {
//       ...taskData,
//       assignedTo: String(taskData.assignedTo),
//       assignedToName: selectedUser.username,
//       updatedBy: currentUser?.user_id || currentUser?.id || 'system'
//     };
    
//     console.log('Final data to TaskService:', finalData);
//     console.log('============================');
    
//     const result = TaskService.updateTask(selectedTask.id, finalData);

//     if (result.success) {
//       console.log('✅ Task updated successfully!');
      
//       // Close form
//       setShowTaskForm(false);
//       setSelectedTask(null);
      
//       // Wait for storage event
//       await new Promise(resolve => setTimeout(resolve, 300));
      
//       // Reload tasks
//       console.log('🔄 Reloading tasks from storage...');
//       loadTasks();
      
//       alert('✅ Task updated successfully!');
//     } else {
//       console.error('❌ Failed to update task:', result.message);
//       alert(`❌ Error: ${result.message}`);
//     } else {
//       alert(`Error: ${result.message}`);
//     }
//   };

//   const handleDeleteTask = (taskId) => {
//     if (window.confirm('Are you sure you want to delete this task?')) {
//       const result = TaskService.deleteTask(taskId, currentUser?.user_id || 'system');
      
//       if (result.success) {
//         loadTasks();
//         alert('Task deleted successfully!');
//       } else {
//         alert(`Error: ${result.message}`);
//       }
//     }
//   };

//   const handleStatusChange = (taskId, newStatus) => {
//     const result = TaskService.updateTaskStatus(taskId, newStatus, currentUser?.user_id || 'system');
    
//     if (result.success) {
//       loadTasks();
//     } else {
//       alert(`Error: ${result.message}`);
//     }
//   };

//   const handleBulkStatusChange = (status) => {
//     if (selectedTasks.length === 0) {
//       alert('Please select tasks first');
//       return;
//     }

//     const result = TaskService.bulkUpdateStatus(selectedTasks, status, currentUser?.user_id || 'system');
    
//     if (result.success) {
//       loadTasks();
//       setSelectedTasks([]);
//       alert(result.message);
//     }
//   };

//   const handleBulkDelete = () => {
//     if (selectedTasks.length === 0) {
//       alert('Please select tasks first');
//       return;
//     }

//     if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) {
//       const result = TaskService.bulkDelete(selectedTasks);
      
//       if (result.success) {
//         loadTasks();
//         setSelectedTasks([]);
//         alert(result.message);
//       }
//     }
//   };

//   const toggleTaskSelection = (taskId) => {
//     setSelectedTasks(prev => 
//       prev.includes(taskId) 
//         ? prev.filter(id => id !== taskId)
//         : [...prev, taskId]
//     );
//   };

//   const toggleSelectAll = () => {
//     if (selectedTasks.length === filteredTasks.length) {
//       setSelectedTasks([]);
//     } else {
//       setSelectedTasks(filteredTasks.map(t => t.id));
//     }
//   };

//   const handleSort = (field) => {
//     setSortConfig(prev => ({
//       field,
//       order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
//     }));
//   };

//   const getPriorityColor = (priority) => {
//     const colors = {
//       urgent: 'bg-red-100 text-red-800 border-red-300',
//       high: 'bg-orange-100 text-orange-800 border-orange-300',
//       medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
//       low: 'bg-green-100 text-green-800 border-green-300'
//     };
//     return colors[priority] || colors.medium;
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       pending: 'bg-gray-100 text-gray-800 border-gray-300',
//       'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
//       completed: 'bg-green-100 text-green-800 border-green-300',
//       cancelled: 'bg-red-100 text-red-800 border-red-300'
//     };
//     return colors[status] || colors.pending;
//   };

//   const getStatusIcon = (status) => {
//     const icons = {
//       pending: <Circle size={16} />,
//       'in-progress': <Clock size={16} />,
//       completed: <CheckCircle size={16} />,
//       cancelled: <AlertTriangle size={16} />
//     };
//     return icons[status] || icons.pending;
//   };

//   const isOverdue = (task) => {
//     return task.dueDate && 
//            new Date(task.dueDate) < new Date() && 
//            task.status !== TASK_STATUS.COMPLETED &&
//            task.status !== TASK_STATUS.CANCELLED;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'No date';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//   };

//   const statistics = TaskService.getStatistics();

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800">Task Management</h1>
//               <p className="text-gray-600 mt-1">{filteredTasks.length} tasks found</p>
//             </div>
//             <button
//               onClick={() => {
//                 setSelectedTask(null);
//                 setShowTaskForm(true);
//               }}
//               className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
//             >
//               <Plus size={20} />
//               Create Task
//             </button>
//           </div>

//           {/* Statistics */}
//           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
//             <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//               <div className="text-2xl font-bold text-gray-800">{statistics.total}</div>
//               <div className="text-sm text-gray-600">Total Tasks</div>
//             </div>
//             <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
//               <div className="text-2xl font-bold text-yellow-800">{statistics.byStatus.pending}</div>
//               <div className="text-sm text-yellow-700">Pending</div>
//             </div>
//             <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
//               <div className="text-2xl font-bold text-blue-800">{statistics.byStatus.inProgress}</div>
//               <div className="text-sm text-blue-700">In Progress</div>
//             </div>
//             <div className="bg-green-50 rounded-lg p-4 border border-green-200">
//               <div className="text-2xl font-bold text-green-800">{statistics.byStatus.completed}</div>
//               <div className="text-sm text-green-700">Completed</div>
//             </div>
//             <div className="bg-red-50 rounded-lg p-4 border border-red-200">
//               <div className="text-2xl font-bold text-red-800">{statistics.overdue}</div>
//               <div className="text-sm text-red-700">Overdue</div>
//             </div>
//             <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
//               <div className="text-2xl font-bold text-purple-800">{statistics.completionRate}%</div>
//               <div className="text-sm text-purple-700">Completion</div>
//             </div>
//           </div>
//         </div>

//         {/* Search and Filters */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="flex flex-col md:flex-row gap-4">
//             {/* Search */}
//             <div className="flex-1">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="text"
//                   placeholder="Search tasks by title, description, category, assignee..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>

//             {/* Filter Toggle */}
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//             >
//               <Filter size={20} />
//               Filters
//               {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//             </button>
//           </div>

//           {/* Filter Options */}
//           {showFilters && (
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
//                 <select
//                   value={filters.status}
//                   onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="pending">Pending</option>
//                   <option value="in-progress">In Progress</option>
//                   <option value="completed">Completed</option>
//                   <option value="cancelled">Cancelled</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
//                 <select
//                   value={filters.priority}
//                   onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="all">All Priorities</option>
//                   <option value="urgent">Urgent</option>
//                   <option value="high">High</option>
//                   <option value="medium">Medium</option>
//                   <option value="low">Low</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
//                 <select
//                   value={filters.categoryId}
//                   onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="all">All Categories</option>
//                   {categories.map(cat => (
//                     <option key={cat.id} value={cat.id}>{cat.name}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
//                 <select
//                   value={filters.assignedTo}
//                   onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="all">All Users</option>
//                   {users.map(user => (
//                     <option key={user.user_id} value={user.user_id}>{user.username}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Bulk Actions */}
//         {selectedTasks.length > 0 && (
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
//             <span className="text-blue-800 font-medium">
//               {selectedTasks.length} task(s) selected
//             </span>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handleBulkStatusChange(TASK_STATUS.IN_PROGRESS)}
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
//               >
//                 Mark In Progress
//               </button>
//               <button
//                 onClick={() => handleBulkStatusChange(TASK_STATUS.COMPLETED)}
//                 className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
//               >
//                 Mark Completed
//               </button>
//               <button
//                 onClick={handleBulkDelete}
//                 className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
//               >
//                 Delete Selected
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Task List */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           {filteredTasks.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="text-gray-400 mb-4">
//                 <Circle size={48} className="mx-auto" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-600 mb-2">No tasks found</h3>
//               <p className="text-gray-500">
//                 {searchTerm || filters.status !== 'all' || filters.priority !== 'all'
//                   ? 'Try adjusting your search or filters'
//                   : 'Create your first task to get started'}
//               </p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b border-gray-200">
//                   <tr>
//                     <th className="px-6 py-4 text-left">
//                       <input
//                         type="checkbox"
//                         checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
//                         onChange={toggleSelectAll}
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                     </th>
//                     <th 
//                       className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
//                       onClick={() => handleSort('title')}
//                     >
//                       Task {sortConfig.field === 'title' && (sortConfig.order === 'asc' ? '↑' : '↓')}
//                     </th>
//                     <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
//                     <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Assigned To</th>
//                     <th 
//                       className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
//                       onClick={() => handleSort('priority')}
//                     >
//                       Priority {sortConfig.field === 'priority' && (sortConfig.order === 'asc' ? '↑' : '↓')}
//                     </th>
//                     <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
//                     <th 
//                       className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
//                       onClick={() => handleSort('dueDate')}
//                     >
//                       Due Date {sortConfig.field === 'dueDate' && (sortConfig.order === 'asc' ? '↑' : '↓')}
//                     </th>
//                     <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {filteredTasks.map((task) => (
//                     <tr 
//                       key={task.id} 
//                       className={`hover:bg-gray-50 transition-colors ${
//                         isOverdue(task) ? 'bg-red-50' : ''
//                       }`}
//                     >
//                       <td className="px-6 py-4">
//                         <input
//                           type="checkbox"
//                           checked={selectedTasks.includes(task.id)}
//                           onChange={() => toggleTaskSelection(task.id)}
//                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                         />
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex flex-col">
//                           <span className="font-medium text-gray-900">{task.title}</span>
//                           {task.description && (
//                             <span className="text-sm text-gray-500 truncate max-w-md">
//                               {task.description.substring(0, 60)}
//                               {task.description.length > 60 ? '...' : ''}
//                             </span>
//                           )}
//                           {task.tags && task.tags.length > 0 && (
//                             <div className="flex gap-1 mt-1">
//                               {task.tags.slice(0, 3).map((tag, idx) => (
//                                 <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
//                                   <Tag size={10} />
//                                   {tag}
//                                 </span>
//                               ))}
//                               {task.tags.length > 3 && (
//                                 <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
//                               )}
//                             </div>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="text-sm text-gray-700">{task.categoryPath || 'N/A'}</span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-2">
//                           <User size={16} className="text-gray-400" />
//                           <span className="text-sm text-gray-700">
//                             {task.assignedToName || 
//                              users.find(u => String(u.id || u.user_id) === String(task.assignedTo))?.username || 
//                              'Unassigned'}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
//                           {task.priority.toUpperCase()}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <select
//                           value={task.status}
//                           onChange={(e) => handleStatusChange(task.id, e.target.value)}
//                           className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)} cursor-pointer`}
//                         >
//                           <option value="pending">Pending</option>
//                           <option value="in-progress">In Progress</option>
//                           <option value="completed">Completed</option>
//                           <option value="cancelled">Cancelled</option>
//                         </select>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-2">
//                           <Calendar size={16} className={isOverdue(task) ? 'text-red-500' : 'text-gray-400'} />
//                           <span className={`text-sm ${isOverdue(task) ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
//                             {formatDate(task.dueDate)}
//                             {isOverdue(task) && <span className="ml-1">(Overdue)</span>}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center justify-end gap-2">
//                           <button
//                             onClick={() => {
//                               setSelectedTask(task);
//                               setShowTaskForm(true);
//                             }}
//                             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                             title="Edit Task"
//                           >
//                             <Edit size={18} />
//                           </button>
//                           <button
//                             onClick={() => handleDeleteTask(task.id)}
//                             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                             title="Delete Task"
//                           >
//                             <Trash2 size={18} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Task Form Modal */}
//       {showTaskForm && (
//         <TaskForm
//           task={selectedTask}
//           categories={categories}
//           users={users}
//         //   onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
//           onSubmit={handleCreateTask}
//           onCancel={() => {
//             setShowTaskForm(false);
//             setSelectedTask(null);
//           }}
//           isEdit={!!selectedTask}
//         />
//       )}
//     </div>
//   );
// };

// export default TaskList;ß


// components/TaskList.jsx - Task List Display Component

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertTriangle,
  User,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  MoreVertical
} from 'lucide-react';
import TaskService, { TASK_STATUS, TASK_PRIORITY } from '../services/TaskService';
import TaskForm from './TaskForm';

const TaskList = ({ categories = [], users = [], currentUser = null }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: 'createdAt', order: 'desc' });
  
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    categoryId: 'all',
    assignedTo: 'all'
  });

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Apply filters and search whenever they change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [tasks, searchTerm, filters, sortConfig]);

  const loadTasks = () => {
    const allTasks = TaskService.getAllTasks();
    setTasks(allTasks);
  };

  const applyFiltersAndSearch = () => {
    let result = TaskService.searchTasks(searchTerm, filters);
    result = TaskService.sortTasks(result, sortConfig.field, sortConfig.order);
    setFilteredTasks(result);
  };

//   const handleCreateTask = async (taskData) => {
//   console.log('🚨 FORM HANDLER CALLED!');     // ← ADD THIS LINE
//   console.log('🚨 Data received:', taskData);  // ← ADD THIS LINE
//     console.log('=== TASKLIST CREATE DEBUG ===');
//     console.log('Received taskData:', taskData);
//     console.log('assignedTo:', taskData.assignedTo, typeof taskData.assignedTo);
//     console.log('assignedToName:', taskData.assignedToName);

const handleCreateTask = async (taskData) => {
  console.group('🔵 CREATE TASK HANDLER');
  console.log('Handler called!');
  console.log('taskData:', taskData);
  
  try {
    // Validate
    if (!taskData.title || !taskData.assignedTo) {
      throw new Error('Missing required fields');
    }
    
    // Find user
    const userId = String(taskData.assignedTo);
    const user = users.find(u => String(u.id) === userId);
    
    if (!user) {
      throw new Error('User not found: ' + userId);
    }
    
    console.log('Found user:', user.username);
    
    // Prepare final data
    const finalData = {
      ...taskData,
      assignedTo: userId,
      assignedToName: user.username,
      createdBy: currentUser?.id || 'admin'
    };
    
    console.log('Calling TaskService.createTask...');
    const result = TaskService.createTask(finalData);
    console.log('Result:', result);
    
    if (result.success) {
      console.log('✅ Success!');
      
      // Verify
      const stored = JSON.parse(localStorage.getItem('taskManagement_tasks') || '{}');
      console.log('💾 In storage:', stored.tasks?.length);
      
      // Close form
      setShowTaskForm(false);
      
      // Wait
      console.log('⏱️ Waiting 300ms...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload
      console.log('🔄 Reloading...');
      loadTasks();
      
      alert('✅ Task created!');
      console.groupEnd();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    console.groupEnd();
    alert('Error: ' + error.message);
  }
};
    
    // Normalize ID for comparison (handle both id and user_id)
    const normalizedAssignedTo = String(taskData.assignedTo);
    const selectedUser = users.find(u => String(u.id) === normalizedAssignedTo);
    console.log('Found user:', selectedUser);
    
    if (!selectedUser) {
      console.error('ERROR: User not found for ID:', taskData.assignedTo);
      console.log('Available users:', users.map(u => ({ id: u.id, name: u.username })));
      alert('Error: User not found. Please check console.');
      return;
    }
    
    const finalData = {
      ...taskData,
      assignedTo: String(taskData.assignedTo),
      assignedToName: selectedUser.username,
      createdBy: currentUser?.id || 'system'
    };
    
    console.log('Final data to TaskService:', finalData);
    console.log('============================');
    
    const result = TaskService.createTask(finalData);

    if (result.success) {
      console.log('✅ Task created successfully!');
      
      // Verify it was saved to localStorage
      const storedData = JSON.parse(localStorage.getItem('taskManagement_tasks') || '{}');
      console.log('💾 Tasks in localStorage:', storedData.tasks?.length || 0);
      
      // Close form immediately
      setShowTaskForm(false);
      
      // Wait for storage event to propagate
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Now reload tasks
      console.log('🔄 Reloading tasks from storage...');
      loadTasks();
      
      alert('✅ Task created and assigned to ' + selectedUser.username);
    } else {
      console.error('❌ Failed to create task:', result.message);
      alert(`❌ Error: ${result.message}`);
    }
  };

  const handleUpdateTask = async (taskData) => {
    console.log('=== TASKLIST UPDATE DEBUG ===');
    console.log('Received taskData:', taskData);
    console.log('assignedTo:', taskData.assignedTo, typeof taskData.assignedTo);
    console.log('assignedToName:', taskData.assignedToName);
    
    // Normalize ID for comparison (handle both id and user_id)
    const normalizedAssignedTo = String(taskData.assignedTo);
    const selectedUser = users.find(u => String(u.id) === normalizedAssignedTo);
    console.log('Found user:', selectedUser);
    
    if (!selectedUser) {
      console.error('ERROR: User not found for ID:', taskData.assignedTo);
      console.log('Available users:', users.map(u => ({ id: u.id, name: u.username })));
      alert('Error: User not found. Please check console.');
      return;
    }
    
    const finalData = {
      ...taskData,
      assignedTo: String(taskData.assignedTo),
      assignedToName: selectedUser.username,
      updatedBy: currentUser?.id || 'system'
    };
    
    console.log('Final data to TaskService:', finalData);
    console.log('============================');
    
    const result = TaskService.updateTask(selectedTask.id, finalData);

    if (result.success) {
      console.log('✅ Task updated successfully!');
      
      // Close form
      setShowTaskForm(false);
      setSelectedTask(null);
      
      // Wait for storage event
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reload tasks
      console.log('🔄 Reloading tasks from storage...');
      loadTasks();
      
      alert('✅ Task updated successfully!');
    } else {
      console.error('❌ Failed to update task:', result.message);
      alert(`❌ Error: ${result.message}`);
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const result = TaskService.deleteTask(taskId, currentUser?.id || 'system');
      
      if (result.success) {
        loadTasks();
        alert('Task deleted successfully!');
      } else {
        alert(`Error: ${result.message}`);
      }
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    const result = TaskService.updateTaskStatus(taskId, newStatus, currentUser?.id|| 'system');
    
    if (result.success) {
      loadTasks();
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const handleBulkStatusChange = (status) => {
    if (selectedTasks.length === 0) {
      alert('Please select tasks first');
      return;
    }

    const result = TaskService.bulkUpdateStatus(selectedTasks, status, currentUser?.id || 'system');
    
    if (result.success) {
      loadTasks();
      setSelectedTasks([]);
      alert(result.message);
    }
  };

  const handleBulkDelete = () => {
    if (selectedTasks.length === 0) {
      alert('Please select tasks first');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) {
      const result = TaskService.bulkDelete(selectedTasks);
      
      if (result.success) {
        loadTasks();
        setSelectedTasks([]);
        alert(result.message);
      }
    }
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(t => t.id));
    }
  };

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800 border-gray-300',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Circle size={16} />,
      'in-progress': <Clock size={16} />,
      completed: <CheckCircle size={16} />,
      cancelled: <AlertTriangle size={16} />
    };
    return icons[status] || icons.pending;
  };

  const isOverdue = (task) => {
    return task.dueDate && 
           new Date(task.dueDate) < new Date() && 
           task.status !== TASK_STATUS.COMPLETED &&
           task.status !== TASK_STATUS.CANCELLED;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const statistics = TaskService.getStatistics();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Task Management</h1>
              <p className="text-gray-600 mt-1">{filteredTasks.length} tasks found</p>
            </div>
            <button
              onClick={() => {
                setSelectedTask(null);
                setShowTaskForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Plus size={20} />
              Create Task
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-800">{statistics.total}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-800">{statistics.byStatus.pending}</div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-800">{statistics.byStatus.inProgress}</div>
              <div className="text-sm text-blue-700">In Progress</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-800">{statistics.byStatus.completed}</div>
              <div className="text-sm text-green-700">Completed</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-800">{statistics.overdue}</div>
              <div className="text-sm text-red-700">Overdue</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-800">{statistics.completionRate}%</div>
              <div className="text-sm text-purple-700">Completion</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks by title, description, category, assignee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter size={20} />
              Filters
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.categoryId}
                  onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                <select
                  value={filters.assignedTo}
                  onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.username}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedTasks.length} task(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkStatusChange(TASK_STATUS.IN_PROGRESS)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleBulkStatusChange(TASK_STATUS.COMPLETED)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Mark Completed
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Circle size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No tasks found</h3>
              <p className="text-gray-500">
                {searchTerm || filters.status !== 'all' || filters.priority !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first task to get started'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('title')}
                    >
                      Task {sortConfig.field === 'title' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Assigned To</th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('priority')}
                    >
                      Priority {sortConfig.field === 'priority' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('dueDate')}
                    >
                      Due Date {sortConfig.field === 'dueDate' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTasks.map((task) => (
                    <tr 
                      key={task.id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        isOverdue(task) ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => toggleTaskSelection(task.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{task.title}</span>
                          {task.description && (
                            <span className="text-sm text-gray-500 truncate max-w-md">
                              {task.description.substring(0, 60)}
                              {task.description.length > 60 ? '...' : ''}
                            </span>
                          )}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {task.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                  <Tag size={10} />
                                  {tag}
                                </span>
                              ))}
                              {task.tags.length > 3 && (
                                <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{task.categoryPath || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {task.assignedToName || 
                             users.find(u => String(u.id) === String(task.assignedTo))?.username || 
                             'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)} cursor-pointer`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className={isOverdue(task) ? 'text-red-500' : 'text-gray-400'} />
                          <span className={`text-sm ${isOverdue(task) ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                            {formatDate(task.dueDate)}
                            {isOverdue(task) && <span className="ml-1">(Overdue)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowTaskForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Task"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={selectedTask}
          categories={categories}
          users={users}
        //   onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
          onSubmit={handleCreateTask}
          onCancel={() => {
            setShowTaskForm(false);
            setSelectedTask(null);
          }}
          isEdit={!!selectedTask}
        />
      )}
    </div>
  );
};

export default TaskList;