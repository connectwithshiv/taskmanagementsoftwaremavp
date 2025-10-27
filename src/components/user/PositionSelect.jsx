// components/user/PositionSelect.jsx - Position Selector Component

import React from 'react';

const PositionSelect = ({ 
  value, 
  onChange, 
  positions = [], 
  required = false, 
  error = null,
  className = '' 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Position {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      >
        <option value="">Select Position</option>
        {positions.map(position => (
          <option key={position.position_id} value={position.position_id}>
            {position.position_name}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default PositionSelect;