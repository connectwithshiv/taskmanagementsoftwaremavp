import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCategory } from '../../hooks/useCategory';
import { CategoryList } from './CategoryList';
import { CategoryForm } from './CategoryForm';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const CategoryPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useCategory();

  const selectedCategory = editingId ? categories.find(c => c.id === editingId) : null;

  const handleAdd = () => {
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
    }
  };

  const handleSubmit = (data) => {
    if (editingId) {
      updateCategory(editingId, data);
    } else {
      createCategory(data);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900">Categories Management</h2>
        <Button onClick={handleAdd} size="lg">
          <Plus size={18} /> New Category
        </Button>
      </div>

      <CategoryList
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedCategory}
      />
    </div>
  );
};