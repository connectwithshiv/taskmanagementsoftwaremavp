// Helper function to get users formatted for task assignment dropdown
// USE THIS in your task form instead of directly reading from localStorage
import { UserIdResolver } from "./UserIdResolver";
export const getUsersForTaskDropdown = () => {
  try {
    // Load all users from database
    const AUTH_USERS_KEY = 'taskManagement_users_db';
    const allUsers = JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '[]');
    
    // Filter to active users only
    const activeUsers = allUsers.filter(user => user.status === 'active');
    
    // Format for dropdown using ID resolver
    return activeUsers.map(user => {
      const canonicalId = UserIdResolver.getUserId(user);
      
      return {
        value: canonicalId, //This is what gets saved to task.assignedTo
        label: user.name || user.username,
        name: user.name,
        username: user.username,
        email: user.email,
        // For display in dropdown
        display: `${user.name || user.username}${user.email ? ` (${user.email})` : ''}`
      };
    });
  } catch (error) {
    console.error('Error loading users for dropdown:', error);
    return [];
  }
};

// Helper to get user name by ID (for displaying in task lists)
export const getUserNameById = (userId) => {
  try {
    if (!userId) return 'Unassigned';
    
    const AUTH_USERS_KEY = 'taskManagement_users_db';
    const allUsers = JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '[]');
    
    const user = UserIdResolver.findUserById(allUsers, userId);
    
    if (!user) {
      console.warn('User not found for ID:', userId);
      return `User ${userId}`;
    }
    
    return user.name || user.username;
  } catch (error) {
    console.error('Error getting user name:', error);
    return 'Unknown User';
  }
};

// Helper to validate if a user ID exists
export const validateUserId = (userId) => {
  try {
    if (!userId) return false;
    
    const AUTH_USERS_KEY = 'taskManagement_users_db';
    const allUsers = JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '[]');
    
    const user = UserIdResolver.findUserById(allUsers, userId);
    return !!user;
  } catch (error) {
    console.error('Error validating user ID:', error);
    return false;
  }
};

export default {
  getUsersForTaskDropdown,
  getUserNameById,
  validateUserId
};