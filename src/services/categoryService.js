// services/categoryService.js - FIXED - Works for Category Window AND User Form

import { StorageService } from './storageService';

// Initialize categories from localStorage or use empty array
let categoryData = StorageService.load();
let categories = categoryData.categories || [];
let deletedLogs = categoryData.deletedLogs || [];

// Save to localStorage whenever data changes
const saveData = () => {
  StorageService.save({ categories, deletedLogs });
};

export const CategoryService = {
  // ==========================================
  // CORE METHODS - For both Category Window and User Form
  // ==========================================

  // Get all categories (active only by default)
  getAll: (includeDeleted = false) => {
    if (includeDeleted) {
      return categories;
    }
    return categories.filter(cat => cat.status !== 'deleted');
  },

  // Get active categories only
  getActiveCategories: () => {
    return categories.filter(cat => cat.status === 'active');
  },

  // Get categories formatted for user form with full path
  getCategoriesForUserForm: () => {
    const activeCategories = CategoryService.getActiveCategories();
    
    return activeCategories.map(cat => {
      const parentChain = CategoryService.getParentChain(categories, cat.id);
      const fullPath = parentChain.map(c => c.name).join(' > ');
      
      return {
        id: cat.id,
        categoryId: cat.categoryId,
        name: cat.name,
        fullPath: fullPath,
        parentId: cat.parentId,
        description: cat.description || ''
      };
    });
  },

  // Get category by ID
  getCategoryById: (categoriesList, id) => {
    // Support both signatures: (id) and (categoriesList, id)
    if (typeof categoriesList === 'string') {
      // Called as getCategoryById(id)
      return categories.find(cat => cat.id === categoriesList);
    }
    // Called as getCategoryById(categories, id)
    return categoriesList.find(cat => cat.id === id);
  },

  // Get children by parent ID
  getChildrenByParentId: (categoriesList, parentId) => {
    // Support both signatures: (parentId) and (categoriesList, parentId)
    if (typeof categoriesList === 'string' || categoriesList === null) {
      // Called as getChildrenByParentId(parentId)
      return categories.filter(cat => cat.parentId === categoriesList);
    }
    // Called as getChildrenByParentId(categories, parentId)
    return categoriesList.filter(cat => cat.parentId === parentId);
  },

  // Get parent chain
  getParentChain: (categoriesList, categoryId) => {
    const chain = [];
    let currentId = categoryId;
    
    while (currentId) {
      const category = categoriesList.find(cat => cat.id === currentId);
      if (!category) break;
      chain.unshift(category);
      currentId = category.parentId;
    }
    
    return chain;
  },

  // ==========================================
  // CATEGORY WINDOW METHODS (from commented code)
  // ==========================================

  // Get all categories with full path (for Category Window display)
  getAllCategoriesFlat: (categoriesList) => {
    const categoriesToUse = categoriesList || categories;
    return categoriesToUse.map(cat => ({
      ...cat,
      fullPath: CategoryService.getParentChain(categoriesToUse, cat.id)
        .map(c => c.name)
        .join(' > ')
    }));
  },

  // Search categories (used by Category Window)
  searchCategories: (categoriesList, query, filters) => {
    let results = categoriesList || categories;

    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      const matchedIds = new Set();

      results.forEach(cat => {
        let matches = false;
        
        if (filters.type === 'name') {
          matches = cat.name.toLowerCase().includes(searchTerm);
        } else if (filters.type === 'id') {
          matches = cat.categoryId.toLowerCase().includes(searchTerm);
        } else if (filters.type === 'tags') {
          matches = cat.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
        } else {
          // Default: search all fields
          matches = cat.name.toLowerCase().includes(searchTerm) ||
                   cat.categoryId.toLowerCase().includes(searchTerm) ||
                   (cat.tags && cat.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
                   (cat.description && cat.description.toLowerCase().includes(searchTerm));
        }

        if (matches) {
          matchedIds.add(cat.id);
          
          // Add parent chain
          let currentParentId = cat.parentId;
          while (currentParentId) {
            matchedIds.add(currentParentId);
            const parent = CategoryService.getCategoryById(results, currentParentId);
            currentParentId = parent?.parentId || null;
          }
          
          // Add descendants
          CategoryService.getAllDescendants(cat.id).forEach(id => matchedIds.add(id));
        }
      });

      results = results.filter(cat => matchedIds.has(cat.id));
    }

    if (filters.status && filters.status !== 'all') {
      results = results.filter(cat => cat.status === filters.status);
    }

    return results;
  },

  // Sort categories (used by Category Window)
  sortCategories: (categoriesList, sortBy) => {
    const categoriesToSort = categoriesList || categories;
    return [...categoriesToSort].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'priority') {
        const pMap = { high: 0, medium: 1, low: 2 };
        return pMap[a.priority] - pMap[b.priority];
      }
      return 0;
    });
  },

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================

  // Generate new ID
  generateId: (categoriesList, parentId = null) => {
    const categoriesToUse = categoriesList || categories;
    
    if (parentId) {
      const parent = categoriesToUse.find(c => c.id === parentId);
      if (parent) {
        const childCount = categoriesToUse.filter(c => c.parentId === parentId).length + 1;
        return `${parent.categoryId}.${childCount}`;
      }
    }
    const rootCount = categoriesToUse.filter(c => c.parentId === null).length + 1;
    return `CAT${rootCount}`;
  },

  // Create new category
  create: (data) => {
    const newCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      categoryId: CategoryService.generateId(categories, data.parentId || null),
      name: data.name,
      description: data.description || '',
      parentId: data.parentId || null,
      status: data.status || 'active',
      priority: data.priority || 'medium',
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy || 'system'
    };

    categories.push(newCategory);
    saveData();
    return newCategory;
  },

  // Update category
  update: (id, data) => {
    const index = categories.findIndex(cat => cat.id === id);
    if (index === -1) throw new Error('Category not found');

    categories[index] = {
      ...categories[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    saveData();
    return categories[index];
  },

  // Delete category (soft delete)
  delete: (id, deletedBy = 'system') => {
    const category = categories.find(cat => cat.id === id);
    if (!category) throw new Error('Category not found');

    // Check if category has children
    const hasChildren = categories.some(cat => cat.parentId === id);
    if (hasChildren) {
      throw new Error('Cannot delete category with children. Delete child categories first.');
    }

    // Soft delete
    const index = categories.findIndex(cat => cat.id === id);
    categories[index].status = 'deleted';
    categories[index].deletedAt = new Date().toISOString();
    categories[index].deletedBy = deletedBy;

    // Log deletion
    deletedLogs.push({
      id: `del_${Date.now()}`,
      categoryId: category.id,
      categoryName: category.name,
      deletedAt: new Date().toISOString(),
      deletedBy: deletedBy
    });

    saveData();
  },

  // Search (modern version - for internal use)
  search: (query, filters = {}) => {
    let results = categories.filter(cat => cat.status !== 'deleted');

    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      const matchedIds = new Set();

      results.forEach(cat => {
        let matches = false;
        
        // Search by name
        if (cat.name.toLowerCase().includes(searchTerm)) {
          matches = true;
        }
        
        // Search by category ID
        if (cat.categoryId.toLowerCase().includes(searchTerm)) {
          matches = true;
        }
        
        // Search by tags
        if (cat.tags && cat.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
          matches = true;
        }
        
        // Search by description
        if (cat.description && cat.description.toLowerCase().includes(searchTerm)) {
          matches = true;
        }

        if (matches) {
          matchedIds.add(cat.id);
          
          // Add parent chain
          let currentParentId = cat.parentId;
          while (currentParentId) {
            matchedIds.add(currentParentId);
            const parent = CategoryService.getCategoryById(categories, currentParentId);
            currentParentId = parent?.parentId || null;
          }
          
          // Add descendants
          const addDescendants = (parentId) => {
            const children = CategoryService.getChildrenByParentId(categories, parentId);
            children.forEach(child => {
              matchedIds.add(child.id);
              addDescendants(child.id);
            });
          };
          addDescendants(cat.id);
        }
      });

      results = results.filter(cat => matchedIds.has(cat.id));
    }

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      results = results.filter(cat => cat.status === filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      results = results.filter(cat => cat.priority === filters.priority);
    }

    return results;
  },

  // Sort (modern version - for internal use)
  sort: (categoriesToSort, sortBy) => {
    return [...categoriesToSort].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'priority') {
        const pMap = { high: 0, medium: 1, low: 2 };
        return pMap[a.priority] - pMap[b.priority];
      }
      return 0;
    });
  },

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  // Get all descendants
  getAllDescendants: (categoryId) => {
    const descendants = [];
    const stack = [categoryId];
    
    while (stack.length > 0) {
      const id = stack.pop();
      const children = CategoryService.getChildrenByParentId(categories, id);
      children.forEach(child => {
        descendants.push(child.id);
        stack.push(child.id);
      });
    }
    
    return descendants;
  },

  // Regenerate category IDs
  regenerateCategoryIds: (categoriesList) => {
    const categoriesToUpdate = categoriesList || categories;
    const updated = JSON.parse(JSON.stringify(categoriesToUpdate));
    
    const updateIds = (parentId = null, prefix = '') => {
      const children = updated
        .filter(c => c.parentId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      children.forEach((child, index) => {
        const newId = parentId ? `${prefix}.${index + 1}` : `CAT${index + 1}`;
        const idx = updated.findIndex(c => c.id === child.id);
        if (idx !== -1) updated[idx].categoryId = newId;
        updateIds(child.id, newId);
      });
    };
    
    updateIds(null, '');
    
    if (!categoriesList) {
      categories = updated;
      saveData();
    }
    
    return updated;
  },

  // Get statistics
  getStatistics: () => {
    const active = categories.filter(c => c.status === 'active').length;
    const inactive = categories.filter(c => c.status === 'inactive').length;
    const deleted = categories.filter(c => c.status === 'deleted').length;
    const rootCategories = categories.filter(c => c.parentId === null && c.status !== 'deleted').length;

    return {
      total: categories.length,
      active,
      inactive,
      deleted,
      rootCategories
    };
  },

  // Clear all categories (use with caution!)
  clearAll: () => {
    categories = [];
    deletedLogs = [];
    saveData();
  },

  // Import categories
  importCategories: (importedCategories) => {
    categories = importedCategories;
    saveData();
  },

  // Export categories
  exportCategories: () => {
    return {
      categories: categories,
      deletedLogs: deletedLogs,
      exportedAt: new Date().toISOString()
    };
  }
};

export default CategoryService;