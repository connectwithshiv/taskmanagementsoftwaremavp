import React from 'react';
import { MdSearch, MdFilterList, MdClose } from 'react-icons/md';
import { SEARCH_TYPE_OPTIONS, STATUS_OPTIONS, SORT_OPTIONS } from '../../utils/constants';

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  filters, 
  onFilterChange, 
  sortBy, 
  onSortChange, 
  showAdvanced, 
  onToggleAdvanced,
  onReset,
  isDarkMode 
}) => {
  return (
    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search categories..."
            className={`w-full pl-10 pr-3 py-2 text-sm rounded border ${
              isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300 placeholder-slate-500'
            }`}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onToggleAdvanced}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${
              showAdvanced 
                ? 'bg-blue-600 text-white' 
                : isDarkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
            }`}
          >
            <MdFilterList size={16} />
            Filters
          </button>
          <button
            onClick={onReset}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${
              isDarkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
            }`}
          >
            <MdClose size={16} />
            Reset
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className={`space-y-3 p-3 rounded border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
            <div>
              <label className={`text-xs font-medium block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Search Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
                className={`w-full px-2 py-1.5 text-sm rounded border ${
                  isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300'
                }`}
              >
                {SEARCH_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`text-xs font-medium block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Status Filter
              </label>
              <select
                value={filters.status}
                onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                className={`w-full px-2 py-1.5 text-sm rounded border ${
                  isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300'
                }`}
              >
                <option value="all">All Status</option>
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`text-xs font-medium block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className={`w-full px-2 py-1.5 text-sm rounded border ${
                  isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300'
                }`}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;