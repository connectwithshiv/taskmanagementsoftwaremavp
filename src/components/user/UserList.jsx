// components/user/UserList.jsx - FIXED Users Table Component

import React, { useState } from 'react';
import { MdEdit, MdDelete, MdPerson, MdCheck, MdClose } from 'react-icons/md';
import UserRow from './UserRow';
import EmptyState from '../shared/EmptyState';
import Pagination from '../shared/Pagination';

const UserList = ({ 
  users = [], 
  roles = [], 
  positions = [], 
  categories = [],
  onEdit, 
  onDelete,
  isDarkMode = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Helper function to get role name
  const getRoleName = (roleId) => {
    if (!roleId) return 'N/A';
    const role = roles.find(r => r.role_id === parseInt(roleId));
    return role ? role.role_name : `Role ID: ${roleId}`;
  };

  // Helper function to get position name
  const getPositionName = (positionId) => {
    if (!positionId) return 'N/A';
    const position = positions.find(p => p.position_id === parseInt(positionId));
    return position ? position.position_name : `Position ID: ${positionId}`;
  };

  // Helper function to get category names
  const getCategoryNames = (categoryIds) => {
    if (!categoryIds || categoryIds.length === 0) return 'None';
    
    const categoryArray = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
    
    if (categoryArray.includes('all')) return 'All Categories';
    
    const categoryNames = categoryArray
      .map(id => {
        const category = categories.find(cat => cat.id === id);
        return category ? category.name : id;
      })
      .filter(Boolean);
    
    return categoryNames.length > 0 ? categoryNames.join(', ') : 'None';
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  if (users.length === 0) {
    return (
      <EmptyState
        icon={MdPerson}
        title="No users found"
        message="No users match your search criteria. Try adjusting your filters."
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className={`rounded-lg shadow-sm border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                User
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Role
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Position
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Categories
              </th>
              <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Status
              </th>
              <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {currentUsers.map(user => (
              <UserRow
                key={user.user_id}
                user={user}
                role={roles.find(r => r.role_id === parseInt(user.role_id))}
                position={positions.find(p => p.position_id === parseInt(user.position_id))}
                categories={categories}
                onEdit={() => onEdit(user)}
                onDelete={() => onDelete(user)}
                isDarkMode={isDarkMode}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={`lg:hidden divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
        {currentUsers.map(user => (
          <div key={user.user_id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                  }`}>
                    <MdPerson className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.username}
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ID: {user.user_id}
                    </p>
                  </div>
                </div>
                {user.email && (
                  <p className={`text-xs mt-2 ml-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    📧 {user.email}
                  </p>
                )}
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.status === 'active'
                  ? isDarkMode 
                    ? 'bg-green-900/50 text-green-300' 
                    : 'bg-green-100 text-green-800'
                  : isDarkMode 
                    ? 'bg-red-900/50 text-red-300' 
                    : 'bg-red-100 text-red-800'
              }`}>
                {user.status === 'active' ? <MdCheck size={12} className="mr-1" /> : <MdClose size={12} className="mr-1" />}
                {user.status}
              </span>
            </div>

            <div className={`space-y-2 mb-3 p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Role:
                </span>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {getRoleName(user.role_id)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                }`}>
                  ID: {user.role_id}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Position:
                </span>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {getPositionName(user.position_id)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                }`}>
                  ID: {user.position_id}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className={`text-xs font-semibold ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Categories:
                </span>
                <span className={`text-sm flex-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {getCategoryNames(user.assigned_category_ids)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(user)}
                className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <MdEdit size={16} />
                Edit
              </button>
              <button
                onClick={() => onDelete(user)}
                className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isDarkMode 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                <MdDelete size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            isDarkMode={isDarkMode}
          />
        </div>
      )}
    </div>
  );
};

export default UserList;