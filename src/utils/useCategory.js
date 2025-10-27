import { useState, useCallback } from 'react';
import { CategoryService } from '../services/categoryService';

export const useCategory = () => {
  const [categories, setCategories] = useState(() => CategoryService.getAll());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCategory = useCallback((data) => {
    try {
      setLoading(true);
      const result = CategoryService.create(data);
      setCategories(CategoryService.getAll());
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback((id, data) => {
    try {
      setLoading(true);
      const result = CategoryService.update(id, data);
      setCategories(CategoryService.getAll());
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback((id) => {
    try {
      setLoading(true);
      CategoryService.delete(id);
      setCategories(CategoryService.getAll());
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCategories = useCallback((query) => {
    return CategoryService.search(query);
  }, []);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    searchCategories,
    refreshCategories: () => setCategories(CategoryService.getAll())
  };
};