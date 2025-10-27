// // Storage Service - Handles localStorage operations
// export const StorageService = {
//   STORAGE_KEY: 'categoryData',
//   CHUNK_KEY: 'categoryData_chunk_',
//   CHUNKS_KEY: 'categoryData_chunks',
//   MAX_CHUNK_SIZE: 1000000, // 1MB chunks

//   save: (data) => {
//     try {
//       const storage = { 
//         categories: data.categories, 
//         deletedLogs: data.deletedLogs 
//       };
//       const jsonData = JSON.stringify(storage);

//       // Handle large data by chunking
//       if (jsonData.length > StorageService.MAX_CHUNK_SIZE) {
//         const chunks = [];
//         for (let i = 0; i < jsonData.length; i += StorageService.MAX_CHUNK_SIZE) {
//           chunks.push(jsonData.slice(i, i + StorageService.MAX_CHUNK_SIZE));
//         }

//         // Clear old chunks
//         Object.keys(localStorage).forEach(key => {
//           if (key.startsWith(StorageService.CHUNK_KEY)) {
//             localStorage.removeItem(key);
//           }
//         });

//         // Save new chunks
//         chunks.forEach((chunk, index) => {
//           localStorage.setItem(`${StorageService.CHUNK_KEY}${index}`, chunk);
//         });
//         localStorage.setItem(StorageService.CHUNKS_KEY, chunks.length.toString());
//       } else {
//         localStorage.setItem(StorageService.STORAGE_KEY, jsonData);
//         localStorage.removeItem(StorageService.CHUNKS_KEY);
//       }
//       return true;
//     } catch (error) {
//       console.error('Storage save failed:', error);
//       return false;
//     }
//   },

//   load: () => {
//     try {
//       const chunks = localStorage.getItem(StorageService.CHUNKS_KEY);
//       let jsonData;

//       if (chunks) {
//         const chunkCount = parseInt(chunks);
//         let fullData = '';
//         for (let i = 0; i < chunkCount; i++) {
//           fullData += localStorage.getItem(`${StorageService.CHUNK_KEY}${i}`) || '';
//         }
//         jsonData = fullData;
//       } else {
//         jsonData = localStorage.getItem(StorageService.STORAGE_KEY);
//       }

//       if (jsonData) {
//         const parsed = JSON.parse(jsonData);
//         return { 
//           categories: parsed.categories || [], 
//           deletedLogs: parsed.deletedLogs || [] 
//         };
//       }
//     } catch (error) {
//       console.error('Storage load failed:', error);
//     }
//     return { categories: [], deletedLogs: [] };
//   },

//   clear: () => {
//     try {
//       localStorage.removeItem(StorageService.STORAGE_KEY);
//       localStorage.removeItem(StorageService.CHUNKS_KEY);
//       Object.keys(localStorage).forEach(key => {
//         if (key.startsWith(StorageService.CHUNK_KEY)) {
//           localStorage.removeItem(key);
//         }
//       });
//       return true;
//     } catch (error) {
//       console.error('Storage clear failed:', error);
//       return false;
//     }
//   }
// };
// services/StorageService.js - Enhanced Storage Service for Categories and Tasks

/**
 * StorageService - Handles localStorage operations
 * Now supports both categories and tasks with chunking for large data
 */
export const StorageService = {
  // Storage keys
  STORAGE_KEY: 'categoryData',
  TASKS_KEY: 'taskManagement_tasks',
  CHUNK_KEY: 'categoryData_chunk_',
  TASKS_CHUNK_KEY: 'taskData_chunk_',
  CHUNKS_KEY: 'categoryData_chunks',
  TASKS_CHUNKS_KEY: 'taskData_chunks',
  MAX_CHUNK_SIZE: 1000000, // 1MB chunks

  /**
   * Save category data (original functionality)
   */
  save: (data) => {
    try {
      const storage = { 
        categories: data.categories, 
        deletedLogs: data.deletedLogs 
      };
      const jsonData = JSON.stringify(storage);

      // Handle large data by chunking
      if (jsonData.length > StorageService.MAX_CHUNK_SIZE) {
        const chunks = [];
        for (let i = 0; i < jsonData.length; i += StorageService.MAX_CHUNK_SIZE) {
          chunks.push(jsonData.slice(i, i + StorageService.MAX_CHUNK_SIZE));
        }

        // Clear old chunks
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(StorageService.CHUNK_KEY)) {
            localStorage.removeItem(key);
          }
        });

        // Save new chunks
        chunks.forEach((chunk, index) => {
          localStorage.setItem(`${StorageService.CHUNK_KEY}${index}`, chunk);
        });
        localStorage.setItem(StorageService.CHUNKS_KEY, chunks.length.toString());
      } else {
        localStorage.setItem(StorageService.STORAGE_KEY, jsonData);
        localStorage.removeItem(StorageService.CHUNKS_KEY);
      }
      return true;
    } catch (error) {
      console.error('Storage save failed:', error);
      return false;
    }
  },

  /**
   * Load category data (original functionality)
   */
  load: () => {
    try {
      const chunks = localStorage.getItem(StorageService.CHUNKS_KEY);
      let jsonData;

      if (chunks) {
        const chunkCount = parseInt(chunks);
        let fullData = '';
        for (let i = 0; i < chunkCount; i++) {
          fullData += localStorage.getItem(`${StorageService.CHUNK_KEY}${i}`) || '';
        }
        jsonData = fullData;
      } else {
        jsonData = localStorage.getItem(StorageService.STORAGE_KEY);
      }

      if (jsonData) {
        const parsed = JSON.parse(jsonData);
        return { 
          categories: parsed.categories || [], 
          deletedLogs: parsed.deletedLogs || [] 
        };
      }
    } catch (error) {
      console.error('Storage load failed:', error);
    }
    return { categories: [], deletedLogs: [] };
  },

  /**
   * Save task data (new functionality for tasks)
   */
  saveTasks: (data) => {
    try {
      const storage = { 
        tasks: data.tasks || []
      };
      const jsonData = JSON.stringify(storage);

      // Handle large data by chunking
      if (jsonData.length > StorageService.MAX_CHUNK_SIZE) {
        const chunks = [];
        for (let i = 0; i < jsonData.length; i += StorageService.MAX_CHUNK_SIZE) {
          chunks.push(jsonData.slice(i, i + StorageService.MAX_CHUNK_SIZE));
        }

        // Clear old task chunks
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(StorageService.TASKS_CHUNK_KEY)) {
            localStorage.removeItem(key);
          }
        });

        // Save new task chunks
        chunks.forEach((chunk, index) => {
          localStorage.setItem(`${StorageService.TASKS_CHUNK_KEY}${index}`, chunk);
        });
        localStorage.setItem(StorageService.TASKS_CHUNKS_KEY, chunks.length.toString());
      } else {
        localStorage.setItem(StorageService.TASKS_KEY, jsonData);
        localStorage.removeItem(StorageService.TASKS_CHUNKS_KEY);
      }
      return { success: true };
    } catch (error) {
      console.error('Task storage save failed:', error);
      
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        return { 
          success: false, 
          error: 'Storage quota exceeded. Consider cleaning up old tasks.' 
        };
      }
      
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  /**
   * Load task data (new functionality for tasks)
   */
  loadTasks: () => {
    try {
      const chunks = localStorage.getItem(StorageService.TASKS_CHUNKS_KEY);
      let jsonData;

      if (chunks) {
        const chunkCount = parseInt(chunks);
        let fullData = '';
        for (let i = 0; i < chunkCount; i++) {
          fullData += localStorage.getItem(`${StorageService.TASKS_CHUNK_KEY}${i}`) || '';
        }
        jsonData = fullData;
      } else {
        jsonData = localStorage.getItem(StorageService.TASKS_KEY);
      }

      if (jsonData) {
        const parsed = JSON.parse(jsonData);
        return { 
          tasks: parsed.tasks || []
        };
      }
    } catch (error) {
      console.error('Task storage load failed:', error);
    }
    return { tasks: [] };
  },

  /**
   * Clear category data only
   */
  clear: () => {
    try {
      localStorage.removeItem(StorageService.STORAGE_KEY);
      localStorage.removeItem(StorageService.CHUNKS_KEY);
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(StorageService.CHUNK_KEY)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Storage clear failed:', error);
      return false;
    }
  },

  /**
   * Clear task data only
   */
  clearTasks: () => {
    try {
      localStorage.removeItem(StorageService.TASKS_KEY);
      localStorage.removeItem(StorageService.TASKS_CHUNKS_KEY);
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(StorageService.TASKS_CHUNK_KEY)) {
          localStorage.removeItem(key);
        }
      });
      return { success: true };
    } catch (error) {
      console.error('Task storage clear failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Clear all data (categories and tasks)
   */
  clearAll: () => {
    try {
      StorageService.clear();
      StorageService.clearTasks();
      return { success: true };
    } catch (error) {
      console.error('Clear all failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get storage usage information
   */
  getStorageInfo: () => {
    try {
      let totalSize = 0;
      let categorySize = 0;
      let taskSize = 0;

      // Calculate category data size
      const categoryChunks = localStorage.getItem(StorageService.CHUNKS_KEY);
      if (categoryChunks) {
        const chunkCount = parseInt(categoryChunks);
        for (let i = 0; i < chunkCount; i++) {
          const chunk = localStorage.getItem(`${StorageService.CHUNK_KEY}${i}`);
          if (chunk) categorySize += new Blob([chunk]).size;
        }
      } else {
        const data = localStorage.getItem(StorageService.STORAGE_KEY);
        if (data) categorySize = new Blob([data]).size;
      }

      // Calculate task data size
      const taskChunks = localStorage.getItem(StorageService.TASKS_CHUNKS_KEY);
      if (taskChunks) {
        const chunkCount = parseInt(taskChunks);
        for (let i = 0; i < chunkCount; i++) {
          const chunk = localStorage.getItem(`${StorageService.TASKS_CHUNK_KEY}${i}`);
          if (chunk) taskSize += new Blob([chunk]).size;
        }
      } else {
        const data = localStorage.getItem(StorageService.TASKS_KEY);
        if (data) taskSize = new Blob([data]).size;
      }

      totalSize = categorySize + taskSize;

      // Get counts
      const categoryData = StorageService.load();
      const taskData = StorageService.loadTasks();

      return {
        totalSizeInBytes: totalSize,
        totalSizeInKB: (totalSize / 1024).toFixed(2),
        totalSizeInMB: (totalSize / (1024 * 1024)).toFixed(2),
        categorySizeInKB: (categorySize / 1024).toFixed(2),
        taskSizeInKB: (taskSize / 1024).toFixed(2),
        categoryCount: categoryData.categories?.length || 0,
        taskCount: taskData.tasks?.length || 0,
        deletedLogCount: categoryData.deletedLogs?.length || 0
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        totalSizeInBytes: 0,
        totalSizeInKB: '0',
        totalSizeInMB: '0',
        categorySizeInKB: '0',
        taskSizeInKB: '0',
        categoryCount: 0,
        taskCount: 0,
        deletedLogCount: 0
      };
    }
  },

  /**
   * Check if localStorage is available
   */
  isAvailable: () => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('localStorage is not available:', error);
      return false;
    }
  },

  /**
   * Export all data as JSON
   */
  exportAll: () => {
    try {
      const categoryData = StorageService.load();
      const taskData = StorageService.loadTasks();
      
      return {
        categories: categoryData.categories,
        deletedLogs: categoryData.deletedLogs,
        tasks: taskData.tasks,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  },

  /**
   * Import all data from backup
   */
  importAll: (data) => {
    try {
      // Validate data structure
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Invalid data format' };
      }

      // Import categories if present
      if (data.categories || data.deletedLogs) {
        StorageService.save({
          categories: data.categories || [],
          deletedLogs: data.deletedLogs || []
        });
      }

      // Import tasks if present
      if (data.tasks) {
        StorageService.saveTasks({
          tasks: data.tasks
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, error: error.message };
    }
  }
};

export default StorageService;


