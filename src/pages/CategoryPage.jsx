import React, { useState, useEffect } from 'react';
import { 
  MdAdd, 
  MdFolder,
  MdBarChart,
  MdHistory,
  MdUpload,
  MdDownload,
  MdRestartAlt,
  MdDescription,
  MdEdit,
  MdList
} from 'react-icons/md';
import { StorageService } from '../services/storageService';
import { CategoryService } from '../services/categoryService';
import { generateUniqueId } from '../utils/helpers';
import CategoryForm from '../components/category/CategoryForm';
import CategoryTree from '../components/category/CategoryTree';
import SearchBar from '../components/common/SearchBar';
import StatsCard from '../components/common/StatsCard';
import BulkOperations from '../components/bulk/BulkOperations';
import ImportExport from '../components/bulk/ImportExport';
import ActivityLogs from '../components/logs/ActivityLogs';

const CategoryPage = ({ isDarkMode }) => {
  // ==================== STATE MANAGEMENT ====================
  const [data, setData] = useState({ categories: [], deletedLogs: [] });
  const [activeTab, setActiveTab] = useState('list');
  const [editingCategory, setEditingCategory] = useState(null);
  const [addingParentId, setAddingParentId] = useState(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [searchFilters, setSearchFilters] = useState({ type: 'name', status: 'all' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [selectedCategories, setSelectedCategories] = useState(new Set());

  // ==================== LOAD & SAVE ====================
  useEffect(() => {
    const loadedData = StorageService.load();
    setData(loadedData);
  }, []);

  useEffect(() => {
    if (data.categories.length > 0 || data.deletedLogs.length > 0) {
      StorageService.save(data);
    }
  }, [data]);

  // ==================== HELPER FUNCTIONS ====================
  const getCategoryById = (id) => data.categories.find(cat => cat.id === id);
  const getChildrenByParentId = (parentId) => data.categories.filter(cat => cat.parentId === parentId);
  
  const getAllDescendants = (categoryId) => {
    const descendants = [];
    const stack = [categoryId];
    while (stack.length > 0) {
      const id = stack.pop();
      const children = getChildrenByParentId(id);
      children.forEach(child => {
        descendants.push(child.id);
        stack.push(child.id);
      });
    }
    return descendants;
  };

  const regenerateCategoryIds = (categories) => {
    const updated = JSON.parse(JSON.stringify(categories));
    const updateIds = (parentId = null, prefix = '') => {
      const children = updated.filter(c => c.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name));
      children.forEach((child, index) => {
        const newId = parentId ? `${prefix}.${index + 1}` : `CAT${index + 1}`;
        const idx = updated.findIndex(c => c.id === child.id);
        if (idx !== -1) updated[idx].categoryId = newId;
        updateIds(child.id, newId);
      });
    };
    updateIds(null, '');
    return updated;
  };

  const generateId = (parentId = null) => {
    if (parentId) {
      const parent = data.categories.find(c => c.id === parentId);
      if (parent) {
        const childCount = data.categories.filter(c => c.parentId === parentId).length + 1;
        return `${parent.categoryId}.${childCount}`;
      }
    }
    const rootCount = data.categories.filter(c => c.parentId === null).length + 1;
    return `CAT${rootCount}`;
  };

  // ==================== CATEGORY OPERATIONS ====================
  const handleSaveCategory = (formData) => {
    try {
      const now = new Date().toISOString();

      // ✅ SAFE STRING EXTRACTION
      const getSafeString = (value) => {
        if (value === null || value === undefined) return '';
        return String(value).trim();
      };

      const categoryName = getSafeString(formData.name || formData.category_name);
      const categoryDescription = getSafeString(formData.description);
      
      // ✅ VALIDATE
      if (!categoryName) {
        alert('Category name is required');
        return;
      }
      if (!categoryDescription) {
        alert('Description is required');
        return;
      }

      // ✅ DETERMINE PARENT ID - Priority: addingParentId > formData.parentId > null
      // This is KEY: when adding a child, addingParentId should be used first
      let parentId = addingParentId || formData.parentId || formData.parent_category_id || null;
      
      // ✅ CALCULATE HIERARCHY LEVEL based on parent
      let hierarchyLevel = 0;
      if (parentId) {
        const parent = data.categories.find(c => c.id === parentId);
        if (parent) {
          // Child level = parent's level + 1
          hierarchyLevel = (parent.hierarchyLevel || parent.level || 0) + 1;
        }
      }
      // If no parent, it's a root category (level 0)

      console.log('✅ Parent ID:', parentId);
      console.log('✅ Hierarchy Level:', hierarchyLevel);
      console.log('✅ Adding Parent ID (from context):', addingParentId);

      if (editingCategory) {
        // UPDATE
        const updated = data.categories.map(cat =>
          cat.id === editingCategory.id
            ? {
                ...cat,
                ...formData,
                name: categoryName,
                description: categoryDescription,
                parentId: parentId,
                hierarchyLevel: hierarchyLevel,
                modifiedAt: now,
                logs: [...(cat.logs || []), { action: 'Modified', timestamp: now, details: 'Category updated' }]
              }
            : cat
        );
        let final = regenerateCategoryIds(updated);
        setData({ ...data, categories: final });
        setEditingCategory(null);
        setAddingParentId(null);
        setActiveTab('list');
        alert('✅ Category updated successfully');
      } else {
        // ADD NEW
        const newCategory = {
          id: generateUniqueId(),
          categoryId: generateId(parentId),
          name: categoryName,
          description: categoryDescription,
          parentId: parentId,
          hierarchyLevel: hierarchyLevel,
          fields: Array.isArray(formData.fields) ? formData.fields : [],
          fieldValues: (formData.fieldValues && typeof formData.fieldValues === 'object') ? formData.fieldValues : {},
          tags: Array.isArray(formData.tags) ? formData.tags : [],
          priority: formData.priority || 'medium',
          status: formData.status || 'active',
          createdAt: now,
          modifiedAt: now,
          logs: [{ action: 'Created', timestamp: now, details: 'Category created' }]
        };

        console.log('✅ New category object:', newCategory);
        
        let updated = [...data.categories, newCategory];
        updated = regenerateCategoryIds(updated);
        setData({ ...data, categories: updated });
        setAddingParentId(null);
        setActiveTab('list');
        alert('✅ Category added successfully');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const handleDeleteCategory = (id) => {
    const category = getCategoryById(id);
    const hasChildren = getChildrenByParentId(id).length > 0;

    if (hasChildren) {
      alert('Cannot delete category with children. Delete children first.');
      return;
    }

    if (!window.confirm(`Delete category "${category.name}"?`)) return;

    const now = new Date().toISOString();
    const deletedLog = {
      categoryId: category.categoryId,
      categoryName: category.name,
      action: 'Deleted',
      timestamp: now,
      details: 'Category deleted',
      categoryData: category
    };

    const updated = data.categories.filter(cat => cat.id !== id);
    let final = regenerateCategoryIds(updated);
    setData({
      categories: final,
      deletedLogs: [...(data.deletedLogs || []), deletedLog]
    });

    if (editingCategory?.id === id) {
      setEditingCategory(null);
      setActiveTab('list');
    }
  };

  const handleDuplicate = (categoryId) => {
    const category = getCategoryById(categoryId);
    if (!category) return;

    const now = new Date().toISOString();
    const duplicatedCategories = [];

    const duplicateRecursive = (cat, newParentId) => {
      const newId = generateUniqueId();
      const newCategoryId = generateId(newParentId);
      const duplicated = {
        id: newId,
        categoryId: newCategoryId,
        name: cat.name + ' (Copy)',
        description: cat.description,
        parentId: newParentId,
        fields: JSON.parse(JSON.stringify(cat.fields || [])),
        fieldValues: JSON.parse(JSON.stringify(cat.fieldValues || {})),
        tags: [...(cat.tags || [])],
        priority: cat.priority,
        status: cat.status,
        createdAt: now,
        modifiedAt: now,
        logs: [{ action: 'Duplicated', timestamp: now, details: `From "${cat.name}"` }]
      };
      duplicatedCategories.push(duplicated);

      const children = getChildrenByParentId(cat.id);
      children.forEach(child => duplicateRecursive(child, newId));
    };

    duplicateRecursive(category, category.parentId);
    let updated = [...data.categories, ...duplicatedCategories];
    updated = regenerateCategoryIds(updated);
    setData({ ...data, categories: updated });
  };

  // ==================== MOVE OPERATIONS ====================
  const handleMoveOrder = (categoryId, direction) => {
    const category = data.categories.find(c => c.id === categoryId);
    if (!category) return;

    const siblings = getChildrenByParentId(category.parentId).sort((a, b) => {
      const aIdx = data.categories.findIndex(c => c.id === a.id);
      const bIdx = data.categories.findIndex(c => c.id === b.id);
      return aIdx - bIdx;
    });

    const currentIndex = siblings.findIndex(c => c.id === categoryId);
    if (currentIndex === -1) return;

    let updated = JSON.parse(JSON.stringify(data.categories));

    if (direction === 'up' && currentIndex > 0) {
      const currentPos = updated.findIndex(c => c.id === categoryId);
      const prevSiblingId = siblings[currentIndex - 1].id;
      const prevPos = updated.findIndex(c => c.id === prevSiblingId);
      [updated[currentPos], updated[prevPos]] = [updated[prevPos], updated[currentPos]];
    } else if (direction === 'down' && currentIndex < siblings.length - 1) {
      const currentPos = updated.findIndex(c => c.id === categoryId);
      const nextSiblingId = siblings[currentIndex + 1].id;
      const nextPos = updated.findIndex(c => c.id === nextSiblingId);
      [updated[currentPos], updated[nextPos]] = [updated[nextPos], updated[currentPos]];
    }

    setData({ ...data, categories: updated });
  };

  const handleMoveLevel = (categoryId, direction) => {
    const category = data.categories.find(c => c.id === categoryId);
    if (!category) return;

    let newParentId = category.parentId;

    if (direction === 'right') {
      const siblings = getChildrenByParentId(category.parentId).sort((a, b) => {
        const aIdx = data.categories.findIndex(c => c.id === a.id);
        const bIdx = data.categories.findIndex(c => c.id === b.id);
        return aIdx - bIdx;
      });
      const currentIndex = siblings.findIndex(c => c.id === categoryId);
      if (currentIndex <= 0) return;
      newParentId = siblings[currentIndex - 1].id;
    } else if (direction === 'left') {
      if (!category.parentId) return;
      const parent = data.categories.find(c => c.id === category.parentId);
      newParentId = parent?.parentId || null;
    }

    const now = new Date().toISOString();
    let updated = data.categories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            parentId: newParentId,
            modifiedAt: now,
            logs: [...(cat.logs || []), { action: 'Moved', timestamp: now, details: direction === 'right' ? 'Indented' : 'Outdented' }]
          }
        : cat
    );
    updated = regenerateCategoryIds(updated);
    setData({ ...data, categories: updated });
  };

  const handleAddChild = (parentId) => {
    setAddingParentId(parentId);
    setEditingCategory(null);
    setActiveTab('add');
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setAddingParentId(null);
    setActiveTab('edit');
  };

  // ==================== SELECTION ====================
  const toggleSelectCategory = (id) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedCategories(newSet);
  };

  const handleSelectAll = () => {
    if (selectedCategories.size === data.categories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(data.categories.map(c => c.id)));
    }
  };

  // ==================== BULK OPERATIONS ====================
  const handleBulkStatusChange = (status) => {
    const now = new Date().toISOString();
    const updated = data.categories.map(cat => {
      if (selectedCategories.has(cat.id)) {
        return {
          ...cat,
          status,
          modifiedAt: now,
          logs: [...(cat.logs || []), { action: 'Bulk Edit', timestamp: now, details: `Status: ${status}` }]
        };
      }
      return cat;
    });
    setData({ ...data, categories: updated });
    setSelectedCategories(new Set());
  };

  const handleBulkAddTags = (tags) => {
    const now = new Date().toISOString();
    const updated = data.categories.map(cat => {
      if (selectedCategories.has(cat.id)) {
        const combinedTags = [...new Set([...(cat.tags || []), ...tags])];
        return {
          ...cat,
          tags: combinedTags,
          modifiedAt: now,
          logs: [...(cat.logs || []), { action: 'Tags Added', timestamp: now, details: `Added: ${tags.join(', ')}` }]
        };
      }
      return cat;
    });
    setData({ ...data, categories: updated });
  };

  const handleBulkDelete = () => {
    const now = new Date().toISOString();
    const deletedCategories = data.categories.filter(cat => selectedCategories.has(cat.id));

    const newDeletedLogs = deletedCategories.map(cat => ({
      categoryId: cat.categoryId,
      categoryName: cat.name,
      action: 'Deleted',
      timestamp: now,
      details: 'Bulk deleted',
      categoryData: cat
    }));

    let updated = data.categories.filter(cat => !selectedCategories.has(cat.id));
    updated = regenerateCategoryIds(updated);

    setData({
      categories: updated,
      deletedLogs: [...(data.deletedLogs || []), ...newDeletedLogs]
    });
    setSelectedCategories(new Set());
  };

  // ==================== IMPORT ====================
  const handleImport = (importedCategories) => {
    let updated = [...data.categories, ...importedCategories];
    updated = regenerateCategoryIds(updated);
    setData({ ...data, categories: updated });
  };

  // ==================== SEARCH ====================
  const searchCategories = () => {
    let results = data.categories;

    if (categorySearch.trim()) {
      const query = categorySearch.toLowerCase();
      const matchedIds = new Set();

      data.categories.forEach(cat => {
        let matches = false;
        if (searchFilters.type === 'name') {
          matches = cat.name.toLowerCase().includes(query);
        } else if (searchFilters.type === 'id') {
          matches = cat.categoryId.toLowerCase().includes(query);
        } else if (searchFilters.type === 'tags') {
          matches = cat.tags?.some(tag => tag.toLowerCase().includes(query));
        }

        if (matches) {
          matchedIds.add(cat.id);
          let currentParentId = cat.parentId;
          while (currentParentId) {
            matchedIds.add(currentParentId);
            const parent = getCategoryById(currentParentId);
            currentParentId = parent?.parentId || null;
          }
          getAllDescendants(cat.id).forEach(id => matchedIds.add(id));
        }
      });

      results = results.filter(cat => matchedIds.has(cat.id));
    }

    if (searchFilters.status !== 'all') {
      results = results.filter(cat => cat.status === searchFilters.status);
    }

    return results.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'priority') {
        const pMap = { high: 0, medium: 1, low: 2 };
        return pMap[a.priority] - pMap[b.priority];
      }
      return 0;
    });
  };

  const searchResults = searchCategories();
  const filteredIds = categorySearch.trim() || searchFilters.status !== 'all' 
    ? new Set(searchResults.map(c => c.id)) 
    : null;

  // ==================== STATISTICS ====================
  const stats = {
    total: data.categories.length,
    active: data.categories.filter(c => c.status === 'active').length,
    highPriority: data.categories.filter(c => c.priority === 'high').length,
    withFields: data.categories.filter(c => c.fields?.length > 0).length
  };

  // ==================== TAB CONFIGURATION ====================
  const tabs = [
    { id: 'list', label: 'Category List', icon: MdList },
    { id: 'add', label: 'Add Category', icon: MdAdd },
    { id: 'edit', label: 'Edit Category', icon: MdEdit, hidden: !editingCategory },
    { id: 'bulk', label: 'Bulk Operations', icon: MdUpload },
    { id: 'import', label: 'Import/Export', icon: MdDownload },
    { id: 'logs', label: 'Activity Logs', icon: MdHistory },
    { id: 'stats', label: 'Statistics', icon: MdBarChart }
  ];

  // ==================== RENDER ====================
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Product Service Categories
            </h2>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Manage hierarchical categories - {data.categories.length} total categories
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Clear all data? This cannot be undone!')) {
                StorageService.clear();
                setData({ categories: [], deletedLogs: [] });
                setSelectedCategories(new Set());
                setActiveTab('list');
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              isDarkMode ? 'bg-red-900 text-red-300 hover:bg-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            <MdRestartAlt size={18} />
            Clear All
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex gap-1 overflow-x-auto">
            {tabs.filter(tab => !tab.hidden).map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'add') {
                      setEditingCategory(null);
                      // Reset addingParentId when manually clicking Add tab
                      if (activeTab !== 'list') {
                        setAddingParentId(null);
                      }
                    }
                  }}
                  className={`flex items-center gap-2 px-5 py-3 font-medium transition border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? isDarkMode
                        ? 'border-blue-500 text-blue-400 bg-slate-800/50'
                        : 'border-blue-600 text-blue-600 bg-blue-50'
                      : isDarkMode
                      ? 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {tab.id === 'list' && selectedCategories.size > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                      {selectedCategories.size}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="mt-6">
        {/* CATEGORY LIST TAB */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            <SearchBar
              searchQuery={categorySearch}
              onSearchChange={setCategorySearch}
              filters={searchFilters}
              onFilterChange={setSearchFilters}
              sortBy={sortBy}
              onSortChange={setSortBy}
              showAdvanced={showAdvancedFilters}
              onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
              onReset={() => {
                setCategorySearch('');
                setSearchFilters({ type: 'name', status: 'all' });
                setSortBy('name');
              }}
              isDarkMode={isDarkMode}
            />

            <div className={`rounded-xl border ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <div className={`p-5 border-b ${
                isDarkMode ? 'border-slate-700' : 'border-slate-200'
              }`}>
                <div className="flex justify-between items-center">
                  <h3 className={`font-bold flex items-center gap-2 text-lg ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <MdFolder size={20} />
                    Categories {filteredIds && `(${searchResults.length} found)`}
                  </h3>
                  {selectedCategories.size > 0 && (
                    <button
                      onClick={handleSelectAll}
                      className={`text-sm px-4 py-2 rounded-lg font-medium ${
                        isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                      }`}
                    >
                      {selectedCategories.size === data.categories.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5 min-h-[500px]">
                {data.categories.length === 0 ? (
                  <div className={`text-center py-16 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    <MdFolder size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="font-semibold text-lg mb-2">No categories yet</p>
                    <p className="text-sm mb-4">Get started by creating your first category</p>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      <MdAdd className="inline mr-2" size={18} />
                      Create First Category
                    </button>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className={`text-center py-16 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    <MdFolder size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="font-semibold text-lg mb-2">No categories found</p>
                    <p className="text-sm">Try adjusting your search filters</p>
                  </div>
                ) : (
                  <CategoryTree
                    categories={data.categories}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                    onDuplicate={handleDuplicate}
                    onAddChild={handleAddChild}
                    onMoveOrder={handleMoveOrder}
                    onMoveLevel={handleMoveLevel}
                    selectedCategories={selectedCategories}
                    onToggleSelect={toggleSelectCategory}
                    filteredIds={filteredIds}
                    isDarkMode={isDarkMode}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ADD CATEGORY TAB - EXACT FROM ORIGINAL */}
        {activeTab === 'add' && (
          <div className={`rounded-xl border max-w-5xl mx-auto ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {addingParentId ? 'Add Child Category' : 'Add New Category'}
              </h3>
              {addingParentId && (
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Parent: {getCategoryById(addingParentId)?.name}
                </p>
              )}
            </div>
            <div className="p-6">
              <CategoryForm
                category={null}
                onSave={handleSaveCategory}
                onCancel={() => {
                  setAddingParentId(null);
                  setActiveTab('list');
                }}
                categories={data.categories}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        )}

        {/* EDIT CATEGORY TAB */}
        {activeTab === 'edit' && editingCategory && (
          <div className={`rounded-xl border max-w-5xl mx-auto ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Edit Category: {editingCategory.name}
              </h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                ID: {editingCategory.categoryId}
              </p>
            </div>
            <div className="p-6">
              <CategoryForm
                category={editingCategory}
                onSave={handleSaveCategory}
                onCancel={() => {
                  setEditingCategory(null);
                  setActiveTab('list');
                }}
                categories={data.categories}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        )}

        {/* BULK OPERATIONS TAB */}
        {activeTab === 'bulk' && (
          <BulkOperations
            selectedCount={selectedCategories.size}
            onSelectAll={handleSelectAll}
            onStatusChange={handleBulkStatusChange}
            onAddTags={handleBulkAddTags}
            onDelete={handleBulkDelete}
            onClose={() => setActiveTab('list')}
            isDarkMode={isDarkMode}
          />
        )}

        {/* IMPORT/EXPORT TAB */}
        {activeTab === 'import' && (
          <ImportExport
            categories={data.categories}
            onImport={handleImport}
            onExport={() => {}}
            onClose={() => setActiveTab('list')}
            isDarkMode={isDarkMode}
          />
        )}

        {/* ACTIVITY LOGS TAB */}
        {activeTab === 'logs' && (
          <ActivityLogs
            categories={data.categories}
            deletedLogs={data.deletedLogs}
            onClose={() => setActiveTab('list')}
            isDarkMode={isDarkMode}
          />
        )}

        {/* STATISTICS TAB */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <StatsCard stats={stats} isDarkMode={isDarkMode} />
            
            <div className={`p-6 rounded-xl border ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <h3 className={`text-lg font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Additional Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
                }`}>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Root Categories
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {data.categories.filter(c => !c.parentId).length}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
                }`}>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Inactive
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {data.categories.filter(c => c.status !== 'active').length}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
                }`}>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    With Tags
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {data.categories.filter(c => c.tags?.length > 0).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;

// import React, { useState, useEffect, useMemo } from 'react';
// import { 
//   MdAdd, 
//   MdFolder,
//   MdBarChart,
//   MdHistory,
//   MdUpload,
//   MdDownload,
//   MdRestartAlt,
//   MdDescription,
//   MdEdit,
//   MdList,
//   MdSearch,
//   MdFilterList
// } from 'react-icons/md';
// import { StorageService } from '../services/storageService';
// import { CategoryService } from '../services/categoryService';
// import { generateUniqueId } from '../utils/helpers';
// import AddCategoryPanel from '../components/category/CategoryForm';
// import CategoryTree from '../components/category/CategoryTree';
// import SearchBar from '../components/common/SearchBar';
// import StatsCard from '../components/common/StatsCard';
// import BulkOperations from '../components/bulk/BulkOperations';
// import ImportExport from '../components/bulk/ImportExport';
// import ActivityLogs from '../components/logs/ActivityLogs';

// const CategoryPage = ({ isDarkMode, roles = [], positions = [], currentUserId = 'user123' }) => {
//   // ==================== STATE MANAGEMENT ====================
//   const [data, setData] = useState({ categories: [], deletedLogs: [] });
//   const [activeTab, setActiveTab] = useState('list');
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [addingParentId, setAddingParentId] = useState(null);
//   const [categorySearch, setCategorySearch] = useState('');
//   const [searchFilters, setSearchFilters] = useState({ type: 'name', status: 'all' });
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
//   const [sortBy, setSortBy] = useState('name');
//   const [selectedCategories, setSelectedCategories] = useState(new Set());

//   // ==================== LOAD & SAVE ====================
//   useEffect(() => {
//     const loadedData = StorageService.load();
//     setData(loadedData);
//   }, []);

//   useEffect(() => {
//     if (data.categories.length > 0 || data.deletedLogs.length > 0) {
//       StorageService.save(data);
//     }
//   }, [data]);

//   // ==================== HELPER FUNCTIONS ====================
//   const getCategoryById = (id) => data.categories.find(cat => cat.id === id);
//   const getChildrenByParentId = (parentId) => data.categories.filter(cat => cat.parentId === parentId);
  
//   const getAllDescendants = (categoryId) => {
//     const descendants = [];
//     const stack = [categoryId];
//     while (stack.length > 0) {
//       const id = stack.pop();
//       const children = getChildrenByParentId(id);
//       children.forEach(child => {
//         descendants.push(child.id);
//         stack.push(child.id);
//       });
//     }
//     return descendants;
//   };

//   const regenerateCategoryIds = (categories) => {
//     const updated = JSON.parse(JSON.stringify(categories));
//     const updateIds = (parentId = null, prefix = '') => {
//       const children = updated.filter(c => c.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name));
//       children.forEach((child, index) => {
//         const newId = parentId ? `${prefix}.${index + 1}` : `CAT${index + 1}`;
//         const idx = updated.findIndex(c => c.id === child.id);
//         if (idx !== -1) updated[idx].categoryId = newId;
//         updateIds(child.id, newId);
//       });
//     };
//     updateIds(null, '');
//     return updated;
//   };

//   const generateId = (parentId = null) => {
//     if (parentId) {
//       const parent = data.categories.find(c => c.id === parentId);
//       if (parent) {
//         const childCount = data.categories.filter(c => c.parentId === parentId).length + 1;
//         return `${parent.categoryId}.${childCount}`;
//       }
//     }
//     const rootCount = data.categories.filter(c => c.parentId === null).length + 1;
//     return `CAT${rootCount}`;
//   };

//   // ==================== CATEGORY OPERATIONS ====================
//   const handleSaveCategory = (formData) => {
//     try {
//       const now = new Date().toISOString();

//       // Extract and validate data from formData
//       const categoryName = String(formData.category_name || formData.name || '').trim();
//       const categoryDescription = String(formData.description || '').trim();
      
//       if (!categoryName) {
//         alert('Category name is required');
//         return;
//       }
//       if (!categoryDescription) {
//         alert('Description is required');
//         return;
//       }

//       // FIXED: Properly determine parent ID and hierarchy level from formData
//       let parentId = formData.parent_category_id || formData.parentId || null;
      
//       // For adding child categories, addingParentId takes precedence
//       if (addingParentId && !editingCategory) {
//         parentId = addingParentId;
//       }
      
//       // FIXED: Calculate hierarchy level based on parent
//       let hierarchyLevel = 0;
//       if (parentId) {
//         const parent = data.categories.find(c => c.id === parentId);
//         if (parent) {
//           hierarchyLevel = (parent.hierarchyLevel || 0) + 1;
//         }
//       }

//       console.log('Save Category Debug:', {
//         parentId,
//         addingParentId,
//         hierarchyLevel,
//         formData_parent: formData.parent_category_id,
//         formData_level: formData.hierarchy_level
//       });

//       if (editingCategory) {
//         // UPDATE - preserve existing hierarchy if parent hasn't changed
//         const currentCategory = data.categories.find(cat => cat.id === editingCategory.id);
        
//         // Only recalculate hierarchy if parent changed
//         if (currentCategory && currentCategory.parentId !== parentId) {
//           // Parent changed, recalculate level
//           hierarchyLevel = parentId ? 
//             ((data.categories.find(c => c.id === parentId)?.hierarchyLevel || 0) + 1) : 
//             0;
//         } else if (currentCategory) {
//           // Parent didn't change, keep existing level
//           hierarchyLevel = currentCategory.hierarchyLevel || 0;
//         }

//         const updated = data.categories.map(cat =>
//           cat.id === editingCategory.id
//             ? {
//                 ...cat,
//                 ...formData,
//                 id: cat.id, // Preserve original ID
//                 categoryId: cat.categoryId, // Preserve original categoryId for now
//                 name: categoryName,
//                 description: categoryDescription,
//                 parentId: parentId,
//                 hierarchyLevel: hierarchyLevel,
//                 // Preserve field mappings
//                 fields: Array.isArray(formData.fields) ? formData.fields : (cat.fields || []),
//                 fieldValues: formData.fieldValues || cat.fieldValues || {},
//                 // Access control
//                 roles: formData.roles || cat.roles || [],
//                 positions: formData.positions || cat.positions || [],
//                 // Amount configuration
//                 amount: formData.amount || cat.amount || '',
//                 effective_from: formData.effective_from || cat.effective_from || '',
//                 effective_to: formData.effective_to || cat.effective_to || '',
//                 // Metadata
//                 modifiedAt: now,
//                 modifiedBy: currentUserId,
//                 logs: [...(cat.logs || []), { 
//                   action: 'Modified', 
//                   timestamp: now, 
//                   details: `Category updated by ${currentUserId}`,
//                   user: currentUserId
//                 }]
//               }
//             : cat
//         );
        
//         let final = regenerateCategoryIds(updated);
//         setData({ ...data, categories: final });
//         setEditingCategory(null);
//         setAddingParentId(null);
//         setActiveTab('list');
//       } else {
//         // ADD NEW
//         const newCategory = {
//           id: generateUniqueId(),
//           categoryId: generateId(parentId),
//           name: categoryName,
//           description: categoryDescription,
//           parentId: parentId,
//           hierarchyLevel: hierarchyLevel,
//           // Field data
//           fields: Array.isArray(formData.fields) ? formData.fields : [],
//           fieldValues: (formData.fieldValues && typeof formData.fieldValues === 'object') ? formData.fieldValues : {},
//           // Access control
//           roles: formData.roles || [],
//           positions: formData.positions || [],
//           // Amount configuration
//           amount: formData.amount || '',
//           effective_from: formData.effective_from || '',
//           effective_to: formData.effective_to || '',
//           // Default values
//           tags: [],
//           priority: 'medium',
//           status: 'active',
//           // Metadata
//           createdAt: now,
//           createdBy: currentUserId,
//           modifiedAt: now,
//           modifiedBy: currentUserId,
//           logs: [{ 
//             action: 'Created', 
//             timestamp: now, 
//             details: `Category created by ${currentUserId}`,
//             user: currentUserId
//           }]
//         };

//         console.log('New category created:', newCategory);
        
//         let updated = [...data.categories, newCategory];
//         updated = regenerateCategoryIds(updated);
//         setData({ ...data, categories: updated });
//         setAddingParentId(null);
//         setActiveTab('list');
//       }
//     } catch (error) {
//       console.error('❌ Error:', error);
//       alert('❌ Error: ' + error.message);
//     }
//   };

//   const handleDeleteCategory = (id) => {
//     const category = getCategoryById(id);
//     const hasChildren = getChildrenByParentId(id).length > 0;

//     if (hasChildren) {
//       alert('Cannot delete category with children. Delete children first.');
//       return;
//     }

//     if (!window.confirm(`Delete category "${category.name}"?`)) return;

//     const now = new Date().toISOString();
//     const deletedLog = {
//       categoryId: category.categoryId,
//       categoryName: category.name,
//       parentId: category.parentId,
//       hierarchyLevel: category.hierarchyLevel,
//       deletedAt: now,
//       deletedBy: currentUserId
//     };

//     const filtered = data.categories.filter(cat => cat.id !== id);
//     const regenerated = regenerateCategoryIds(filtered);
    
//     setData({
//       categories: regenerated,
//       deletedLogs: [...data.deletedLogs, deletedLog]
//     });
//   };

//   const handleEditCategory = (category) => {
//     setEditingCategory(category);
//     setActiveTab('edit');
//   };

//   const handleAddChild = (parentId) => {
//     setAddingParentId(parentId);
//     setActiveTab('add');
//   };

//   const handleDuplicate = (category) => {
//     const now = new Date().toISOString();
//     const duplicated = {
//       ...category,
//       id: generateUniqueId(),
//       categoryId: generateId(category.parentId),
//       name: `${category.name} (Copy)`,
//       createdAt: now,
//       createdBy: currentUserId,
//       modifiedAt: now,
//       modifiedBy: currentUserId,
//       logs: [{ 
//         action: 'Created', 
//         timestamp: now, 
//         details: `Duplicated from ${category.name}`,
//         user: currentUserId
//       }]
//     };
    
//     const updated = [...data.categories, duplicated];
//     const regenerated = regenerateCategoryIds(updated);
//     setData({ ...data, categories: regenerated });
//   };

//   const handleMoveOrder = (id, direction) => {
//     const updated = [...data.categories];
//     const index = updated.findIndex(cat => cat.id === id);
//     const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
//     if (swapIndex >= 0 && swapIndex < updated.length) {
//       [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
//       const regenerated = regenerateCategoryIds(updated);
//       setData({ ...data, categories: regenerated });
//     }
//   };

//   const handleMoveLevel = (id, newParentId) => {
//     // FIXED: Calculate new hierarchy level when moving
//     let newHierarchyLevel = 0;
//     if (newParentId) {
//       const newParent = data.categories.find(c => c.id === newParentId);
//       if (newParent) {
//         newHierarchyLevel = (newParent.hierarchyLevel || 0) + 1;
//       }
//     }

//     const updated = data.categories.map(cat => 
//       cat.id === id 
//         ? { 
//             ...cat, 
//             parentId: newParentId,
//             hierarchyLevel: newHierarchyLevel,
//             modifiedAt: new Date().toISOString(),
//             modifiedBy: currentUserId,
//             logs: [...(cat.logs || []), {
//               action: 'Moved',
//               timestamp: new Date().toISOString(),
//               details: `Moved to ${newParentId ? `under ${data.categories.find(c => c.id === newParentId)?.name}` : 'root level'}`,
//               user: currentUserId
//             }]
//           } 
//         : cat
//     );
    
//     // Update all descendants' hierarchy levels
//     const updateDescendantLevels = (parentId, parentLevel) => {
//       const children = updated.filter(c => c.parentId === parentId);
//       children.forEach(child => {
//         child.hierarchyLevel = parentLevel + 1;
//         updateDescendantLevels(child.id, child.hierarchyLevel);
//       });
//     };
    
//     updateDescendantLevels(id, newHierarchyLevel);
    
//     const regenerated = regenerateCategoryIds(updated);
//     setData({ ...data, categories: regenerated });
//   };

//   // ==================== SEARCH & FILTER ====================
//   const searchResults = useMemo(() => {
//     let filtered = [...data.categories];
    
//     if (categorySearch) {
//       filtered = filtered.filter(cat => 
//         cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
//         cat.description?.toLowerCase().includes(categorySearch.toLowerCase()) ||
//         cat.categoryId?.toLowerCase().includes(categorySearch.toLowerCase())
//       );
//     }
    
//     if (searchFilters.status !== 'all') {
//       filtered = filtered.filter(cat => cat.status === searchFilters.status);
//     }
    
//     return filtered;
//   }, [data.categories, categorySearch, searchFilters]);

//   const filteredIds = new Set(searchResults.map(cat => cat.id));

//   // ==================== BULK OPERATIONS ====================
//   const toggleSelectCategory = (id) => {
//     const newSelected = new Set(selectedCategories);
//     if (newSelected.has(id)) {
//       newSelected.delete(id);
//     } else {
//       newSelected.add(id);
//     }
//     setSelectedCategories(newSelected);
//   };

//   const handleSelectAll = () => {
//     if (selectedCategories.size === data.categories.length) {
//       setSelectedCategories(new Set());
//     } else {
//       setSelectedCategories(new Set(data.categories.map(cat => cat.id)));
//     }
//   };

//   const handleBulkStatusChange = (status) => {
//     const updated = data.categories.map(cat =>
//       selectedCategories.has(cat.id) 
//         ? { 
//             ...cat, 
//             status, 
//             modifiedAt: new Date().toISOString(),
//             modifiedBy: currentUserId,
//             logs: [...(cat.logs || []), {
//               action: 'Status Changed',
//               timestamp: new Date().toISOString(),
//               details: `Status changed to ${status}`,
//               user: currentUserId
//             }]
//           } 
//         : cat
//     );
//     setData({ ...data, categories: updated });
//     setSelectedCategories(new Set());
//     setActiveTab('list');
//   };

//   const handleBulkAddTags = (tags) => {
//     const updated = data.categories.map(cat =>
//       selectedCategories.has(cat.id)
//         ? { 
//             ...cat, 
//             tags: [...new Set([...(cat.tags || []), ...tags])],
//             modifiedAt: new Date().toISOString(),
//             modifiedBy: currentUserId,
//             logs: [...(cat.logs || []), {
//               action: 'Tags Added',
//               timestamp: new Date().toISOString(),
//               details: `Added tags: ${tags.join(', ')}`,
//               user: currentUserId
//             }]
//           }
//         : cat
//     );
//     setData({ ...data, categories: updated });
//   };

//   const handleBulkDelete = () => {
//     const toDelete = Array.from(selectedCategories);
//     const hasChildrenError = toDelete.some(id => getChildrenByParentId(id).length > 0);
    
//     if (hasChildrenError) {
//       alert('Cannot delete categories with children. Delete children first.');
//       return;
//     }
    
//     if (!window.confirm(`Delete ${selectedCategories.size} categories?`)) return;

//     const now = new Date().toISOString();
//     const deletedLogs = toDelete.map(id => {
//       const cat = getCategoryById(id);
//       return {
//         categoryId: cat.categoryId,
//         categoryName: cat.name,
//         parentId: cat.parentId,
//         hierarchyLevel: cat.hierarchyLevel,
//         deletedAt: now,
//         deletedBy: currentUserId
//       };
//     });

//     const filtered = data.categories.filter(cat => !selectedCategories.has(cat.id));
//     const regenerated = regenerateCategoryIds(filtered);
    
//     setData({
//       categories: regenerated,
//       deletedLogs: [...data.deletedLogs, ...deletedLogs]
//     });
    
//     setSelectedCategories(new Set());
//     setActiveTab('list');
//   };

//   // ==================== IMPORT ====================
//   const handleImport = (imported) => {
//     const merged = [...data.categories, ...imported];
//     setData({ ...data, categories: regenerateCategoryIds(merged) });
//   };

//   // ==================== STATISTICS ====================
//   const stats = useMemo(() => ({
//     total: data.categories.length,
//     active: data.categories.filter(c => c.status === 'active').length,
//     withCustomFields: data.categories.filter(c => c.fields?.length > 0).length,
//     deleted: data.deletedLogs.length,
//     maxDepth: Math.max(0, ...data.categories.map(c => c.hierarchyLevel || 0))
//   }), [data]);

//   // ==================== RENDER ====================
//   return (
//     <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
//       <div className="container mx-auto px-4 py-6 max-w-7xl">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//             Category Management
//           </h1>
//           <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//             Organize and manage your hierarchical category structure
//           </p>
//         </div>

//         {/* Quick Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
//           <div className={`p-4 rounded-lg border ${
//             isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
//           }`}>
//             <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//               Total Categories
//             </div>
//             <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//               {stats.total}
//             </div>
//           </div>
//           <div className={`p-4 rounded-lg border ${
//             isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
//           }`}>
//             <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//               Active
//             </div>
//             <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
//               {stats.active}
//             </div>
//           </div>
//           <div className={`p-4 rounded-lg border ${
//             isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
//           }`}>
//             <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//               Custom Fields
//             </div>
//             <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
//               {stats.withCustomFields}
//             </div>
//           </div>
//           <div className={`p-4 rounded-lg border ${
//             isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
//           }`}>
//             <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//               Max Depth
//             </div>
//             <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
//               {stats.maxDepth}
//             </div>
//           </div>
//           <div className={`p-4 rounded-lg border ${
//             isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
//           }`}>
//             <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//               Deleted
//             </div>
//             <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
//               {stats.deleted}
//             </div>
//           </div>
//         </div>

//         {/* Action Tabs */}
//         <div className={`mb-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
//           <div className="flex items-center gap-1 overflow-x-auto">
//             <button
//               onClick={() => setActiveTab('list')}
//               className={`px-4 py-2.5 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
//                 activeTab === 'list'
//                   ? isDarkMode
//                     ? 'text-blue-400 border-b-2 border-blue-400'
//                     : 'text-blue-600 border-b-2 border-blue-600'
//                   : isDarkMode
//                   ? 'text-slate-400 hover:text-white'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               <MdList size={18} />
//               Categories
//             </button>
            
//             <button
//               onClick={() => setActiveTab('add')}
//               className={`px-4 py-2.5 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
//                 activeTab === 'add'
//                   ? isDarkMode
//                     ? 'text-blue-400 border-b-2 border-blue-400'
//                     : 'text-blue-600 border-b-2 border-blue-600'
//                   : isDarkMode
//                   ? 'text-slate-400 hover:text-white'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               <MdAdd size={18} />
//               Add New
//             </button>
            
//             {selectedCategories.size > 0 && (
//               <button
//                 onClick={() => setActiveTab('bulk')}
//                 className={`px-4 py-2.5 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
//                   activeTab === 'bulk'
//                     ? isDarkMode
//                       ? 'text-blue-400 border-b-2 border-blue-400'
//                       : 'text-blue-600 border-b-2 border-blue-600'
//                     : isDarkMode
//                     ? 'text-slate-400 hover:text-white'
//                     : 'text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 <MdEdit size={18} />
//                 Bulk Edit ({selectedCategories.size})
//               </button>
//             )}
            
//             <button
//               onClick={() => setActiveTab('import')}
//               className={`px-4 py-2.5 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
//                 activeTab === 'import'
//                   ? isDarkMode
//                     ? 'text-blue-400 border-b-2 border-blue-400'
//                     : 'text-blue-600 border-b-2 border-blue-600'
//                   : isDarkMode
//                   ? 'text-slate-400 hover:text-white'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               <MdUpload size={18} />
//               Import/Export
//             </button>
            
//             <button
//               onClick={() => setActiveTab('logs')}
//               className={`px-4 py-2.5 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
//                 activeTab === 'logs'
//                   ? isDarkMode
//                     ? 'text-blue-400 border-b-2 border-blue-400'
//                     : 'text-blue-600 border-b-2 border-blue-600'
//                   : isDarkMode
//                   ? 'text-slate-400 hover:text-white'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               <MdHistory size={18} />
//               Activity Logs
//             </button>
            
//             <button
//               onClick={() => setActiveTab('stats')}
//               className={`px-4 py-2.5 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
//                 activeTab === 'stats'
//                   ? isDarkMode
//                     ? 'text-blue-400 border-b-2 border-blue-400'
//                     : 'text-blue-600 border-b-2 border-blue-600'
//                   : isDarkMode
//                   ? 'text-slate-400 hover:text-white'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               <MdBarChart size={18} />
//               Statistics
//             </button>
//           </div>
//         </div>

//         {/* Content Area */}
//         <div>
//           {/* LIST TAB */}
//           {activeTab === 'list' && (
//             <div className="space-y-4">
//               {/* Search & Filters */}
//               <div className={`rounded-xl border ${
//                 isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
//               }`}>
//                 <div className="p-4">
//                   <div className="flex flex-col lg:flex-row gap-4">
//                     <div className="flex-1">
//                       <div className="relative">
//                         <MdSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${
//                           isDarkMode ? 'text-slate-400' : 'text-gray-400'
//                         }`} size={20} />
//                         <input
//                           type="text"
//                           value={categorySearch}
//                           onChange={(e) => setCategorySearch(e.target.value)}
//                           placeholder="Search categories..."
//                           className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm ${
//                             isDarkMode
//                               ? 'bg-slate-700 border border-slate-600 text-white placeholder-slate-400'
//                               : 'bg-white border border-slate-300 text-gray-900 placeholder-gray-400'
//                           } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
//                         />
//                       </div>
//                     </div>
                    
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//                         className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
//                           showAdvancedFilters
//                             ? isDarkMode
//                               ? 'bg-blue-900/50 text-blue-300'
//                               : 'bg-blue-100 text-blue-700'
//                             : isDarkMode
//                               ? 'bg-slate-700 text-white hover:bg-slate-600'
//                               : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
//                         }`}
//                       >
//                         <MdFilterList size={18} />
//                         Filters
//                       </button>
                      
//                       {selectedCategories.size === 0 && (
//                         <button
//                           onClick={() => setActiveTab('add')}
//                           className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
//                             isDarkMode
//                               ? 'bg-blue-600 text-white hover:bg-blue-700'
//                               : 'bg-blue-600 text-white hover:bg-blue-700'
//                           }`}
//                         >
//                           <MdAdd size={18} />
//                           Add Category
//                         </button>
//                       )}
                      
//                       {selectedCategories.size > 0 && (
//                         <button
//                           onClick={handleSelectAll}
//                           className={`px-4 py-2 rounded-lg text-sm font-medium ${
//                             isDarkMode
//                               ? 'bg-slate-700 text-white hover:bg-slate-600'
//                               : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
//                           }`}
//                         >
//                           {selectedCategories.size === data.categories.length ? 'Deselect All' : 'Select All'}
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   {/* Advanced Filters */}
//                   {showAdvancedFilters && (
//                     <div className={`mt-4 pt-4 border-t ${
//                       isDarkMode ? 'border-slate-700' : 'border-slate-200'
//                     }`}>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div>
//                           <label className={`block text-sm font-medium mb-1 ${
//                             isDarkMode ? 'text-slate-300' : 'text-gray-700'
//                           }`}>
//                             Status
//                           </label>
//                           <select
//                             value={searchFilters.status}
//                             onChange={(e) => setSearchFilters({ ...searchFilters, status: e.target.value })}
//                             className={`w-full px-3 py-2 rounded-lg text-sm ${
//                               isDarkMode
//                                 ? 'bg-slate-700 border border-slate-600 text-white'
//                                 : 'bg-white border border-slate-300 text-gray-900'
//                             }`}
//                           >
//                             <option value="all">All Status</option>
//                             <option value="active">Active</option>
//                             <option value="inactive">Inactive</option>
//                             <option value="draft">Draft</option>
//                           </select>
//                         </div>
                        
//                         <div>
//                           <label className={`block text-sm font-medium mb-1 ${
//                             isDarkMode ? 'text-slate-300' : 'text-gray-700'
//                           }`}>
//                             Sort By
//                           </label>
//                           <select
//                             value={sortBy}
//                             onChange={(e) => setSortBy(e.target.value)}
//                             className={`w-full px-3 py-2 rounded-lg text-sm ${
//                               isDarkMode
//                                 ? 'bg-slate-700 border border-slate-600 text-white'
//                                 : 'bg-white border border-slate-300 text-gray-900'
//                             }`}
//                           >
//                             <option value="name">Name</option>
//                             <option value="created">Created Date</option>
//                             <option value="modified">Modified Date</option>
//                             <option value="hierarchy">Hierarchy</option>
//                           </select>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Category Tree */}
//               <div className={`rounded-xl border min-h-[400px] ${
//                 isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
//               }`}>
//                 {data.categories.length === 0 ? (
//                   <div className={`text-center py-16 ${
//                     isDarkMode ? 'text-slate-400' : 'text-slate-600'
//                   }`}>
//                     <MdFolder size={64} className="mx-auto mb-4 opacity-50" />
//                     <p className="font-semibold text-lg mb-2">No categories yet</p>
//                     <p className="text-sm mb-4">Get started by creating your first category</p>
//                     <button
//                       onClick={() => setActiveTab('add')}
//                       className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
//                     >
//                       <MdAdd className="inline mr-2" size={18} />
//                       Create First Category
//                     </button>
//                   </div>
//                 ) : searchResults.length === 0 ? (
//                   <div className={`text-center py-16 ${
//                     isDarkMode ? 'text-slate-400' : 'text-slate-600'
//                   }`}>
//                     <MdFolder size={64} className="mx-auto mb-4 opacity-50" />
//                     <p className="font-semibold text-lg mb-2">No categories found</p>
//                     <p className="text-sm">Try adjusting your search filters</p>
//                   </div>
//                 ) : (
//                   <div className="p-4">
//                     <CategoryTree
//                       categories={data.categories}
//                       onEdit={handleEditCategory}
//                       onDelete={handleDeleteCategory}
//                       onDuplicate={handleDuplicate}
//                       onAddChild={handleAddChild}
//                       onMoveOrder={handleMoveOrder}
//                       onMoveLevel={handleMoveLevel}
//                       selectedCategories={selectedCategories}
//                       onToggleSelect={toggleSelectCategory}
//                       filteredIds={filteredIds}
//                       isDarkMode={isDarkMode}
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* ADD CATEGORY TAB */}
//           {activeTab === 'add' && (
//             <AddCategoryPanel
//               category={null}
//               categories={data.categories}
//               roles={roles}
//               positions={positions}
//               currentUserId={currentUserId}
//               onSave={handleSaveCategory}
//               onCancel={() => {
//                 setAddingParentId(null);
//                 setActiveTab('list');
//               }}
//               isDarkMode={isDarkMode}
//               parentCategoryId={addingParentId}
//             />
//           )}

//           {/* EDIT CATEGORY TAB */}
//           {activeTab === 'edit' && editingCategory && (
//             <AddCategoryPanel
//               category={editingCategory}
//               categories={data.categories}
//               roles={roles}
//               positions={positions}
//               currentUserId={currentUserId}
//               onSave={handleSaveCategory}
//               onCancel={() => {
//                 setEditingCategory(null);
//                 setActiveTab('list');
//               }}
//               isDarkMode={isDarkMode}
//             />
//           )}

//           {/* BULK OPERATIONS TAB */}
//           {activeTab === 'bulk' && (
//             <BulkOperations
//               selectedCount={selectedCategories.size}
//               onSelectAll={handleSelectAll}
//               onStatusChange={handleBulkStatusChange}
//               onAddTags={handleBulkAddTags}
//               onDelete={handleBulkDelete}
//               onClose={() => setActiveTab('list')}
//               isDarkMode={isDarkMode}
//             />
//           )}

//           {/* IMPORT/EXPORT TAB */}
//           {activeTab === 'import' && (
//             <ImportExport
//               categories={data.categories}
//               onImport={handleImport}
//               onExport={() => {}}
//               onClose={() => setActiveTab('list')}
//               isDarkMode={isDarkMode}
//             />
//           )}

//           {/* ACTIVITY LOGS TAB */}
//           {activeTab === 'logs' && (
//             <ActivityLogs
//               categories={data.categories}
//               deletedLogs={data.deletedLogs}
//               onClose={() => setActiveTab('list')}
//               isDarkMode={isDarkMode}
//             />
//           )}

//           {/* STATISTICS TAB */}
//           {activeTab === 'stats' && (
//             <div className="space-y-6">
//               <StatsCard stats={stats} isDarkMode={isDarkMode} />
              
//               <div className={`p-6 rounded-xl border ${
//                 isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
//               }`}>
//                 <h3 className={`text-lg font-bold mb-4 ${
//                   isDarkMode ? 'text-white' : 'text-slate-900'
//                 }`}>
//                   Additional Insights
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className={`p-4 rounded-lg ${
//                     isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
//                   }`}>
//                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
//                       Root Categories
//                     </p>
//                     <p className={`text-2xl font-bold mt-1 ${
//                       isDarkMode ? 'text-white' : 'text-slate-900'
//                     }`}>
//                       {data.categories.filter(c => !c.parentId).length}
//                     </p>
//                   </div>
//                   <div className={`p-4 rounded-lg ${
//                     isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
//                   }`}>
//                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
//                       Inactive
//                     </p>
//                     <p className={`text-2xl font-bold mt-1 ${
//                       isDarkMode ? 'text-white' : 'text-slate-900'
//                     }`}>
//                       {data.categories.filter(c => c.status !== 'active').length}
//                     </p>
//                   </div>
//                   <div className={`p-4 rounded-lg ${
//                     isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
//                   }`}>
//                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
//                       With Tags
//                     </p>
//                     <p className={`text-2xl font-bold mt-1 ${
//                       isDarkMode ? 'text-white' : 'text-slate-900'
//                     }`}>
//                       {data.categories.filter(c => c.tags?.length > 0).length}
//                     </p>
//                   </div>
//                 </div>

//                 <div className={`mt-6 p-4 rounded-lg ${
//                   isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
//                 }`}>
//                   <h4 className={`text-sm font-medium mb-2 ${
//                     isDarkMode ? 'text-slate-300' : 'text-gray-700'
//                   }`}>
//                     Hierarchy Distribution
//                   </h4>
//                   <div className="space-y-2">
//                     {[...Array(stats.maxDepth + 1)].map((_, level) => {
//                       const count = data.categories.filter(c => c.hierarchyLevel === level).length;
//                       const percentage = (count / data.categories.length) * 100;
//                       return (
//                         <div key={level} className="flex items-center gap-3">
//                           <span className={`text-sm w-20 ${
//                             isDarkMode ? 'text-slate-400' : 'text-gray-600'
//                           }`}>
//                             Level {level}
//                           </span>
//                           <div className="flex-1 h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-600">
//                             <div
//                               className="h-full bg-blue-500 dark:bg-blue-400 transition-all"
//                               style={{ width: `${percentage}%` }}
//                             />
//                           </div>
//                           <span className={`text-sm w-16 text-right ${
//                             isDarkMode ? 'text-slate-400' : 'text-gray-600'
//                           }`}>
//                             {count}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CategoryPage;