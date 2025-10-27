// components/user/CustomFieldsManager.jsx - Custom Fields Management

import React, { useState } from 'react';
import { MdAdd, MdEdit, MdDelete, MdSave, MdCancel } from 'react-icons/md';
import { FIELD_TYPES } from '../../utils/constants';

const CustomFieldsManager = ({ userFields, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    field_name: '',
    field_type: FIELD_TYPES.TEXT,
    is_required: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.field_name.trim()) {
      alert('Field name is required');
      return;
    }

    if (editingField) {
      await onUpdate(editingField.user_field_id, formData);
      setEditingField(null);
    } else {
      await onAdd(formData);
      setIsAdding(false);
    }

    setFormData({
      field_name: '',
      field_type: FIELD_TYPES.TEXT,
      is_required: false
    });
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setFormData({
      field_name: field.field_name,
      field_type: field.field_type,
      is_required: field.is_required
    });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingField(null);
    setFormData({
      field_name: '',
      field_type: FIELD_TYPES.TEXT,
      is_required: false
    });
  };

  const handleDelete = async (fieldId) => {
    if (window.confirm('Are you sure you want to delete this field? All associated data will be lost.')) {
      await onDelete(fieldId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Custom User Fields
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Define additional fields to capture custom user information
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <MdAdd size={18} />
            Add Field
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.field_name}
                  onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Phone Number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field Type
                </label>
                <select
                  value={formData.field_type}
                  onChange={(e) => setFormData({ ...formData, field_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={FIELD_TYPES.TEXT}>Text</option>
                  <option value={FIELD_TYPES.TEXTAREA}>Text Area</option>
                  <option value={FIELD_TYPES.NUMBER}>Number</option>
                  <option value={FIELD_TYPES.EMAIL}>Email</option>
                  <option value={FIELD_TYPES.DATE}>Date</option>
                  <option value={FIELD_TYPES.CHECKBOX}>Checkbox</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_required}
                    onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Required Field
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium flex items-center gap-2"
              >
                <MdCancel size={16} />
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <MdSave size={16} />
                {editingField ? 'Update Field' : 'Add Field'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fields List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {userFields.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No custom fields defined yet. Click "Add Field" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Field Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Field Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Required
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {userFields.map((field) => (
                  <tr key={field.user_field_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {field.field_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {field.field_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {field.is_required ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                          Required
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(field)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit Field"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(field.user_field_id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Field"
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
  );
};

export default CustomFieldsManager;