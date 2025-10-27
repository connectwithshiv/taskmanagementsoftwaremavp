import { StorageService } from "./storageService";
import { UserIdResolver } from "../components/user/UserIdResolver";

// Task statuses
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Task priorities
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Initialize tasks from localStorage
let tasks = [];

const loadTasks = () => {
  try {
    const data = StorageService.loadTasks();
    tasks = data.tasks || [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    tasks = [];
  }
};

const saveTasks = () => {
  try {
    StorageService.saveTasks({ tasks });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tasksUpdated'));
      console.log(' Tasks saved and event fired');
    }
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};

loadTasks();

const TaskService = {
  // Get all tasks
  getAllTasks: () => {
    loadTasks();
    return tasks;
  },

  // Get task by ID
  getTaskById: (taskId) => {
    return tasks.find(task => task.id === taskId);
  },

  // Create new task
  createTask: (taskData) => {
    try {
      const now = new Date().toISOString();
      
      if (!taskData.assignedToName && taskData.assignedTo) {
        console.warn('assignedToName missing for task creation. assignedTo:', taskData.assignedTo);
      }
      
      const newTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: taskData.title,
        description: taskData.description || '',
        categoryId: taskData.categoryId,
        categoryPath: taskData.categoryPath || '',
        assignedTo: taskData.assignedTo, // Keep whatever ID format is provided
        assignedToName: taskData.assignedToName || '',
        priority: taskData.priority || TASK_PRIORITY.MEDIUM,
        status: taskData.status || TASK_STATUS.PENDING,
        dueDate: taskData.dueDate || null,
        startDate: taskData.startDate || null,
        completedDate: null,
        estimatedHours: taskData.estimatedHours || null,
        actualHours: taskData.actualHours || null,
        tags: taskData.tags || [],
        attachments: taskData.attachments || [],
        comments: taskData.comments || [],
        createdAt: now,
        updatedAt: now,
        createdBy: taskData.createdBy || 'system',
        updatedBy: taskData.createdBy || 'system',
        logs: [{
          action: 'created',
          timestamp: now,
          performedBy: taskData.createdBy || 'system',
          details: 'Task created'
        }]
      };

      tasks.push(newTask);
      saveTasks();
      
      console.log(' Task created:', {
        title: newTask.title,
        assignedTo: newTask.assignedTo,
        assignedToName: newTask.assignedToName
      });
      
      return { 
        success: true, 
        task: newTask,
        message: 'Task created successfully' 
      };
    } catch (error) {
      console.error('Error creating task:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  // Update task
  updateTask: (taskId, updateData) => {
    try {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        return { 
          success: false, 
          message: 'Task not found' 
        };
      }

      const now = new Date().toISOString();
      const oldTask = tasks[taskIndex];
      
      const finalUpdateData = { ...updateData };
      if (finalUpdateData.assignedTo && !finalUpdateData.assignedToName) {
        finalUpdateData.assignedToName = oldTask.assignedToName || '';
      }
      
      const updatedTask = {
        ...oldTask,
        ...finalUpdateData,
        id: taskId,
        updatedAt: now,
        updatedBy: updateData.updatedBy || 'system',
        logs: [
          ...(oldTask.logs || []),
          {
            action: 'updated',
            timestamp: now,
            performedBy: updateData.updatedBy || 'system',
            details: 'Task information updated'
          }
        ]
      };

      tasks[taskIndex] = updatedTask;
      saveTasks();
      
      return { 
        success: true, 
        task: updatedTask,
        message: 'Task updated successfully' 
      };
    } catch (error) {
      console.error('Error updating task:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  // Delete task
  deleteTask: (taskId, deletedBy = 'system') => {
    try {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        return { 
          success: false, 
          message: 'Task not found' 
        };
      }

      tasks.splice(taskIndex, 1);
      saveTasks();
      
      return { 
        success: true, 
        message: 'Task deleted successfully' 
      };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  // Update task status
  updateTaskStatus: (taskId, status, updatedBy = 'system') => {
    try {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        return { 
          success: false, 
          message: 'Task not found' 
        };
      }

      const now = new Date().toISOString();
      const task = tasks[taskIndex];
      const oldStatus = task.status;
      
      tasks[taskIndex] = {
        ...task,
        status: status,
        updatedAt: now,
        updatedBy: updatedBy,
        startDate: status === TASK_STATUS.IN_PROGRESS && !task.startDate ? now : task.startDate,
        completedDate: status === TASK_STATUS.COMPLETED ? now : task.completedDate,
        logs: [
          ...(task.logs || []),
          {
            action: 'status_changed',
            timestamp: now,
            performedBy: updatedBy,
            details: `Status changed from ${oldStatus} to ${status}`
          }
        ]
      };

      saveTasks();
      
      return { 
        success: true, 
        task: tasks[taskIndex],
        message: 'Task status updated successfully' 
      };
    } catch (error) {
      console.error('Error updating task status:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  //  Search and filter tasks (with ID resolver)
  searchTasks: (searchTerm = '', filters = {}) => {
    let filteredTasks = [...tasks];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term) ||
        task.categoryPath.toLowerCase().includes(term) ||
        task.assignedToName.toLowerCase().includes(term) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    if (filters.status && filters.status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    if (filters.categoryId && filters.categoryId !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.categoryId === filters.categoryId);
    }

    //  Filter by user with ID resolver
    if (filters.assignedTo && filters.assignedTo !== 'all') {
      const searchId = String(filters.assignedTo);
      filteredTasks = filteredTasks.filter(task => String(task.assignedTo) === searchId);
    }

    if (filters.dueDateFrom) {
      filteredTasks = filteredTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) >= new Date(filters.dueDateFrom)
      );
    }

    if (filters.dueDateTo) {
      filteredTasks = filteredTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) <= new Date(filters.dueDateTo)
      );
    }

    return filteredTasks;
  },

  // Sort tasks
  sortTasks: (tasksToSort, sortBy, sortOrder = 'asc') => {
    return [...tasksToSort].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'dueDate':
          comparison = new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
          break;
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'createdAt':
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
          break;
        case 'updatedAt':
          comparison = new Date(b.updatedAt) - new Date(a.updatedAt);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  },

  // Get task statistics
  getStatistics: () => {
    const stats = {
      total: tasks.length,
      byStatus: {
        pending: tasks.filter(t => t.status === TASK_STATUS.PENDING).length,
        inProgress: tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length,
        completed: tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length,
        cancelled: tasks.filter(t => t.status === TASK_STATUS.CANCELLED).length
      },
      byPriority: {
        urgent: tasks.filter(t => t.priority === TASK_PRIORITY.URGENT).length,
        high: tasks.filter(t => t.priority === TASK_PRIORITY.HIGH).length,
        medium: tasks.filter(t => t.priority === TASK_PRIORITY.MEDIUM).length,
        low: tasks.filter(t => t.priority === TASK_PRIORITY.LOW).length
      },
      overdue: tasks.filter(t => 
        t.dueDate && 
        new Date(t.dueDate) < new Date() && 
        t.status !== TASK_STATUS.COMPLETED
      ).length,
      dueToday: tasks.filter(t => {
        if (!t.dueDate) return false;
        const today = new Date().toDateString();
        return new Date(t.dueDate).toDateString() === today;
      }).length,
      completionRate: tasks.length > 0 
        ? ((tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length / tasks.length) * 100).toFixed(1)
        : 0
    };

    return stats;
  },

  //  Get tasks by user (with ID resolver)
  getTasksByUser: (user) => {
    if (!user) return [];
    
    return tasks.filter(task => UserIdResolver.isTaskAssignedToUser(task, user));
  },

  // Get tasks by category
  getTasksByCategory: (categoryId) => {
    return tasks.filter(task => task.categoryId === categoryId);
  },

  // Get overdue tasks
  getOverdueTasks: () => {
    const now = new Date();
    return tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      task.status !== TASK_STATUS.COMPLETED &&
      task.status !== TASK_STATUS.CANCELLED
    );
  },

  // Get upcoming tasks
  getUpcomingTasks: (days = 7) => {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && 
             dueDate <= future && 
             task.status !== TASK_STATUS.COMPLETED &&
             task.status !== TASK_STATUS.CANCELLED;
    });
  },

  // Add comment
  addComment: (taskId, comment, userId = 'system') => {
    try {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        return { success: false, message: 'Task not found' };
      }

      const now = new Date().toISOString();
      const newComment = {
        id: `comment_${Date.now()}`,
        text: comment,
        userId: userId,
        timestamp: now
      };

      tasks[taskIndex].comments = [...(tasks[taskIndex].comments || []), newComment];
      tasks[taskIndex].updatedAt = now;
      
      saveTasks();
      
      return { success: true, comment: newComment };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Add attachment
  addAttachment: (taskId, attachment) => {
    try {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        return { success: false, message: 'Task not found' };
      }

      const now = new Date().toISOString();
      const newAttachment = {
        id: `attachment_${Date.now()}`,
        ...attachment,
        uploadedAt: now
      };

      tasks[taskIndex].attachments = [...(tasks[taskIndex].attachments || []), newAttachment];
      tasks[taskIndex].updatedAt = now;
      
      saveTasks();
      
      return { success: true, attachment: newAttachment };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Bulk update status
  bulkUpdateStatus: (taskIds, status, updatedBy = 'system') => {
    try {
      const now = new Date().toISOString();
      let updatedCount = 0;

      taskIds.forEach(taskId => {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          tasks[taskIndex].status = status;
          tasks[taskIndex].updatedAt = now;
          tasks[taskIndex].updatedBy = updatedBy;
          updatedCount++;
        }
      });

      saveTasks();
      
      return { 
        success: true, 
        message: `${updatedCount} tasks updated successfully` 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Bulk delete
  bulkDelete: (taskIds) => {
    try {
      tasks = tasks.filter(t => !taskIds.includes(t.id));
      saveTasks();
      
      return { 
        success: true, 
        message: `${taskIds.length} tasks deleted successfully` 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Clear all tasks
  clearAllTasks: () => {
    tasks = [];
    saveTasks();
  },

  // Export tasks
  exportTasks: () => {
    return {
      tasks: tasks,
      exportedAt: new Date().toISOString()
    };
  },

  // Import tasks
  importTasks: (importedTasks) => {
    tasks = importedTasks;
    saveTasks();
  }
};

export default TaskService;