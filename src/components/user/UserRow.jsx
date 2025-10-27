// components/user/UserRow.jsx - FIXED Individual User Row Component

import React from 'react';
import { MdEdit, MdDelete, MdPerson, MdCheck, MdClose, MdFolder } from 'react-icons/md';

const UserRow = ({ 
  user, 
  role, 
  position, 
  categories = [],
  onEdit, 
  onDelete,
  isDarkMode = false
}) => {
  // Get category display text
  const getCategoryDisplay = () => {
    if (!user.assigned_category_ids || user.assigned_category_ids.length === 0) {
      return <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>None</span>;
    }

    const categoryIds = Array.isArray(user.assigned_category_ids) 
      ? user.assigned_category_ids 
      : [user.assigned_category_ids];

    // Check if user has access to all categories
    if (categoryIds.includes('all')) {
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
        }`}>
          All Categories
        </span>
      );
    }

    // Show first 2 categories + count
    const categoryNames = categoryIds
      .slice(0, 2)
      .map(id => {
        const category = categories.find(cat => cat.id === id);
        return category ? category.name : id;
      });

    const remaining = categoryIds.length - 2;

    return (
      <div className="flex flex-wrap gap-1">
        {categoryNames.map((name, idx) => (
          <span 
            key={idx}
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
            }`}
          >
            <MdFolder size={12} className="mr-1" />
            {name}
          </span>
        ))}
        {remaining > 0 && (
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}>
            +{remaining} more
          </span>
        )}
      </div>
    );
  };

  return (
    <tr className={`hover:bg-opacity-50 transition-colors ${
      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
    }`}>
      {/* User Info */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
          }`}>
            <MdPerson className="text-white" size={20} />
          </div>
          <div className="ml-3">
            <div className={`text-sm font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {user.username}
            </div>
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {user.email || `ID: ${user.user_id}`}
            </div>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {role ? role.role_name : `Role ID: ${user.role_id}`}
          </span>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            ID: {user.role_id}
          </span>
        </div>
      </td>

      {/* Position */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {position ? position.position_name : `Position ID: ${user.position_id}`}
          </span>
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            ID: {user.position_id}
          </span>
        </div>
      </td>

      {/* Categories */}
      <td className="px-6 py-4">
        {getCategoryDisplay()}
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.status === 'active'
            ? isDarkMode 
              ? 'bg-green-900/50 text-green-300' 
              : 'bg-green-100 text-green-800'
            : isDarkMode 
              ? 'bg-red-900/50 text-red-300' 
              : 'bg-red-100 text-red-800'
        }`}>
          {user.status === 'active' ? (
            <>
              <MdCheck size={14} className="mr-1" />
              Active
            </>
          ) : (
            <>
              <MdClose size={14} className="mr-1" />
              Inactive
            </>
          )}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onEdit}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'text-blue-400 hover:bg-blue-900/30'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
            title="Edit User"
          >
            <MdEdit size={18} />
          </button>
          <button
            onClick={onDelete}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'text-red-400 hover:bg-red-900/30'
                : 'text-red-600 hover:bg-red-50'
            }`}
            title="Delete User"
          >
            <MdDelete size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserRow;