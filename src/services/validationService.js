// Validation Service - Input validation
export const ValidationService = {
  validateCategory: (category) => {
    const errors = [];

    if (!category.name || !category.name.trim()) {
      errors.push('Category name is required');
    }

    if (category.name && category.name.length > 100) {
      errors.push('Category name must be less than 100 characters');
    }

    if (category.description && category.description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  validateField: (field) => {
    const errors = [];

    if (!field.name || !field.name.trim()) {
      errors.push('Field name is required');
    }

    if (!field.type) {
      errors.push('Field type is required');
    }

    if ((field.type === 'dropdown' || field.type === 'radio') && (!field.options || field.options.length === 0)) {
      errors.push('Options are required for dropdown and radio fields');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};