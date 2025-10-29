import React from 'react';
import { Edit2, Trash2, Folder } from 'lucide-react';

const CategoryRow = ({ category, onEdit, onDelete, isDarkMode = false }) => {
  const fieldsCount = category.fields?.length || 0;
  const created = category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '-';
  const modified = category.modifiedAt ? new Date(category.modifiedAt).toLocaleDateString() : '-';

  return (
    <tr className={`group transition-colors ${
      isDarkMode ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'
    }`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded ${isDarkMode ? 'bg-blue-900/40' : 'bg-blue-50'}`}>
            <Folder size={16} className={isDarkMode ? 'text-blue-300' : 'text-blue-600'} />
          </div>
          <div className="min-w-0">
            <div className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{category.name}</div>
            {category.description && (
              <div className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{category.description}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`text-xs px-2 py-1 rounded ${
          isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
        }`}>{category.categoryId}</span>
      </td>
      <td className="px-6 py-4">
        <span className={`text-xs px-2 py-1 rounded ${
          category.status === 'active' 
            ? (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700')
            : (isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700')
        }`}>{category.status}</span>
      </td>
      <td className="px-6 py-4">
        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-800'}>{fieldsCount}</span>
      </td>
      <td className="px-6 py-4">
        <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{created}</div>
      </td>
      <td className="px-6 py-4">
        <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{modified}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(category)}
            className={`${isDarkMode ? 'text-blue-300 hover:bg-blue-900/30' : 'text-blue-600 hover:bg-blue-50'} p-2 rounded`}
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className={`${isDarkMode ? 'text-red-300 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'} p-2 rounded`}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CategoryRow;
