import { UserIdResolver } from "../components/user/UserIdResolver";
const AUTH_STORAGE_KEY = 'taskManagement_auth';
const USER_STORAGE_KEY = 'taskManagement_user';
const AUTH_USERS_KEY = 'taskManagement_users_db';

export const AuthService = {
  /**
   * Login user with email and password
   * @param {Object} credentials - { email/username, password, rememberMe }
   * @returns {Promise<Object>} - { success, user, token, message }
   */
  login: async (credentials) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get users from auth database
      const authUsers = JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '[]');

      // Find user by email or username
      const user = authUsers.find(
        u => (u.email === credentials.username || u.username === credentials.username) && 
             u.password === credentials.password &&
             u.status === 'active'
      );

      if (!user) {
        return {
          success: false,
          message: 'Invalid email/username or password'
        };
      }

      // Get canonical user ID using resolver
      const canonicalId = UserIdResolver.getUserId(user);
      
      console.log('Login - User found:', {
        username: user.username,
        canonicalId,
        originalIds: UserIdResolver.getAllUserIds(user)
      });

      // Generate token
      const token = btoa(JSON.stringify({
        userId: canonicalId,
        email: user.email,
        timestamp: Date.now()
      }));

      // Save authentication data
      const authData = {
        token,
        timestamp: Date.now(),
        rememberMe: credentials.rememberMe
      };

      // Store user data with canonical ID
      const userData = {
        id: canonicalId, //Always use canonical ID
        username: user.username,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
        position_id: user.position_id,
        position_name: user.position_name,
        assigned_category_ids: user.assigned_category_ids,
        permissions: user.permissions,
        custom_fields: user.custom_fields
      };
      
      console.log('Storing user session with ID:', userData.id);

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      // Set expiry
      const expiryDate = new Date();
      if (credentials.rememberMe) {
        expiryDate.setDate(expiryDate.getDate() + 30); // 30 days
      } else {
        expiryDate.setHours(expiryDate.getHours() + 24); // 24 hours
      }
      localStorage.setItem('auth_expiry', expiryDate.toISOString());

      return {
        success: true,
        user: userData,
        token,
        message: 'Login successful'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem('auth_expiry');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    const expiry = localStorage.getItem('auth_expiry');

    if (!authData || !expiry) {
      return false;
    }

    // Check if token expired
    const expiryDate = new Date(expiry);
    const now = new Date();

    if (now > expiryDate) {
      AuthService.logout();
      return false;
    }

    return true;
  },

  /**
   * Get current user (with ID resolver)
   * @returns {Object|null}
   */
  getCurrentUser: () => {
    if (!AuthService.isAuthenticated()) {
      return null;
    }

    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (!userData) return null;
    
    const user = JSON.parse(userData);
    
    // Ensure canonical ID
    const canonicalId = UserIdResolver.getUserId(user);
    return {
      ...user,
      id: canonicalId
    };
  },

  /**
   * Get auth token
   * @returns {string|null}
   */
  getToken: () => {
    if (!AuthService.isAuthenticated()) {
      return null;
    }

    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    return authData ? JSON.parse(authData).token : null;
  },

  /**
   * Check user permission
   * @param {string} permission - Permission to check
   * @returns {boolean}
   */
  hasPermission: (permission) => {
    const user = AuthService.getCurrentUser();
    if (!user) return false;

    return user.permissions?.includes('all') || user.permissions?.includes(permission);
  },

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  isAdmin: () => {
    const user = AuthService.getCurrentUser();
    return user?.permissions?.includes('all') || user?.role_id === 1;
  },

  /**
   * Check if user has access to category
   * @param {string} categoryId - Category ID
   * @returns {boolean}
   */
  hasCategoryAccess: (categoryId) => {
    const user = AuthService.getCurrentUser();
    if (!user) return false;

    // Admin has access to all
    if (user.assigned_category_ids?.includes('all')) return true;

    // Check if user has specific category access
    return user.assigned_category_ids?.includes(categoryId);
  },

  /**
   * Get user's accessible categories
   * @param {Array} allCategories - All available categories
   * @returns {Array} Filtered categories
   */
  getAccessibleCategories: (allCategories) => {
    const user = AuthService.getCurrentUser();
    if (!user) return [];

    // Admin sees all
    if (user.assigned_category_ids?.includes('all')) {
      return allCategories;
    }

    // Filter to assigned categories
    return allCategories.filter(cat => 
      user.assigned_category_ids?.includes(cat.id)
    );
  },

  /**
   * Refresh token (extend session)
   */
  refreshToken: () => {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) return false;

    const auth = JSON.parse(authData);
    
    // Extend expiry
    const expiryDate = new Date();
    if (auth.rememberMe) {
      expiryDate.setDate(expiryDate.getDate() + 30);
    } else {
      expiryDate.setHours(expiryDate.getHours() + 24);
    }
    
    localStorage.setItem('auth_expiry', expiryDate.toISOString());
    return true;
  },

  /**
   * Update current user data (for profile updates)
   */
  updateCurrentUser: (updates) => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return false;

    const canonicalId = UserIdResolver.getUserId(currentUser);
    
    // Ensure ID remains consistent
    const updatedUser = { 
      ...currentUser, 
      ...updates,
      id: canonicalId // Never allow id to be changed
    };
    
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    return true;
  }
};

export default AuthService;