// components/user/RoleSelect.jsx - Role Selector Component

import React from 'react';

const RoleSelect = ({ 
  value, 
  onChange, 
  roles = [], 
  required = false, 
  error = null,
  className = '' 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Role {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      >
        <option value="">Select Role</option>
        {roles.map(role => (
          <option key={role.role_id} value={role.role_id}>
            {role.role_name}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default RoleSelect;