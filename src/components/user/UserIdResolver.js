// UserIdResolver.js
// Universal user ID resolver - handles all ID formats automatically

export const UserIdResolver = {
  /**
   * Get the canonical user ID from a user object
   * Handles both id and user_id formats
   * @param {Object} user - User object
   * @returns {string|number} - The canonical user ID
   */
  getUserId: (user) => {
    if (!user) return null;
    
    // Priority order: id > user_id
    return user.id || user.user_id || null;
  },

  /**
   * Get all possible ID representations for a user
   * @param {Object} user - User object
   * @returns {Array} - Array of all possible IDs
   */
  getAllUserIds: (user) => {
    if (!user) return [];
    
    const ids = [];
    if (user.id) ids.push(user.id);
    if (user.user_id && user.user_id !== user.id) ids.push(user.user_id);
    
    return ids;
  },

  /**
   * Check if a task is assigned to a user (handles all ID formats)
   * @param {Object} task - Task object
   * @param {Object} user - User object
   * @returns {boolean}
   */
  isTaskAssignedToUser: (task, user) => {
    if (!task || !user) return false;
    
    const taskAssignedTo = String(task.assignedTo);
    const userIds = UserIdResolver.getAllUserIds(user).map(id => String(id));
    
    return userIds.includes(taskAssignedTo);
  },

  /**
   * Find user by any ID format
   * @param {Array} users - Array of user objects
   * @param {string|number} searchId - ID to search for
   * @returns {Object|null} - Found user or null
   */
  findUserById: (users, searchId) => {
    if (!searchId || !users) return null;
    
    const searchIdStr = String(searchId);
    
    return users.find(user => {
      const userIds = UserIdResolver.getAllUserIds(user).map(id => String(id));
      return userIds.includes(searchIdStr);
    });
  },

  /**
   * Get users list formatted for dropdown (with all ID formats)
   * @param {Array} users - Array of user objects
   * @returns {Array} - Array of {id, name, label} objects
   */
  getUsersForDropdown: (users) => {
    if (!users) return [];
    
    return users.map(user => {
      const canonicalId = UserIdResolver.getUserId(user);
      return {
        id: canonicalId, // Use canonical ID for dropdown value
        user_id: user.user_id, // Keep for reference
        name: user.name || user.username,
        username: user.username,
        email: user.email,
        label: `${user.name || user.username} (${user.email || user.username})`
      };
    });
  },

  /**
   * Normalize task data for saving (ensures consistent ID format)
   * @param {Object} taskData - Task data to normalize
   * @param {Object} currentUser - Current user object
   * @returns {Object} - Normalized task data
   */
  normalizeTaskData: (taskData, currentUser) => {
    const normalized = { ...taskData };
    
    // If assignedTo is provided, ensure it's the canonical ID
    if (normalized.assignedTo) {
      // Keep as-is, no conversion needed
      normalized.assignedTo = normalized.assignedTo;
    }
    
    // Ensure createdBy/updatedBy use canonical ID
    if (currentUser) {
      const userId = UserIdResolver.getUserId(currentUser);
      if (!normalized.createdBy) normalized.createdBy = userId;
      if (!normalized.updatedBy) normalized.updatedBy = userId;
    }
    
    return normalized;
  },

  /**
   * Get user info from ID (search in all users)
   * @param {string|number} userId - User ID to search
   * @param {Array} allUsers - All users array
   * @returns {Object|null} - User info or null
   */
  getUserInfoById: (userId, allUsers) => {
    if (!userId || !allUsers) return null;
    
    const user = UserIdResolver.findUserById(allUsers, userId);
    if (!user) return null;
    
    return {
      id: UserIdResolver.getUserId(user),
      name: user.name || user.username,
      username: user.username,
      email: user.email
    };
  },

  /**
   * Debug: Print user ID information
   * @param {Object} user - User object
   */
  debugUserIds: (user) => {
    if (!user) {
      console.log('No user provided');
      return;
    }
    
    console.log('🔍 User ID Debug:', {
      username: user.username,
      id: user.id,
      user_id: user.user_id,
      canonical: UserIdResolver.getUserId(user),
      allIds: UserIdResolver.getAllUserIds(user)
    });
  },

  /**
   * Sync current user session (ensure consistent ID)
   * Updates localStorage with canonical ID
   */
  syncCurrentUserSession: () => {
    try {
      const USER_STORAGE_KEY = 'taskManagement_user';
      const currentUser = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || 'null');
      
      if (!currentUser) return;
      
      const canonicalId = UserIdResolver.getUserId(currentUser);
      
      // Update session to use canonical ID as 'id'
      const updatedUser = {
        ...currentUser,
        id: canonicalId
      };
      
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      
      console.log('User session synced:', {
        username: updatedUser.username,
        id: updatedUser.id
      });
      
      return updatedUser;
    } catch (error) {
      console.error('Error syncing user session:', error);
      return null;
    }
  }
};

export default UserIdResolver;