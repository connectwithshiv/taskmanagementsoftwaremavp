import React from 'react';
import { ChevronRight, Folder } from 'lucide-react';

// categories: flat list with id, parentId, name
// rootIds: optional array to render multiple roots; otherwise compute
const CategoryHierarchy = ({ categories = [], rootIds = null, isDarkMode = false }) => {
  const getChildren = (pid) => categories.filter(c => c.parentId === pid);
  const roots = rootIds ?? categories.filter(c => !c.parentId).map(c => c.id);

  const Node = ({ id, level }) => {
    const node = categories.find(c => c.id === id);
    if (!node) return null;
    const children = getChildren(id);

    return (
      <div className={`rounded-xl border p-3 ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${isDarkMode ? 'bg-blue-900/40' : 'bg-blue-50'}`}>
            <Folder size={16} className={isDarkMode ? 'text-blue-300' : 'text-blue-600'} />
          </div>
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <div className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{node.name}</div>
            <div className={`text-xs px-2 py-0.5 rounded ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>Level {level}</div>
          </div>
        </div>
        {children.length > 0 && (
          <div className={`mt-3 pl-3 border-l ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className={`flex items-center gap-2 mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <ChevronRight size={14} />
              <span className="text-xs">Children</span>
            </div>
            <div className="grid gap-2">
              {children.map(child => (
                <Node key={child.id} id={child.id} level={level + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid gap-3">
      {roots.map(rid => (
        <Node key={rid} id={rid} level={0} />
      ))}
    </div>
  );
};

export default CategoryHierarchy;
