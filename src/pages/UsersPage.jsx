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
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  UserPlus, 
  Settings, 
  BarChart3, 
  History
} from 'lucide-react';
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
    <div className={`min-h-screen p-6 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`rounded-2xl shadow-xl border overflow-hidden mb-8 ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-100'
        }`}>
          {/* Header Background */}
          <div className={`px-8 py-6 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700' 
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600'
          }`}>
            <div className="flex justify-between items-center">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">User Management</h1>
                <p className={`text-lg ${
                  isDarkMode ? 'text-slate-300' : 'text-blue-100'
                }`}>
                  Manage system users, roles, positions, and access permissions
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('add');
                  setSelectedUser(null);
                }}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold ${
                  isDarkMode 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Plus size={22} />
                Add New User
              </button>
            </div>
          </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className={`group p-6 rounded-xl border hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-slate-700 to-slate-600 border-slate-600' 
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Users className="text-white" size={20} />
                  </div>
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    isDarkMode 
                      ? 'text-blue-300 bg-blue-900' 
                      : 'text-blue-600 bg-blue-200'
                  }`}>
                    TOTAL
                  </div>
                </div>
                <div className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-600'
                }`}>
                  Total Users
                </div>
                <div className={`text-3xl font-bold ${
                  isDarkMode ? 'text-blue-200' : 'text-blue-700'
                }`}>
                  {stats.totalUsers || 0}
                </div>
              </div>
              
              <div className={`group p-6 rounded-xl border hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-slate-700 to-slate-600 border-slate-600' 
                  : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <UserPlus className="text-white" size={20} />
                  </div>
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    isDarkMode 
                      ? 'text-green-300 bg-green-900' 
                      : 'text-green-600 bg-green-200'
                  }`}>
                    ACTIVE
                  </div>
                </div>
                <div className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-green-300' : 'text-green-600'
                }`}>
                  Active Users
                </div>
                <div className={`text-3xl font-bold ${
                  isDarkMode ? 'text-green-200' : 'text-green-700'
                }`}>
                  {stats.activeUsers || 0}
                </div>
              </div>
              
              <div className={`group p-6 rounded-xl border hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-slate-700 to-slate-600 border-slate-600' 
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <Users className="text-white" size={20} />
                  </div>
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    isDarkMode 
                      ? 'text-red-300 bg-red-900' 
                      : 'text-red-600 bg-red-200'
                  }`}>
                    INACTIVE
                  </div>
                </div>
                <div className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-red-300' : 'text-red-600'
                }`}>
                  Inactive Users
                </div>
                <div className={`text-3xl font-bold ${
                  isDarkMode ? 'text-red-200' : 'text-red-700'
                }`}>
                  {stats.inactiveUsers || 0}
                </div>
              </div>
              
              <div className={`group p-6 rounded-xl border hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-slate-700 to-slate-600 border-slate-600' 
                  : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Settings className="text-white" size={20} />
                  </div>
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    isDarkMode 
                      ? 'text-purple-300 bg-purple-900' 
                      : 'text-purple-600 bg-purple-200'
                  }`}>
                    ROLES
                  </div>
                </div>
                <div className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-purple-300' : 'text-purple-600'
                }`}>
                  Total Roles
                </div>
                <div className={`text-3xl font-bold ${
                  isDarkMode ? 'text-purple-200' : 'text-purple-700'
                }`}>
                  {roles.length || 0}
                </div>
              </div>
              
              <div className={`group p-6 rounded-xl border hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-slate-700 to-slate-600 border-slate-600' 
                  : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <BarChart3 className="text-white" size={20} />
                  </div>
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    isDarkMode 
                      ? 'text-orange-300 bg-orange-900' 
                      : 'text-orange-600 bg-orange-200'
                  }`}>
                    POSITIONS
                  </div>
                </div>
                <div className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-orange-300' : 'text-orange-600'
                }`}>
                  Total Positions
                </div>
                <div className={`text-3xl font-bold ${
                  isDarkMode ? 'text-orange-200' : 'text-orange-700'
                }`}>
                  {positions.length || 0}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Action Tabs */}
        <div className={`rounded-2xl shadow-xl border overflow-hidden mb-8 ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className={`p-6 border-b ${
            isDarkMode ? 'border-slate-700' : 'border-gray-100'
          }`}>
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab('list');
                  setSelectedUser(null);
                }}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 rounded-lg ${
                  activeTab === 'list'
                    ? isDarkMode 
                      ? 'bg-slate-700 text-blue-400 shadow-sm' 
                      : 'bg-blue-50 text-blue-600 shadow-sm'
                    : isDarkMode 
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Users size={18} />
                Users
              </button>
             
              <button
                onClick={() => {
                  setActiveTab('add');
                  setSelectedUser(null);
                }}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 rounded-lg ${
                  activeTab === 'add'
                    ? isDarkMode 
                      ? 'bg-slate-700 text-blue-400 shadow-sm' 
                      : 'bg-blue-50 text-blue-600 shadow-sm'
                    : isDarkMode 
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <UserPlus size={18} />
                Add User
              </button>

              <button
                onClick={() => setActiveTab('roles-positions')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 rounded-lg ${
                  activeTab === 'roles-positions'
                    ? isDarkMode 
                      ? 'bg-slate-700 text-blue-400 shadow-sm' 
                      : 'bg-blue-50 text-blue-600 shadow-sm'
                    : isDarkMode 
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Settings size={18} />
                Roles & Positions
              </button>

              <button
                onClick={() => setActiveTab('custom-fields')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 rounded-lg ${
                  activeTab === 'custom-fields'
                    ? isDarkMode 
                      ? 'bg-slate-700 text-blue-400 shadow-sm' 
                      : 'bg-blue-50 text-blue-600 shadow-sm'
                    : isDarkMode 
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Settings size={18} />
                Custom Fields
              </button>

              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 rounded-lg ${
                  activeTab === 'stats'
                    ? isDarkMode 
                      ? 'bg-slate-700 text-blue-400 shadow-sm' 
                      : 'bg-blue-50 text-blue-600 shadow-sm'
                    : isDarkMode 
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <BarChart3 size={18} />
                Statistics
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 rounded-lg ${
                  activeTab === 'history'
                    ? isDarkMode 
                      ? 'bg-slate-700 text-blue-400 shadow-sm' 
                      : 'bg-blue-50 text-blue-600 shadow-sm'
                    : isDarkMode 
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <History size={18} />
                Activity
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Users List Tab */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className={`rounded-2xl shadow-xl border overflow-hidden ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className={`p-6 border-b ${
                  isDarkMode ? 'border-slate-700' : 'border-gray-100'
                }`}>
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="flex-1 relative">
                      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-500'
                      }`} size={20} />
                      <input
                        type="text"
                        placeholder="Search users by name, email, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:bg-slate-600' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-gray-50'
                        }`}
                      />
                    </div>

                    {/* Filter Toggle */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`px-6 py-3 border rounded-xl font-medium flex items-center gap-2 transition-all duration-200 ${
                        showFilters
                          ? isDarkMode 
                            ? 'bg-blue-900/50 border-blue-600 text-blue-300' 
                            : 'bg-blue-50 border-blue-300 text-blue-700'
                          : isDarkMode 
                            ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Filter size={18} />
                      Filters
                    </button>

                    {/* Reset Filters */}
                    {(searchTerm || filters.status !== 'all' || filters.role_id || filters.position_id || filters.assigned_category_ids.length > 0) && (
                      <button
                        onClick={resetFilters}
                        className={`px-6 py-3 border rounded-xl font-medium transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className={`p-6 border-t ${
                    isDarkMode ? 'border-slate-700' : 'border-gray-100'
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Status Filter */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${
                          isDarkMode ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          Status
                        </label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            isDarkMode 
                              ? 'bg-slate-700 border-slate-600 text-white' 
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
                        <label className={`block text-sm font-semibold mb-2 ${
                          isDarkMode ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          Role
                        </label>
                        <select
                          value={filters.role_id}
                          onChange={(e) => setFilters({ ...filters, role_id: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            isDarkMode 
                              ? 'bg-slate-700 border-slate-600 text-white' 
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
                        <label className={`block text-sm font-semibold mb-2 ${
                          isDarkMode ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          Position
                        </label>
                        <select
                          value={filters.position_id}
                          onChange={(e) => setFilters({ ...filters, position_id: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            isDarkMode 
                              ? 'bg-slate-700 border-slate-600 text-white' 
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
                        <label className={`block text-sm font-semibold mb-2 ${
                          isDarkMode ? 'text-slate-300' : 'text-gray-700'
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
                          className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            isDarkMode 
                              ? 'bg-slate-700 border-slate-600 text-white' 
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
                        <p className={`text-xs mt-2 ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-500'
                        }`}>
                          Hold Ctrl/Cmd to select multiple
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Users List */}
              <div className={`rounded-2xl shadow-xl border overflow-hidden ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-gray-100'
              }`}>
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