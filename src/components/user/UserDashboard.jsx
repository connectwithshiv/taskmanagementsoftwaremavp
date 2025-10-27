// components/user/UserDashboard.jsx - Main Dashboard for Regular Users

import React, { useState, useEffect } from 'react';
import UserTaskList from './UserTaskList';
import UserSidebar from './Usersidebar';
import { MdMenu, MdBrightness4, MdBrightness7 } from 'react-icons/md';
import TaskService from '../../services/taskService';
const UserDashboard = ({ 
  currentUser, 
  categories = [],
  onLogout 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('tasks');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [assignedCategories, setAssignedCategories] = useState([]);

  // Load user's assigned categories with task counts
  useEffect(() => {
    if (!currentUser) return;

    const userId = currentUser.id || currentUser.user_id;
    const userCategoryIds = currentUser.assigned_category_ids || [];

    // Check if user has access to all categories
    if (userCategoryIds.includes('all')) {
      const categoriesWithCounts = categories.map(cat => ({
        ...cat,
        taskCount: TaskService.getTasksByCategory(cat.id).filter(
          t => t.assignedTo === userId
        ).length
      }));
      setAssignedCategories(categoriesWithCounts);
    } else {
      // Filter to only assigned categories
      const userCategories = categories
        .filter(cat => userCategoryIds.includes(cat.id))
        .map(cat => ({
          ...cat,
          taskCount: TaskService.getTasksByCategory(cat.id).filter(
            t => t.assignedTo === userId
          ).length
        }));
      setAssignedCategories(userCategories);
    }
  }, [currentUser, categories]);

  const handleNavigate = (pageId, categoryData = null) => {
    setCurrentPage(pageId);
    
    // If navigating to a category, set the selected category
    if (pageId.startsWith('category-')) {
      setSelectedCategory(categoryData);
    } else {
      setSelectedCategory(null);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'tasks':
        return (
          <div>
            <h1 className={`text-2xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              My Tasks
            </h1>
            <UserTaskList
              currentUser={currentUser}
              categories={categories}
              isDarkMode={isDarkMode}
            />
          </div>
        );

      case 'dashboard':
        return (
          <div>
            <h1 className={`text-2xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Dashboard
            </h1>
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Welcome, {currentUser?.username || currentUser?.name}!
              </p>
              <div className="mt-4">
                <UserTaskList
                  currentUser={currentUser}
                  categories={categories}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div>
            <h1 className={`text-2xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Wallet
            </h1>
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Wallet feature coming soon...
              </p>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div>
            <h1 className={`text-2xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Notifications
            </h1>
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                No new notifications
              </p>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div>
            <h1 className={`text-2xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Profile
            </h1>
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Username
                  </label>
                  <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser?.username}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Email
                  </label>
                  <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser?.email}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Role
                  </label>
                  <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser?.role_name || 'User'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div>
            <h1 className={`text-2xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Settings
            </h1>
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Settings page coming soon...
              </p>
            </div>
          </div>
        );

      default:
        // Category view
        if (currentPage.startsWith('category-')) {
          return (
            <div>
              <h1 className={`text-2xl font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {selectedCategory?.name || 'Category'} Tasks
              </h1>
              <UserTaskList
                currentUser={currentUser}
                categories={categories}
                isDarkMode={isDarkMode}
                selectedCategoryId={selectedCategory?.id}
              />
            </div>
          );
        }
        return (
          <div>
            <h1 className={`text-2xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Page Not Found
            </h1>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <UserSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        isDarkMode={isDarkMode}
        currentUser={currentUser}
        assignedCategories={assignedCategories}
      />

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className={`h-16 ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        } border-b shadow-sm sticky top-0 z-30`}>
          <div className="h-full px-4 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <MdMenu size={24} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
            </button>

            {/* Page Title - Mobile */}
            <div className="lg:hidden">
              <h1 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentPage === 'tasks' ? 'My Tasks' : 
                 currentPage === 'dashboard' ? 'Dashboard' :
                 currentPage.startsWith('category-') ? selectedCategory?.name :
                 currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </h1>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? <MdBrightness7 size={20} /> : <MdBrightness4 size={20} />}
              </button>

              {/* User Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
              }`}>
                <span className="text-white font-bold">
                  {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;