import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { EmptyState } from '../shared/EmptyState';
import { formatDate } from '../../utils/formatters';

export const CategoryList = ({ categories, onEdit, onDelete, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cat.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || cat.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [categories, searchTerm, filterStatus]);

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card title="Categories List">
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {filteredCategories.length === 0 ? (
          <EmptyState title="No Categories" description="Create your first category to get started" />
        ) : (
          <div className="space-y-2">
            {filteredCategories.map(category => (
              <div key={category.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div 
                  className="p-4 flex justify-between items-center hover:bg-slate-50 cursor-pointer"
                  onClick={() => toggleExpand(category.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <ChevronDown 
                      size={18} 
                      style={{ 
                        transform: expandedIds[category.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }} 
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{category.name}</h4>
                      <p className="text-sm text-slate-600">{category.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <Badge variant={category.status === 'active' ? 'success' : 'warning'}>
                      {category.status}
                    </Badge>
                    {category.fields?.length > 0 && (
                      <Badge variant="info">{category.fields.length} fields</Badge>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEdit(category.id)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDelete(category.id)}
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </Button>
                  </div>
                </div>

                {expandedIds[category.id] && (
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-600">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Created:</strong> {formatDate(category.createdAt)}
                      </div>
                      <div>
                        <strong>Modified:</strong> {formatDate(category.modifiedAt)}
                      </div>
                      {category.fields?.length > 0 && (
                        <div className="col-span-2">
                          <strong>Fields:</strong> {category.fields.map(f => f.name).join(', ')}
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
    </Card>
  );
};