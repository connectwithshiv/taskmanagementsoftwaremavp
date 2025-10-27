// components/user/UserSidebar.jsx - Sidebar for Regular Users

import React from 'react';
import { 
  MdDashboard,
  MdTaskAlt,
  MdAccountBalanceWallet,
  MdFolder,
  MdNotifications,
  MdPerson,
  MdSettings,
  MdLogout,
  MdClose,
  MdMenu
} from 'react-icons/md';

const UserSidebar = ({ 
  isOpen, 
  onToggle, 
  currentPage, 
  onNavigate, 
  onLogout,
  isDarkMode,
  currentUser,
  assignedCategories = []
}) => {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: MdDashboard,
      color: 'text-blue-500'
    },
    { 
      id: 'tasks', 
      label: 'My Tasks', 
      icon: MdTaskAlt,
      color: 'text-green-500'
    },
    { 
      id: 'wallet', 
      label: 'Wallet', 
      icon: MdAccountBalanceWallet,
      color: 'text-purple-500'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: MdNotifications,
      color: 'text-orange-500',
      badge: 5 // Number of notifications
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
        border-r shadow-xl
      `}>
        {/* Header */}
        <div className={`h-16 flex items-center justify-between px-4 border-b ${
          isDarkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              <MdPerson className="text-white" size={24} />
            </div>
            <div>
              <h2 className={`font-bold text-sm ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {currentUser?.name || 'User'}
              </h2>
              <p className={`text-xs ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {currentUser?.role_name || 'Employee'}
              </p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <MdClose className={isDarkMode ? 'text-slate-400' : 'text-slate-600'} size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* Main Menu Items */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200 group relative
                  ${isActive 
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-blue-500 text-white shadow-lg'
                    : isDarkMode
                      ? 'text-slate-300 hover:bg-slate-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }
                `}
              >
                <Icon 
                  size={22} 
                  className={!isActive ? item.color : ''}
                />
                <span className="font-medium">{item.label}</span>
                
                {/* Badge for notifications */}
                {item.badge && item.badge > 0 && (
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive 
                      ? 'bg-white text-blue-600' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                )}
              </button>
            );
          })}

          {/* Assigned Categories Section */}
          <div className="pt-6">
            <div className={`flex items-center gap-2 px-4 py-2 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <MdFolder size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                My Categories
              </span>
            </div>
            
            <div className="space-y-1 mt-2">
              {assignedCategories && assignedCategories.length > 0 ? (
                assignedCategories.slice(0, 8).map((category) => {
                  const categoryId = `category-${category.id}`;
                  const isActive = currentPage === categoryId;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        onNavigate(categoryId, category);
                        if (window.innerWidth < 1024) onToggle();
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                        transition-all duration-200 relative
                        ${isActive 
                          ? isDarkMode 
                            ? 'bg-purple-600 text-white shadow-lg' 
                            : 'bg-purple-500 text-white shadow-lg'
                          : isDarkMode
                            ? 'text-slate-300 hover:bg-slate-700'
                            : 'text-slate-700 hover:bg-slate-100'
                        }
                      `}
                      title={category.fullPath}
                    >
                      <MdFolder 
                        size={18} 
                        className={!isActive ? 'text-purple-500' : ''}
                      />
                      <span className="text-sm truncate flex-1 text-left">
                        {category.name}
                      </span>
                      {category.taskCount > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          isActive 
                            ? 'bg-white text-purple-600' 
                            : isDarkMode 
                              ? 'bg-slate-700 text-slate-300' 
                              : 'bg-slate-200 text-slate-600'
                        }`}>
                          {category.taskCount}
                        </span>
                      )}
                      
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className={`px-4 py-3 text-center text-sm ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  No categories assigned
                </div>
              )}
              
              {assignedCategories && assignedCategories.length > 8 && (
                <button
                  onClick={() => onNavigate('all-categories')}
                  className={`
                    w-full px-4 py-2 text-sm text-center rounded-lg
                    ${isDarkMode 
                      ? 'text-blue-400 hover:bg-slate-700' 
                      : 'text-blue-600 hover:bg-slate-100'
                    }
                  `}
                >
                  View All ({assignedCategories.length})
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className={`border-t p-4 space-y-1 ${
          isDarkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          {/* Profile */}
          <button
            onClick={() => {
              onNavigate('profile');
              if (window.innerWidth < 1024) onToggle();
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
              transition-colors
              ${currentPage === 'profile'
                ? isDarkMode 
                  ? 'bg-slate-700 text-white' 
                  : 'bg-slate-100 text-slate-900'
                : isDarkMode
                  ? 'text-slate-300 hover:bg-slate-700'
                  : 'text-slate-700 hover:bg-slate-100'
              }
            `}
          >
            <MdPerson size={20} />
            <span className="font-medium text-sm">Profile</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              onNavigate('settings');
              if (window.innerWidth < 1024) onToggle();
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
              transition-colors
              ${currentPage === 'settings'
                ? isDarkMode 
                  ? 'bg-slate-700 text-white' 
                  : 'bg-slate-100 text-slate-900'
                : isDarkMode
                  ? 'text-slate-300 hover:bg-slate-700'
                  : 'text-slate-700 hover:bg-slate-100'
              }
            `}
          >
            <MdSettings size={20} />
            <span className="font-medium text-sm">Settings</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
              transition-colors
              ${isDarkMode
                ? 'text-red-400 hover:bg-red-900/20'
                : 'text-red-600 hover:bg-red-50'
              }
            `}
          >
            <MdLogout size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;