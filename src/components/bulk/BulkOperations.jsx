import React, { useState } from 'react';
import { MdSelectAll, MdClose } from 'react-icons/md';
import { STATUS_OPTIONS } from '../../utils/constants';

const BulkOperations = ({ 
  selectedCount, 
  onSelectAll, 
  onStatusChange, 
  onAddTags, 
  onDelete,
  onClose,
  isDarkMode 
}) => {
  const [bulkStatus, setBulkStatus] = useState('active');
  const [bulkTags, setBulkTags] = useState('');

  const handleStatusChange = () => {
    if (selectedCount === 0) {
      alert('Please select categories first');
      return;
    }
    onStatusChange(bulkStatus);
  };

  const handleAddTags = () => {
    if (selectedCount === 0) {
      alert('Please select categories first');
      return;
    }
    const tags = bulkTags.split(',').map(t => t.trim()).filter(t => t);
    if (tags.length === 0) {
      alert('Please enter tags');
      return;
    }
    onAddTags(tags);
    setBulkTags('');
  };

  const handleDelete = () => {
    if (selectedCount === 0) {
      alert('Please select categories first');
      return;
    }
    if (!window.confirm(`Delete ${selectedCount} selected categories?`)) return;
    onDelete();
  };

  return (
    <div className={`p-6 rounded-xl border ${
      isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Bulk Operations ({selectedCount} selected)
        </h2>
        <button
          onClick={onClose}
          className={isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-gray-900'}
        >
          <MdClose size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Select All */}
        <button
          onClick={onSelectAll}
          className={`text-sm flex items-center gap-2 ${
            isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'
          }`}
        >
          <MdSelectAll size={16} />
          Select / Deselect All
        </button>

        {/* Change Status */}
        <div>
          <label className={`text-sm block mb-2 font-medium ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Change Status
          </label>
          <div className="flex gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className={`flex-1 px-3 py-2 rounded text-sm ${
                isDarkMode ? 'bg-slate-700 border border-slate-600 text-white' : 'bg-white border border-slate-300'
              }`}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleStatusChange}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            >
              Update
            </button>
          </div>
        </div>

        {/* Add Tags */}
        <div>
          <label className={`text-sm block mb-2 font-medium ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Add Tags
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={bulkTags}
              onChange={(e) => setBulkTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className={`flex-1 px-3 py-2 rounded text-sm ${
                isDarkMode ? 'bg-slate-700 border border-slate-600 text-white' : 'bg-white border border-slate-300'
              }`}
            />
            <button
              onClick={handleAddTags}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
        >
          Delete Selected
        </button>
      </div>
    </div>
  );
};

export default BulkOperations;