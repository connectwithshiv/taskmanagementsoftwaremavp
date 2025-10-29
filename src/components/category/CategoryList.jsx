import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { EmptyState } from '../shared/EmptyState';
import { formatDate } from '../../utils/formatters';

export const CategoryList = ({ categories, onEdit, onDelete, onRefresh, isDarkMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const name = (cat.name || '').toLowerCase();
      const desc = (cat.description || '').toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || cat.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [categories, searchTerm, filterStatus]);

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={`rounded-2xl shadow-xl border overflow-hidden ${
      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
              }`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
          {onRefresh && (
            <Button variant="ghost" onClick={onRefresh}>Refresh</Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="p-6">
        {filteredCategories.length === 0 ? (
          <EmptyState title="No Categories" description="Create your first category to get started" />
        ) : (
          <div className="space-y-3">
            {filteredCategories.map(category => (
              <div
                key={category.id}
                className={`group rounded-xl border transition-all ${
                  isDarkMode ? 'border-slate-700 hover:border-slate-600 bg-slate-800' : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`p-4 flex justify-between items-center cursor-pointer ${
                    isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => toggleExpand(category.id)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${expandedIds[category.id] ? 'rotate-180' : 'rotate-0'}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{category.name}</h4>
                      {category.description && (
                        <p className={`text-sm truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{category.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <Badge variant={category.status === 'active' ? 'success' : 'warning'}>{category.status}</Badge>
                    {category.fields?.length > 0 && (
                      <Badge variant="info">{category.fields.length} fields</Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => onEdit(category.id)}>
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(category.id)}>
                      <Trash2 size={16} className="text-red-600" />
                    </Button>
                  </div>
                </div>

                {expandedIds[category.id] && (
                  <div className={`px-4 py-3 text-sm border-t ${isDarkMode ? 'bg-slate-700/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><strong className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>Created:</strong> {formatDate(category.createdAt)}</div>
                      <div><strong className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>Modified:</strong> {formatDate(category.modifiedAt)}</div>
                      {category.fields?.length > 0 && (
                        <div className="md:col-span-2">
                          <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>Fields:</strong> {category.fields.map(f => f.name).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};