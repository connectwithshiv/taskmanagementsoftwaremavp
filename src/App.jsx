import React, { useState, useEffect } from 'react';
import LoginPage from './components/auth/LoginForm';
import AuthService from './services/authService';
import AdminSidebar from './components/common/Sidebar';
import AdminHeader from './components/common/Header';
import CategoryPage from './pages/CategoryPage';
import UsersPage from './pages/UsersPage';
import TaskPage from './pages/TasksPage';
import UserApp from './components/user/Userapp';
const App = () => {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      if (AuthService.isAuthenticated()) {
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Handle login
  const handleLogin = async (credentials) => {
    const result = await AuthService.login(credentials);
    
    if (result.success) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
      return { success: true };
    }
    
    return { success: false, message: result.message };
  };

  // Handle logout
  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
    setSidebarOpen(false);
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-slate-900' : 'bg-slate-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg font-medium ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Loading Task Management System...
          </p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} isDarkMode={isDarkMode} />;
  }

  // Check if user is admin
  const isAdmin = AuthService.isAdmin();

  // ==========================================
  // USER INTERFACE (For role_id !== 1)
  // ==========================================
  if (!isAdmin) {
    return (
      <UserApp 
        currentUser={currentUser}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
    );
  }

  // ==========================================
  // ADMIN INTERFACE (For role_id === 1)
  // ==========================================

  // Admin Dashboard
  const renderAdminDashboard = () => {
    return (
      <div className="p-6">
        <h2 className={`text-3xl font-bold mb-6 ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          Admin Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Total Users', value: AuthService.getAllUsers?.().length || '0', color: 'from-blue-600 to-blue-700' },
            { title: 'Active Tasks', value: '56', color: 'from-green-600 to-green-700' },
            { title: 'Categories', value: '42', color: 'from-purple-600 to-purple-700' },
            { title: 'Pending Items', value: '18', color: 'from-orange-600 to-orange-700' },
          ].map((card, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${card.color} p-6 rounded-lg shadow-lg text-white`}
            >
              <p className="text-sm opacity-90">{card.title}</p>
              <p className="text-4xl font-bold mt-2">{card.value}</p>
            </div>
          ))}
        </div>

        <div className={`mt-6 p-6 rounded-lg border ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
        }`}>
          <h3 className={`text-xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Welcome back, {currentUser?.name || 'Administrator'}!
          </h3>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            You are logged in as <span className="font-medium text-purple-600">{currentUser?.role_name || 'Admin'}</span> with full system access.
            Navigate using the sidebar to manage users, categories, and tasks.
          </p>
        </div>
      </div>
    );
  };

  // Render pages based on navigation
  const renderAdminPage = () => {
    // Dashboard
    if (currentPage === 'dashboard') {
      return renderAdminDashboard();
    }

    // Categories
    if (currentPage === 'categories') {
      return <CategoryPage isDarkMode={isDarkMode} />;
    }

    // Users - Admin only
    if (currentPage === 'users') {
      return <UsersPage currentUserId={currentUser?.id} isDarkMode={isDarkMode} />;
    }

    // Tasks - NEW INTEGRATION
    if (currentPage === 'tasks') {
      return <TaskPage isDarkMode={isDarkMode} />;
    }

    // User Dependency
    if (currentPage === 'user-dependency') {
      return (
        <div className="p-6">
          <h2 className={`text-3xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            User Dependency Management
          </h2>
          <div className={`p-6 rounded-lg border ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
          }`}>
            <p className={`text-center py-8 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              User dependency management interface will be implemented here
            </p>
          </div>
        </div>
      );
    }

    // Task Dependency
    if (currentPage === 'task-dependency') {
      return (
        <div className="p-6">
          <h2 className={`text-3xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Task Dependency Management
          </h2>
          <div className={`p-6 rounded-lg border ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
          }`}>
            <p className={`text-center py-8 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Task dependency management interface will be implemented here
            </p>
          </div>
        </div>
      );
    }

    // Settings
    if (currentPage === 'settings') {
      return (
        <div className="p-6">
          <h2 className={`text-3xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Settings
          </h2>
          <div className={`p-6 rounded-lg border ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
          }`}>
            <div className="space-y-6">
              {/* User Profile Section */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  User Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={currentUser?.username || ''}
                      disabled
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-slate-400' 
                          : 'bg-gray-100 border-gray-300 text-gray-600'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-slate-400' 
                          : 'bg-gray-100 border-gray-300 text-gray-600'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Theme Settings */}
              <div className={`pt-6 border-t ${
                isDarkMode ? 'border-slate-700' : 'border-slate-300'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Appearance
                </h3>
                <div className="flex items-center justify-between">
                  <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                    Dark Mode
                  </span>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default fallback
    return <CategoryPage isDarkMode={isDarkMode} />;
  };

  // Main Admin Application
  return (
    <div className={`flex h-screen ${
      isDarkMode ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      {/* Admin Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        {/* Admin Header */}
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          currentUser={currentUser}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {renderAdminPage()}
        </main>
      </div>
    </div>
  );
};
export default App;