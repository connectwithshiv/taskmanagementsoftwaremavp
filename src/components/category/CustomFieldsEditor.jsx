// components/category/CustomFieldsEditor.jsx - Custom Fields Management for Categories

import React, { useState } from 'react';
import { MdAdd, MdEdit, MdDelete, MdSave, MdCancel } from 'react-icons/md';
import { FIELD_TYPES } from '../../utils/constants';

const CustomFieldsEditor = ({ userFields = [], onAdd, onUpdate, onDelete, isDarkMode = false }) => {
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
    setFormData({ field_name: '', field_type: FIELD_TYPES.TEXT, is_required: false });
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setFormData({ field_name: field.field_name, field_type: field.field_type, is_required: field.is_required });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingField(null);
    setFormData({ field_name: '', field_type: FIELD_TYPES.TEXT, is_required: false });
  };

  const handleDelete = async (fieldId) => {
    if (window.confirm('Delete this field? All associated values will be removed.')) {
      await onDelete(fieldId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Custom Category Fields</h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Define additional fields for categories</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
            <MdAdd size={18} /> Add Field
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className={`border rounded-lg p-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Field Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.field_name}
                  onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="e.g., Display Code"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Field Type</label>
                <select
                  value={formData.field_type}
                  onChange={(e) => setFormData({ ...formData, field_type: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
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
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Required Field</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={handleCancel} className={`px-4 py-2 border rounded-lg font-medium flex items-center gap-2 ${isDarkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>
                <MdCancel size={16} /> Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                <MdSave size={16} /> {editingField ? 'Update Field' : 'Add Field'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fields List */}
      <div className={`rounded-lg shadow-sm border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {userFields.length === 0 ? (
          <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No custom fields defined yet. Click "Add Field" to create one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Field Name</th>
                  <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Field Type</th>
                  <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Required</th>
                  <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {userFields.map((field) => (
                  <tr key={field.user_field_id} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{field.field_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>{field.field_type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {field.is_required ? (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'}`}>Required</span>
                      ) : (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>Optional</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(field)} className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`} title="Edit Field"><MdEdit size={18} /></button>
                        <button onClick={() => handleDelete(field.user_field_id)} className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`} title="Delete Field"><MdDelete size={18} /></button>
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

export default CustomFieldsEditor;