import { USER_STATUS, USER_ACTIONS } from '../utils/constants';

const STORAGE_KEYS = {
  USERS: 'userData',
  ROLES: 'rolesData',
  POSITIONS: 'positionsData',
  USER_FIELDS: 'userFieldsData',
  USER_FIELD_VALUES: 'userFieldValuesData',
  DELETED_LOGS: 'userDeletedLogs',
  // Authentication keys
  AUTH_USERS: 'taskManagement_users_db',
  AUTH_STORAGE: 'taskManagement_auth',
  USER_STORAGE: 'taskManagement_user'
};

class UserService {
  constructor() {
    this.initializeStorage();
  }

  // Initialize storage with default data if empty
  initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROLES)) {
      const defaultRoles = [
        { role_id: 1, role_name: 'Admin' },
        { role_id: 2, role_name: 'Manager' },
        { role_id: 3, role_name: 'Supervisor' },
        { role_id: 4, role_name: 'Employee' },
        { role_id: 5, role_name: 'Auditor' }
      ];
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(defaultRoles));
    }
    if (!localStorage.getItem(STORAGE_KEYS.POSITIONS)) {
      const defaultPositions = [
        { position_id: 1, position_name: 'Chief Executive Officer' },
        { position_id: 2, position_name: 'Department Head' },
        { position_id: 3, position_name: 'Team Lead' },
        { position_id: 4, position_name: 'Senior Staff' },
        { position_id: 5, position_name: 'Junior Staff' },
        { position_id: 6, position_name: 'Intern' }
      ];
      localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(defaultPositions));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_FIELDS)) {
      localStorage.setItem(STORAGE_KEYS.USER_FIELDS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_FIELD_VALUES)) {
      localStorage.setItem(STORAGE_KEYS.USER_FIELD_VALUES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DELETED_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.DELETED_LOGS, JSON.stringify([]));
    }
    
    // Initialize auth users with default admin
    if (!localStorage.getItem(STORAGE_KEYS.AUTH_USERS)) {
      const defaultAuthUsers = [
        {
          id: 'user_admin_001',
          username: 'admin',
          password: 'admin123',
          name: 'System Administrator',
          email: 'admin@system.com',
          role_id: 1,
          role_name: 'Admin',
          position_id: 1,
          position_name: 'Chief Executive Officer',
          status: 'active',
          assigned_category_ids: ['all'],
          permissions: ['all'],
          created_at: new Date().toISOString(),
          created_by: 'system'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(defaultAuthUsers));
    }
  }

  // ✅ FIXED: Generate unique ID in auth-format
  generateId() {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 9);
    return `user_${timestamp}_${randomStr}`;
  }

  // =========================
  // AUTHENTICATION INTEGRATION
  // =========================

  // ✅ FIXED: Sync user to auth system
  syncUserToAuthSystem(user) {
    try {
      const authUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH_USERS) || '[]');
      
      // Find existing auth user
      const existingIndex = authUsers.findIndex(u => u.email === user.email);
      
      const role = this.getRoleById(user.role_id);
      const position = this.getPositionById(user.position_id);
      
      // ✅ Use the SAME user_id (already in auth-format)
      const authUser = {
        id: user.user_id, // ✅ Use user_id directly
        username: user.username,
        password: user.password, // In production, this should be hashed!
        name: user.username,
        email: user.email,
        role_id: user.role_id,
        role_name: role?.role_name || 'Employee',
        position_id: user.position_id,
        position_name: position?.position_name || 'Staff',
        status: user.status,
        assigned_category_ids: user.assigned_category_ids || [],
        permissions: this.getRolePermissions(user.role_id),
        custom_fields: user.custom_fields || {},
        created_at: user.created_at,
        created_by: user.created_by,
        updated_at: user.updated_at,
        updated_by: user.updated_by
      };

      if (existingIndex !== -1) {
        // Update existing
        authUsers[existingIndex] = authUser;
      } else {
        // Add new
        authUsers.push(authUser);
      }

      localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(authUsers));
      
      // ✅ Return the same ID
      return authUser.id;
    } catch (error) {
      console.error('Error syncing user to auth system:', error);
      return null;
    }
  }

  // Remove user from auth system
  removeUserFromAuthSystem(email) {
    try {
      const authUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH_USERS) || '[]');
      const filteredUsers = authUsers.filter(u => u.email !== email);
      localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(filteredUsers));
    } catch (error) {
      console.error('Error removing user from auth system:', error);
    }
  }

  // Get role permissions
  getRolePermissions(roleId) {
    const rolePermissions = {
      1: ['all'], // Admin
      2: ['view', 'edit', 'create', 'assign'], // Manager
      3: ['view', 'edit', 'create'], // Supervisor
      4: ['view', 'edit'], // Employee
      5: ['view'] // Auditor
    };
    return rolePermissions[roleId] || ['view'];
  }

  // =========================
  // USER OPERATIONS
  // =========================

  // Get all users
  getAllUsers() {
    try {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Get user by ID
  getUserById(userId) {
    const users = this.getAllUsers();
    return users.find(user => user.user_id === userId);
  }

  // Get user by email (for login)
  getUserByEmail(email) {
    const users = this.getAllUsers();
    return users.find(user => user.email === email);
  }

  // ✅ FIXED: Create new user
  createUser(userData) {
    try {
      const users = this.getAllUsers();
      const now = new Date().toISOString();
      
      // Check for duplicate username
      if (users.some(u => u.username === userData.username)) {
        return { 
          success: false, 
          message: 'Username already exists' 
        };
      }

      // Check for duplicate email
      if (users.some(u => u.email === userData.email)) {
        return { 
          success: false, 
          message: 'Email already exists' 
        };
      }

      // ✅ Generate auth-format ID
      const userId = this.generateId();
      
      console.log('🆕 Creating user with ID:', userId);

      const newUser = {
        user_id: userId, // ✅ Auth-format ID: "user_1761487871136_abc123"
        ...userData,
        status: userData.status || USER_STATUS.ACTIVE,
        created_at: now,
        updated_at: now,
        logs: [{
          action: USER_ACTIONS.CREATE,
          timestamp: now,
          performed_by: userData.created_by || 'system',
          details: 'User created'
        }]
      };

      // ✅ Sync to auth system (will use same ID)
      const authId = this.syncUserToAuthSystem(newUser);
      
      console.log('✅ User synced to auth system:');
      console.log('   user_id:', newUser.user_id);
      console.log('   auth_id:', authId);
      console.log('   Match:', newUser.user_id === authId ? '✅ YES' : '❌ NO');

      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Save custom field values if provided
      if (userData.custom_fields) {
        Object.entries(userData.custom_fields).forEach(([fieldName, value]) => {
          this.setUserFieldValue(newUser.user_id, fieldName, value);
        });
      }

      return { 
        success: true, 
        user: newUser,
        message: 'User created successfully and can now login' 
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  }

  // Update user
  updateUser(userId, updateData) {
    try {
      const users = this.getAllUsers();
      const userIndex = users.findIndex(u => u.user_id === userId);

      if (userIndex === -1) {
        return { 
          success: false, 
          message: 'User not found' 
        };
      }

      const now = new Date().toISOString();
      const oldUser = users[userIndex];

      // Check for duplicate username if changed
      if (updateData.username && updateData.username !== oldUser.username) {
        if (users.some(u => u.username === updateData.username && u.user_id !== userId)) {
          return { 
            success: false, 
            message: 'Username already exists' 
          };
        }
      }

      // Check for duplicate email if changed
      if (updateData.email && updateData.email !== oldUser.email) {
        if (users.some(u => u.email === updateData.email && u.user_id !== userId)) {
          return { 
            success: false, 
            message: 'Email already exists' 
          };
        }
      }

      // Update user data
      const updatedUser = {
        ...oldUser,
        ...updateData,
        user_id: userId, // ✅ Ensure ID doesn't change
        updated_at: now,
        logs: [
          ...(oldUser.logs || []),
          {
            action: USER_ACTIONS.UPDATE,
            timestamp: now,
            performed_by: updateData.updated_by || 'system',
            details: 'User information updated'
          }
        ]
      };

      users[userIndex] = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // ✅ Sync to auth system (will use same ID)
      this.syncUserToAuthSystem(updatedUser);

      // Update custom field values if provided
      if (updateData.custom_fields) {
        Object.entries(updateData.custom_fields).forEach(([fieldName, value]) => {
          this.setUserFieldValue(userId, fieldName, value);
        });
      }

      return { 
        success: true, 
        user: updatedUser,
        message: 'User updated successfully' 
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  }

  // Delete user
  deleteUser(userId, deletedBy = 'system') {
    try {
      const users = this.getAllUsers();
      const userIndex = users.findIndex(u => u.user_id === userId);

      if (userIndex === -1) {
        return { 
          success: false, 
          message: 'User not found' 
        };
      }

      const deletedUser = users[userIndex];
      
      // Remove from auth system
      this.removeUserFromAuthSystem(deletedUser.email);

      // Log deletion
      const deletionLog = {
        deleted_user_id: userId,
        deleted_user_data: deletedUser,
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
        reason: 'User deleted by admin'
      };

      const deletedLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_LOGS) || '[]');
      deletedLogs.push(deletionLog);
      localStorage.setItem(STORAGE_KEYS.DELETED_LOGS, JSON.stringify(deletedLogs));

      // Remove user
      users.splice(userIndex, 1);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Remove custom field values
      this.deleteAllUserFieldValues(userId);

      return { 
        success: true, 
        message: 'User deleted successfully' 
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  }

  // Search users
  searchUsers(searchTerm = '', filters = {}) {
    let users = this.getAllUsers();

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      users = users.filter(user =>
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.custom_fields && JSON.stringify(user.custom_fields).toLowerCase().includes(term))
      );
    }

    // Apply filters
    if (filters.status) {
      users = users.filter(user => user.status === filters.status);
    }

    if (filters.role_id) {
      users = users.filter(user => user.role_id === parseInt(filters.role_id));
    }

    if (filters.position_id) {
      users = users.filter(user => user.position_id === parseInt(filters.position_id));
    }

    if (filters.assigned_category_ids && filters.assigned_category_ids.length > 0) {
      users = users.filter(user => {
        if (!user.assigned_category_ids) return false;
        return filters.assigned_category_ids.some(catId => 
          user.assigned_category_ids.includes(catId)
        );
      });
    }

    return users;
  }

  // Get user statistics
  getStatistics() {
    const users = this.getAllUsers();
    const roles = this.getAllRoles();

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === USER_STATUS.ACTIVE).length,
      inactiveUsers: users.filter(u => u.status === USER_STATUS.INACTIVE).length,
      usersByRole: roles.map(role => ({
        role_name: role.role_name,
        count: users.filter(u => u.role_id === role.role_id).length
      }))
    };
  }

  // =========================
  // ROLE OPERATIONS
  // =========================

  getAllRoles() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ROLES) || '[]');
    } catch (error) {
      console.error('Error getting roles:', error);
      return [];
    }
  }

  getRoleById(roleId) {
    const roles = this.getAllRoles();
    return roles.find(role => role.role_id === roleId);
  }

  addRole(roleData) {
    try {
      const roles = this.getAllRoles();
      const newRole = {
        role_id: parseInt(Date.now()),
        role_name: roleData.role_name
      };
      roles.push(newRole);
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
      return { success: true, role: newRole };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  updateRole(roleId, roleData) {
    try {
      const roles = this.getAllRoles();
      const roleIndex = roles.findIndex(r => r.role_id === roleId);
      if (roleIndex !== -1) {
        roles[roleIndex] = { ...roles[roleIndex], ...roleData };
        localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
        return { success: true, role: roles[roleIndex] };
      }
      return { success: false, message: 'Role not found' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  deleteRole(roleId) {
    try {
      const roles = this.getAllRoles();
      const users = this.getAllUsers();
      
      // Check if role is in use
      if (users.some(u => u.role_id === roleId)) {
        return { success: false, message: 'Cannot delete role that is assigned to users' };
      }

      const filteredRoles = roles.filter(r => r.role_id !== roleId);
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(filteredRoles));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // =========================
  // POSITION OPERATIONS
  // =========================

  getAllPositions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSITIONS) || '[]');
    } catch (error) {
      console.error('Error getting positions:', error);
      return [];
    }
  }

  getPositionById(positionId) {
    const positions = this.getAllPositions();
    return positions.find(pos => pos.position_id === positionId);
  }

  addPosition(positionData) {
    try {
      const positions = this.getAllPositions();
      const newPosition = {
        position_id: parseInt(Date.now()),
        position_name: positionData.position_name
      };
      positions.push(newPosition);
      localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));
      return { success: true, position: newPosition };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  updatePosition(positionId, positionData) {
    try {
      const positions = this.getAllPositions();
      const positionIndex = positions.findIndex(p => p.position_id === positionId);
      if (positionIndex !== -1) {
        positions[positionIndex] = { ...positions[positionIndex], ...positionData };
        localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));
        return { success: true, position: positions[positionIndex] };
      }
      return { success: false, message: 'Position not found' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  deletePosition(positionId) {
    try {
      const positions = this.getAllPositions();
      const users = this.getAllUsers();
      
      // Check if position is in use
      if (users.some(u => u.position_id === positionId)) {
        return { success: false, message: 'Cannot delete position that is assigned to users' };
      }

      const filteredPositions = positions.filter(p => p.position_id !== positionId);
      localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(filteredPositions));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // =========================
  // CUSTOM FIELD OPERATIONS
  // =========================

  getAllUserFields() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_FIELDS) || '[]');
    } catch (error) {
      return [];
    }
  }

  addUserField(fieldData) {
    try {
      const fields = this.getAllUserFields();
      const newField = {
        user_field_id: parseInt(Date.now()),
        ...fieldData,
        created_at: new Date().toISOString()
      };
      fields.push(newField);
      localStorage.setItem(STORAGE_KEYS.USER_FIELDS, JSON.stringify(fields));
      return { success: true, field: newField };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  updateUserField(fieldId, fieldData) {
    try {
      const fields = this.getAllUserFields();
      const fieldIndex = fields.findIndex(f => f.user_field_id === fieldId);
      if (fieldIndex !== -1) {
        fields[fieldIndex] = { ...fields[fieldIndex], ...fieldData };
        localStorage.setItem(STORAGE_KEYS.USER_FIELDS, JSON.stringify(fields));
        return { success: true, field: fields[fieldIndex] };
      }
      return { success: false, message: 'Field not found' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  deleteUserField(fieldId) {
    try {
      const fields = this.getAllUserFields();
      const filteredFields = fields.filter(f => f.user_field_id !== fieldId);
      localStorage.setItem(STORAGE_KEYS.USER_FIELDS, JSON.stringify(filteredFields));
      
      // Delete all values for this field
      const values = this.getAllUserFieldValues();
      const filteredValues = values.filter(v => v.user_field_id !== fieldId);
      localStorage.setItem(STORAGE_KEYS.USER_FIELD_VALUES, JSON.stringify(filteredValues));
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // User field values
  getAllUserFieldValues() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_FIELD_VALUES) || '[]');
    } catch (error) {
      return [];
    }
  }

  getUserFieldValue(userId, fieldName) {
    const values = this.getAllUserFieldValues();
    const value = values.find(v => v.user_id === userId && v.field_name === fieldName);
    return value?.field_value;
  }

  setUserFieldValue(userId, fieldName, fieldValue) {
    try {
      const values = this.getAllUserFieldValues();
      const existingIndex = values.findIndex(v => v.user_id === userId && v.field_name === fieldName);
      
      if (existingIndex !== -1) {
        values[existingIndex].field_value = fieldValue;
      } else {
        values.push({
          user_id: userId,
          field_name: fieldName,
          field_value: fieldValue
        });
      }
      
      localStorage.setItem(STORAGE_KEYS.USER_FIELD_VALUES, JSON.stringify(values));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  deleteAllUserFieldValues(userId) {
    try {
      const values = this.getAllUserFieldValues();
      const filteredValues = values.filter(v => v.user_id !== userId);
      localStorage.setItem(STORAGE_KEYS.USER_FIELD_VALUES, JSON.stringify(filteredValues));
    } catch (error) {
      console.error('Error deleting user field values:', error);
    }
  }
}

export default new UserService();