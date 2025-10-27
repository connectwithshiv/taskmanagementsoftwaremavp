// pages/UsersPage.jsx - Updated Main Users Management Page

import React, { useState, useEffect } from 'react';
import { 
  MdAdd, 
  MdPeople,
  MdSettings,
  MdSearch,
  MdFilterList,
  MdBarChart,
  MdHistory,
  MdSupervisorAccount
} from 'react-icons/md';
import { useUser } from '../hooks/useUser';
import UserForm from '../components/user/UserForm';
import UserList from '../components/user/UserList';
import CustomFieldsManager from '../components/user/CustomFieldsManager';
import RolePositionManager from '../components/user/RolePositionManager';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmModal from '../components/common/ConfirmModal';

const UsersPage = ({ currentUserId = 'admin', isDarkMode = false }) => {
  // State Management
  const {
    users,
    roles,
    positions,
    userFields,
    categories, // Now loaded from UserService
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
    refreshCategories
  } = useUser();

  const [activeTab, setActiveTab] = useState('list');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    role_id: '',
    position_id: '',
    assigned_category_ids: [] // Changed to array for multiple categories
  });
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteField, setConfirmDeleteField] = useState(null);
  const [stats, setStats] = useState(null);

  // Load statistics
  useEffect(() => {
    const statistics = getStatistics();
    setStats(statistics);
  }, [users, getStatistics]);

  // Filter users based on search and filters
  const filteredUsers = searchUsers(searchTerm, {
    ...filters,
    status: filters.status === 'all' ? '' : filters.status
  });

  // Handlers
  const handleCreateUser = async (userData) => {
    const result = await createUser({
      ...userData,
      created_by: currentUserId
    });
    if (result.success) {
      setActiveTab('list');
      setSelectedUser(null);
    }
    return result;
  };

  const handleUpdateUser = async (userData) => {
    const result = await updateUser(selectedUser.user_id, {
      ...userData,
      updated_by: currentUserId
    });
    if (result.success) {
      setActiveTab('list');
      setSelectedUser(null);
    }
    return result;
  };

  const handleDeleteUser = async () => {
    if (!confirmDelete) return;
   
    const result = await deleteUser(confirmDelete.user_id, currentUserId);
    if (result.success) {
      setConfirmDelete(null);
    }
  };

  const handleDeleteField = async () => {
    if (!confirmDeleteField) return;
    
    const result = await deleteUserField(confirmDeleteField.user_field_id);
    if (result.success) {
      setConfirmDeleteField(null);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setActiveTab('edit');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      role_id: '',
      position_id: '',
      assigned_category_ids: []
    });
  };

  // Helper function to get category names from IDs
  const getCategoryNames = (categoryIds) => {
    if (!categoryIds || categoryIds.length === 0) return 'N/A';
    return categoryIds
      .map(id => {
        const category = categories.find(cat => cat.id === id);
        return category ? `ID: ${id} - ${category.name}` : `ID: ${id}`;
      })
      .join(', ');
  };

  if (loading && !users.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            User Management
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage system users, roles, positions, and access permissions
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        // pages/UsersPage.jsx - COMPLETE FIX for Statistics Display

// Replace your statistics cards section with this:

{/* Statistics Cards - FIXED */}
{stats && (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
    {/* Total Users */}
    <div className={`p-4 rounded-lg shadow-sm border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Total Users
      </div>
      <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {stats.totalUsers || 0}
      </div>
    </div>

    {/* Active Users */}
    <div className={`p-4 rounded-lg shadow-sm border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Active
      </div>
      <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
        {stats.activeUsers || 0}
      </div>
    </div>

    {/* Inactive Users */}
    <div className={`p-4 rounded-lg shadow-sm border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Inactive
      </div>
      <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
        {stats.inactiveUsers || 0}
      </div>
    </div>

    {/* Roles Count */}
    <div className={`p-4 rounded-lg shadow-sm border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Roles
      </div>
      <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
        {roles.length || 0}
      </div>
    </div>

    {/* Positions Count */}
    <div className={`p-4 rounded-lg shadow-sm border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Positions
      </div>
      <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
        {positions.length || 0}
      </div>
    </div>
  </div>
)}

        {/* Action Tabs */}
        <div className={`mb-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('list');
                setSelectedUser(null);
              }}
              className={`px-4 py-2.5 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'list'
                  ? isDarkMode 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : isDarkMode 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MdPeople size={18} />
              Users
            </button>
           
            <button
              onClick={() => {
                setActiveTab('add');
                setSelectedUser(null);
              }}
              className={`px-4 py-2.5 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'add'
                  ? isDarkMode 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : isDarkMode 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MdAdd size={18} />
              Add User
            </button>

            <button
              onClick={() => setActiveTab('roles-positions')}
              className={`px-4 py-2.5 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'roles-positions'
                  ? isDarkMode 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : isDarkMode 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MdSupervisorAccount size={18} />
              Roles & Positions
            </button>

            <button
              onClick={() => setActiveTab('custom-fields')}
              className={`px-4 py-2.5 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'custom-fields'
                  ? isDarkMode 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : isDarkMode 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MdSettings size={18} />
              Custom Fields
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2.5 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'stats'
                  ? isDarkMode 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : isDarkMode 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MdBarChart size={18} />
              Statistics
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'history'
                  ? isDarkMode 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : isDarkMode 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MdHistory size={18} />
              Activity
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Users List Tab */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <MdSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} size={20} />
                    <input
                      type="text"
                      placeholder="Search users by name, email, or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>

                  {/* Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 border rounded-lg font-medium flex items-center gap-2 ${
                      showFilters
                        ? isDarkMode 
                          ? 'bg-blue-900/50 border-blue-600 text-blue-300' 
                          : 'bg-blue-50 border-blue-300 text-blue-700'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <MdFilterList size={18} />
                    Filters
                  </button>

                  {/* Reset Filters */}
                  {(searchTerm || filters.status !== 'all' || filters.role_id || filters.position_id || filters.assigned_category_ids.length > 0) && (
                    <button
                      onClick={resetFilters}
                      className={`px-4 py-2 border rounded-lg font-medium ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Status Filter */}
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Status
                        </label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      {/* Role Filter */}
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Role
                        </label>
                        <select
                          value={filters.role_id}
                          onChange={(e) => setFilters({ ...filters, role_id: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="">All Roles</option>
                          {roles.map(role => (
                            <option key={role.role_id} value={role.role_id}>
                              {role.role_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Position Filter */}
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Position
                        </label>
                        <select
                          value={filters.position_id}
                          onChange={(e) => setFilters({ ...filters, position_id: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="">All Positions</option>
                          {positions.map(position => (
                            <option key={position.position_id} value={position.position_id}>
                              {position.position_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Category Filter */}
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Categories
                        </label>
                        <select
                          multiple
                          value={filters.assigned_category_ids}
                          onChange={(e) => {
                            const values = Array.from(e.target.selectedOptions, option => option.value);
                            setFilters({ ...filters, assigned_category_ids: values });
                          }}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          size="3"
                        >
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              ID: {category.id} - {category.name}
                            </option>
                          ))}
                        </select>
                        <p className={`text-xs mt-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Hold Ctrl/Cmd to select multiple
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Users List */}
              <UserList
                users={filteredUsers}
                roles={roles}
                positions={positions}
                categories={categories}
                onEdit={handleEditUser}
                onDelete={setConfirmDelete}
                isDarkMode={isDarkMode}
              />
            </div>
          )}

          {/* Add User Tab */}
          {(activeTab === 'add' || activeTab === 'edit') && (
            <UserForm
              user={selectedUser}
              roles={roles}
              positions={positions}
              categories={categories}
              userFields={userFields}
              onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
              onCancel={() => {
                setActiveTab('list');
                setSelectedUser(null);
              }}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Roles & Positions Management Tab */}
          {activeTab === 'roles-positions' && (
            <RolePositionManager
              roles={roles}
              positions={positions}
              onAddRole={addRole}
              onUpdateRole={updateRole}
              onDeleteRole={deleteRole}
              onAddPosition={addPosition}
              onUpdatePosition={updatePosition}
              onDeletePosition={deletePosition}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Custom Fields Tab */}
          {activeTab === 'custom-fields' && (
            <CustomFieldsManager
              userFields={userFields}
              onAdd={addUserField}
              onUpdate={updateUserField}
              onDelete={deleteUserField}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              {/* Role Distribution */}
              <div className={`rounded-lg shadow-sm border p-6 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Users by Role
                </h3>
                <div className="space-y-3">
                  {stats.byRole?.map(role => (
                    <div key={role.role_id} className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {role.role_name}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`w-32 rounded-full h-2 ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(role.count / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm w-12 text-right ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {role.count}
                        </span>
                      </div>
                    </div>
                  )) || <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No role data available</p>}
                </div>
              </div>

              {/* Position Distribution */}
              <div className={`rounded-lg shadow-sm border p-6 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Users by Position
                </h3>
                <div className="space-y-3">
                  {stats.byPosition?.map(position => (
                    <div key={position.position_id} className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {position.position_name}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`w-32 rounded-full h-2 ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(position.count / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm w-12 text-right ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {position.count}
                        </span>
                      </div>
                    </div>
                  )) || <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No position data available</p>}
                </div>
              </div>

              {/* Category Distribution */}
              <div className={`rounded-lg shadow-sm border p-6 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Users by Category
                </h3>
                <div className="space-y-3">
                  {stats.byCategory?.map(category => (
                    <div key={category.id} className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        ID: {category.id} - {categories.find(cat => cat.id === category.id)?.name || 'Unknown'}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`w-32 rounded-full h-2 ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(category.count / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm w-12 text-right ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {category.count}
                        </span>
                      </div>
                    </div>
                  )) || <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No category data available</p>}
                </div>
              </div>
            </div>
          )}

          {/* Activity Logs Tab */}
          {activeTab === 'history' && (
            <div className={`rounded-lg shadow-sm border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-6">
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  User Activity Logs
                </h2>
                <div className="space-y-2">
                  {users.slice(0, 10).map(user => (
                    user.logs && user.logs.length > 0 ? (
                      <div key={user.user_id} className={`p-3 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {user.username}
                        </div>
                        {user.logs.slice(-3).map((log, index) => (
                          <div key={index} className={`text-sm mt-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {log.action} - {new Date(log.timestamp).toLocaleString()}
                            {log.details && ` - ${log.details}`}
                          </div>
                        ))}
                      </div>
                    ) : null
                  ))}
                  {users.filter(user => user.logs && user.logs.length > 0).length === 0 && (
                    <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No activity logs available
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <ConfirmModal
            isOpen={true}
            onClose={() => setConfirmDelete(null)}
            onConfirm={handleDeleteUser}
            title="Delete User"
            message={`Are you sure you want to delete user "${confirmDelete.username}"? This action cannot be undone.`}
            confirmText="Delete"
            confirmStyle="danger"
          />
        )}

        {/* Delete Field Confirmation Modal */}
        {confirmDeleteField && (
          <ConfirmModal
            isOpen={true}
            onClose={() => setConfirmDeleteField(null)}
            onConfirm={handleDeleteField}
            title="Delete Field"
            message={`Are you sure you want to delete field "${confirmDeleteField.field_name}"? This will also remove all values for this field.`}
            confirmText="Delete"
            confirmStyle="danger"
          />
        )}
      </div>
    </div>
  );
};

export default UsersPage;