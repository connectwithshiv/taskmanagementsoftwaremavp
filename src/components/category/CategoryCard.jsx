import React from 'react';
import { MdFolder, MdEdit, MdDelete } from 'react-icons/md';

const CategoryCard = ({ category, onEdit, onDelete, isDarkMode }) => {
  return (
    <div className={`p-4 rounded-lg border ${
      isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-300 hover:border-slate-400'
    } transition-all`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <MdFolder className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} size={24} />
          <div className="flex-1">
            <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {category.name}
            </h4>
            {category.description && (
              <p className={`text-sm mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {category.description}
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded ${
                isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
              }`}>
                {category.categoryId}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                category.status === 'active'
                  ? isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                  : isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}>
                {category.status}
              </span>
              {category.fields?.length > 0 && (
                <span className={`text-xs px-2 py-1 rounded ${
                  isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
                }`}>
                  {category.fields.length} fields
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(category)}
            className={`p-2 rounded ${
              isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MdEdit size={16} />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className={`p-2 rounded ${
              isDarkMode ? 'text-red-400 hover:bg-red-900' : 'text-red-600 hover:bg-red-100'
            }`}
          >
            <MdDelete size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;