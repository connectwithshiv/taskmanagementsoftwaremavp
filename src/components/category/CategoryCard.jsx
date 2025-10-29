import React from 'react';
import { MdFolder, MdEdit, MdDelete, MdContentCopy, MdAdd } from 'react-icons/md';

const CategoryCard = ({ 
  category, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onAddChild, 
  isDarkMode 
}) => {
  const fieldsCount = category.fields?.length || 0;
  const created = category.createdAt ? new Date(category.createdAt).toLocaleDateString() : null;
  const modified = category.modifiedAt ? new Date(category.modifiedAt).toLocaleDateString() : null;

  return (
    <div
      className={`group p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl ${
        isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
      role="article"
      aria-label={category.name}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: icon + text */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <MdFolder className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`font-semibold mb-1 truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{category.name}</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                isDarkMode ? 'bg-slate-900/60 text-slate-300 border-slate-600' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                {category.categoryId}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                category.status === 'active'
                  ? isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                  : isDarkMode ? 'bg-gray-900/50 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}>
                {category.status}
              </span>
              {fieldsCount > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isDarkMode ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-700'
                }`}>
                  {fieldsCount} fields
                </span>
              )}
            </div>

            {category.description && (
              <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{category.description}</p>
            )}

            {/* Meta line */}
            <div className="flex flex-wrap gap-3 text-xs">
              {created && (
                <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Created: <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{created}</span></span>
              )}
              {modified && (
                <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Modified: <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{modified}</span></span>
              )}
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit && onEdit(category)}
            className={`p-2 rounded transition-all ${isDarkMode ? 'text-blue-300 hover:bg-blue-900/30' : 'text-blue-600 hover:bg-blue-50'}`}
            title="Edit"
            aria-label="Edit category"
          >
            <MdEdit size={16} />
          </button>
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(category.id)}
              className={`p-2 rounded transition-all ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
              title="Duplicate"
              aria-label="Duplicate category"
            >
              <MdContentCopy size={16} />
            </button>
          )}
          {onAddChild && (
            <button
              onClick={() => onAddChild(category.id)}
              className={`p-2 rounded transition-all ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
              title="Add child"
              aria-label="Add child category"
            >
              <MdAdd size={16} />
            </button>
          )}
          <button
            onClick={() => onDelete && onDelete(category.id)}
            className={`p-2 rounded transition-all ${isDarkMode ? 'text-red-300 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
            title="Delete"
            aria-label="Delete category"
          >
            <MdDelete size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;