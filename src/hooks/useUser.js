// hooks/useUser.js - Updated User Management Hook with CategoryService Integration

import { useState, useCallback, useMemo, useEffect } from 'react';
import UserService from '../services/userService';
import CategoryService from '../services/categoryService';

export const useUser = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [positions, setPositions] = useState([]);
  const [userFields, setUserFields] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data from UserService and CategoryService
  useEffect(() => {
    const loadData = () => {
      try {
        setUsers(UserService.getAllUsers());
        setRoles(UserService.getAllRoles());
        setPositions(UserService.getAllPositions());
        setUserFields(UserService.getAllUserFields());
        
        // Load categories from CategoryService (formatted for user form)
        setCategories(CategoryService.getCategoriesForUserForm());
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading data:', err);
      }
    };

    loadData();
  }, []);

  // Create user
  const createUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newUser = UserService.createUser(userData);
      setUsers(UserService.getAllUsers()); // Refresh users list
      
      return { success: true, data: newUser };
    } catch (err) {
      const errorMessage = err.message || 'Failed to create user';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user
  const updateUser = useCallback(async (userId, userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = UserService.updateUser(userId, userData);
      setUsers(UserService.getAllUsers()); // Refresh users list
      
      return { success: true, data: updatedUser };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update user';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete user
  const deleteUser = useCallback(async (userId, deletedBy) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      UserService.deleteUser(userId, deletedBy);
      setUsers(UserService.getAllUsers()); // Refresh users list
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete user';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Search users
  const searchUsers = useCallback((searchTerm, filters = {}) => {
    return UserService.searchUsers(searchTerm, filters);
  }, []);

  // Get statistics
  const getStatistics = useCallback(() => {
    return UserService.getStatistics();
  }, []);

  // Role management
  const addRole = useCallback(async (roleData) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newRole = UserService.addRole(roleData);
      setRoles(UserService.getAllRoles()); // Refresh roles list
      
      return { success: true, data: newRole };
    } catch (err) {
      const errorMessage = err.message || 'Failed to add role';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRole = useCallback(async (roleId, roleData) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedRole = UserService.updateRole(roleId, roleData);
      setRoles(UserService.getAllRoles()); // Refresh roles list
      
      return { success: true, data: updatedRole };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update role';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRole = useCallback(async (roleId) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      UserService.deleteRole(roleId);
      setRoles(UserService.getAllRoles()); // Refresh roles list
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete role';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Position management
  const addPosition = useCallback(async (positionData) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newPosition = UserService.addPosition(positionData);
      setPositions(UserService.getAllPositions()); // Refresh positions list
      
      return { success: true, data: newPosition };
    } catch (err) {
      const errorMessage = err.message || 'Failed to add position';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePosition = useCallback(async (positionId, positionData) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedPosition = UserService.updatePosition(positionId, positionData);
      setPositions(UserService.getAllPositions()); // Refresh positions list
      
      return { success: true, data: updatedPosition };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update position';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePosition = useCallback(async (positionId) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      UserService.deletePosition(positionId);
      setPositions(UserService.getAllPositions()); // Refresh positions list
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete position';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // User field management
  const addUserField = useCallback(async (fieldData) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newField = UserService.addUserField(fieldData);
      setUserFields(UserService.getAllUserFields()); // Refresh fields list
      
      return { success: true, data: newField };
    } catch (err) {
      const errorMessage = err.message || 'Failed to add field';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserField = useCallback(async (fieldId, fieldData) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedField = UserService.updateUserField(fieldId, fieldData);
      setUserFields(UserService.getAllUserFields()); // Refresh fields list
      
      return { success: true, data: updatedField };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update field';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUserField = useCallback(async (fieldId) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      UserService.deleteUserField(fieldId);
      setUserFields(UserService.getAllUserFields()); // Refresh fields list
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete field';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh categories (useful when categories are updated in another part of the app)
  const refreshCategories = useCallback(() => {
    setCategories(CategoryService.getCategoriesForUserForm());
  }, []);

  // Get category names by IDs (helper for displaying assigned categories)
  const getCategoryNamesByIds = useCallback((categoryIds) => {
    if (!Array.isArray(categoryIds)) return [];
    
    return categoryIds
      .map(id => {
        const category = categories.find(cat => cat.id === id);
        return category ? category.fullPath : null;
      })
      .filter(Boolean);
  }, [categories]);

  return {
    users,
    roles,
    positions,
    userFields,
    categories, // Now returns real categories from CategoryService
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    getStatistics,
    addRole,
    updateRole,
    deleteRole,
    addPosition,
    updatePosition,
    deletePosition,
    addUserField,
    updateUserField,
    deleteUserField,
    refreshCategories, // Call this after creating/updating categories
    getCategoryNamesByIds // Helper to display category names
  };
};