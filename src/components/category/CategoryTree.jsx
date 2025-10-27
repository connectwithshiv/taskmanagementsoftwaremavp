import React, { useState } from 'react';
import { 
  MdExpandMore, 
  MdChevronRight, 
  MdEdit, 
  MdDelete, 
  MdContentCopy, 
  MdAdd, 
  MdFolder,
  MdArrowBack,
  MdArrowForward
} from 'react-icons/md';
import { CategoryService } from '../../services/categoryService';

const CategoryTree = ({ 
  categories, 
  parentId = null, 
  level = 0, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onAddChild,
  onMoveOrder,
  onMoveLevel,
  selectedCategories, 
  onToggleSelect,
  filteredIds,
  isDarkMode 
}) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  
  const children = CategoryService.getChildrenByParentId(categories, parentId);

  if (children.length === 0) return null;

  const toggleExpand = (id) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={level > 0 ? `ml-8 border-l-2 pl-4 mt-2 ${
      isDarkMode ? 'border-slate-600' : 'border-slate-300'
    }` : ''}>
      {children.map(cat => {
        const childCategories = CategoryService.getChildrenByParentId(categories, cat.id);
        const hasChildren = childCategories.length > 0;
        const isMatched = !filteredIds || filteredIds.has(cat.id);
        const hasMatchedChildren = hasChildren && filteredIds && childCategories.some(child => filteredIds.has(child.id));
        const shouldShow = !filteredIds || isMatched || hasMatchedChildren;
        const isExpanded = expandedCategories[cat.id];

        if (!shouldShow) return null;

        return (
          <div key={cat.id} className="mb-3">
            <div className={`border rounded-lg p-3 transition ${
              isDarkMode ? 'border-slate-600 bg-slate-800 hover:border-slate-500' : 'border-slate-300 bg-white hover:border-slate-400'
            }`}>
              <div className="flex items-center gap-3 justify-between flex-wrap">
                {/* Left Section */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(cat.id)}
                    onChange={() => onToggleSelect(cat.id)}
                    className="w-4 h-4"
                  />

                  {/* Expand/Collapse */}
                  {hasChildren && (
                    <button
                      onClick={() => toggleExpand(cat.id)}
                      className={isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'}
                    >
                      {isExpanded || (isMatched && hasMatchedChildren) ? (
                        <MdExpandMore size={18} />
                      ) : (
                        <MdChevronRight size={18} />
                      )}
                    </button>
                  )}
                  {!hasChildren && <div className="w-5"></div>}

                  {/* Folder Icon */}
                  <MdFolder size={18} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />

                  {/* Category Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {cat.name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {cat.categoryId}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        cat.status === 'active' 
                          ? isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                          : isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {cat.status}
                      </span>
                      {cat.fields && cat.fields.length > 0 && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {cat.fields.length} fields
                        </span>
                      )}
                    </div>
                    {cat.description && (
                      <p className={`text-xs mt-1 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Move Up/Down */}
                  <button
                    onClick={() => onMoveOrder(cat.id, 'up')}
                    className={`p-1.5 rounded flex items-center gap-1 ${
                      isDarkMode ? 'text-blue-400 hover:bg-blue-900' : 'text-blue-600 hover:bg-blue-100'
                    }`}
                    title="Move Up"
                  >
                    <MdArrowBack size={14} style={{transform: 'rotate(90deg)'}} />
                  </button>
                  <button
                    onClick={() => onMoveOrder(cat.id, 'down')}
                    className={`p-1.5 rounded flex items-center gap-1 ${
                      isDarkMode ? 'text-blue-400 hover:bg-blue-900' : 'text-blue-600 hover:bg-blue-100'
                    }`}
                    title="Move Down"
                  >
                    <MdArrowForward size={14} style={{transform: 'rotate(90deg)'}} />
                  </button>

                  {/* Outdent/Indent */}
                  <button
                    onClick={() => onMoveLevel(cat.id, 'left')}
                    disabled={!cat.parentId}
                    className={`p-1.5 rounded disabled:opacity-50 ${
                      isDarkMode ? 'text-orange-400 hover:bg-orange-900' : 'text-orange-600 hover:bg-orange-100'
                    }`}
                    title="Outdent"
                  >
                    <MdArrowBack size={14} />
                  </button>
                  <button
                    onClick={() => onMoveLevel(cat.id, 'right')}
                    className={`p-1.5 rounded ${
                      isDarkMode ? 'text-orange-400 hover:bg-orange-900' : 'text-orange-600 hover:bg-orange-100'
                    }`}
                    title="Indent"
                  >
                    <MdArrowForward size={14} />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => onEdit(cat)}
                    className={`p-1.5 rounded ${
                      isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Edit"
                  >
                    <MdEdit size={14} />
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={() => onDuplicate(cat.id)}
                    className={`p-1.5 rounded ${
                      isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Duplicate"
                  >
                    <MdContentCopy size={14} />
                  </button>

                  {/* Add Child */}
                  <button
                    onClick={() => onAddChild(cat.id)}
                    className={`p-1.5 rounded ${
                      isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Add Child"
                  >
                    <MdAdd size={14} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDelete(cat.id)}
                    className={`p-1.5 rounded ${
                      isDarkMode ? 'text-red-400 hover:bg-red-900' : 'text-red-600 hover:bg-red-100'
                    }`}
                    title="Delete"
                  >
                    <MdDelete size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Render Children */}
            {hasChildren && (isExpanded || (isMatched && hasMatchedChildren)) && (
              <CategoryTree
                categories={categories}
                parentId={cat.id}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onAddChild={onAddChild}
                onMoveOrder={onMoveOrder}
                onMoveLevel={onMoveLevel}
                selectedCategories={selectedCategories}
                onToggleSelect={onToggleSelect}
                filteredIds={filteredIds}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryTree;