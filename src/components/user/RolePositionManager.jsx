// components/user/RolePositionManager.jsx - Role and Position Management Component

import React, { useState } from 'react';
import { MdAdd, MdSave, MdCancel, MdEdit, MdDelete, MdSupervisorAccount, MdWork } from 'react-icons/md';

const RolePositionManager = ({ 
  roles = [], 
  positions = [], 
  onAddRole, 
  onAddPosition, 
  onUpdateRole = null,
  onUpdatePosition = null,
  onDeleteRole = null,
  onDeletePosition = null,
  isDarkMode = false 
}) => {
  const [activeTab, setActiveTab] = useState('roles');
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingPosition, setEditingPosition] = useState(null);
  
  const [roleFormData, setRoleFormData] = useState({
    role_name: '',
    description: '',
    permissions: []
  });
  
  const [positionFormData, setPositionFormData] = useState({
    position_name: '',
    description: '',
    department: ''
  });

  // Role handlers
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roleFormData.role_name.trim()) {
      alert('Role name is required');
      return;
    }

    try {
      if (editingRole) {
        if (onUpdateRole) {
          await onUpdateRole(editingRole.role_id, roleFormData);
        }
        setEditingRole(null);
      } else {
        await onAddRole(roleFormData);
        setIsAddingRole(false);
      }

      setRoleFormData({
        role_name: '',
        description: '',
        permissions: []
      });
    } catch (error) {
      alert('Failed to save role: ' + error.message);
    }
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleFormData({
      role_name: role.role_name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setIsAddingRole(true);
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role? Users with this role will need to be reassigned.')) {
      if (onDeleteRole) {
        await onDeleteRole(roleId);
      }
    }
  };

  const cancelRoleEdit = () => {
    setIsAddingRole(false);
    setEditingRole(null);
    setRoleFormData({
      role_name: '',
      description: '',
      permissions: []
    });
  };

  // Position handlers
  const handlePositionSubmit = async (e) => {
    e.preventDefault();
    
    if (!positionFormData.position_name.trim()) {
      alert('Position name is required');
      return;
    }

    try {
      if (editingPosition) {
        if (onUpdatePosition) {
          await onUpdatePosition(editingPosition.position_id, positionFormData);
        }
        setEditingPosition(null);
      } else {
        await onAddPosition(positionFormData);
        setIsAddingPosition(false);
      }

      setPositionFormData({
        position_name: '',
        description: '',
        department: ''
      });
    } catch (error) {
      alert('Failed to save position: ' + error.message);
    }
  };

  const handleEditPosition = (position) => {
    setEditingPosition(position);
    setPositionFormData({
      position_name: position.position_name,
      description: position.description || '',
      department: position.department || ''
    });
    setIsAddingPosition(true);
  };

  const handleDeletePosition = async (positionId) => {
    if (window.confirm('Are you sure you want to delete this position? Users with this position will need to be reassigned.')) {
      if (onDeletePosition) {
        await onDeletePosition(positionId);
      }
    }
  };

  const cancelPositionEdit = () => {
    setIsAddingPosition(false);
    setEditingPosition(null);
    setPositionFormData({
      position_name: '',
      description: '',
      department: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Roles & Positions Management
        </h2>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Define user roles and positions for your organization
        </p>
      </div>

      {/* Tabs */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'roles'
                ? isDarkMode 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-blue-600 border-b-2 border-blue-600'
                : isDarkMode 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MdSupervisorAccount size={18} />
            Roles ({roles.length})
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'positions'
                ? isDarkMode 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-blue-600 border-b-2 border-blue-600'
                : isDarkMode 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MdWork size={18} />
            Positions ({positions.length})
          </button>
        </div>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          {/* Add Role Button */}
          {!isAddingRole && (
            <div className="flex justify-end">
              <button
                onClick={() => setIsAddingRole(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <MdAdd size={18} />
                Add Role
              </button>
            </div>
          )}

          {/* Add/Edit Role Form */}
          {isAddingRole && (
            <div className={`border rounded-lg p-4 ${
              isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
            }`}>
              <form onSubmit={handleRoleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Role Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={roleFormData.role_name}
                      onChange={(e) => setRoleFormData({ ...roleFormData, role_name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="e.g., Administrator"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Description
                    </label>
                    <input
                      type="text"
                      value={roleFormData.description}
                      onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Role description"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelRoleEdit}
                    className={`px-4 py-2 border rounded-lg font-medium flex items-center gap-2 ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' 
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <MdCancel size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                  >
                    <MdSave size={16} />
                    {editingRole ? 'Update Role' : 'Add Role'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Roles List */}
          <div className={`rounded-lg shadow-sm border overflow-hidden ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {roles.length === 0 ? (
              <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No roles defined yet. Click "Add Role" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Role
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Description
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {roles.map((role) => (
                      <tr key={role.role_id} className={`hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {role.role_name}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ID: {role.role_id}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {role.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditRole(role)}
                              className={`text-blue-600 hover:text-blue-800 ${
                                isDarkMode ? 'text-blue-400 hover:text-blue-300' : ''
                              }`}
                              title="Edit Role"
                            >
                              <MdEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role.role_id)}
                              className={`text-red-600 hover:text-red-800 ${
                                isDarkMode ? 'text-red-400 hover:text-red-300' : ''
                              }`}
                              title="Delete Role"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {/* Add Position Button */}
          {!isAddingPosition && (
            <div className="flex justify-end">
              <button
                onClick={() => setIsAddingPosition(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <MdAdd size={18} />
                Add Position
              </button>
            </div>
          )}

          {/* Add/Edit Position Form */}
          {isAddingPosition && (
            <div className={`border rounded-lg p-4 ${
              isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
            }`}>
              <form onSubmit={handlePositionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Position Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={positionFormData.position_name}
                      onChange={(e) => setPositionFormData({ ...positionFormData, position_name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="e.g., Software Engineer"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Department
                    </label>
                    <input
                      type="text"
                      value={positionFormData.department}
                      onChange={(e) => setPositionFormData({ ...positionFormData, department: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="e.g., Engineering"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Description
                    </label>
                    <input
                      type="text"
                      value={positionFormData.description}
                      onChange={(e) => setPositionFormData({ ...positionFormData, description: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Position description"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelPositionEdit}
                    className={`px-4 py-2 border rounded-lg font-medium flex items-center gap-2 ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' 
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <MdCancel size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                  >
                    <MdSave size={16} />
                    {editingPosition ? 'Update Position' : 'Add Position'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Positions List */}
          <div className={`rounded-lg shadow-sm border overflow-hidden ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {positions.length === 0 ? (
              <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No positions defined yet. Click "Add Position" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Position
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Department
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Description
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {positions.map((position) => (
                      <tr key={position.position_id} className={`hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {position.position_name}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ID: {position.position_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {position.department || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {position.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditPosition(position)}
                              className={`text-blue-600 hover:text-blue-800 ${
                                isDarkMode ? 'text-blue-400 hover:text-blue-300' : ''
                              }`}
                              title="Edit Position"
                            >
                              <MdEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeletePosition(position.position_id)}
                              className={`text-red-600 hover:text-red-800 ${
                                isDarkMode ? 'text-red-400 hover:text-red-300' : ''
                              }`}
                              title="Delete Position"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePositionManager;