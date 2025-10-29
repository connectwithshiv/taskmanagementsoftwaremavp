// hooks/useWorksheet.js - Custom Hook for Worksheet Operations

import { useState, useEffect, useCallback } from 'react';
import WorksheetService from '../services/worksheetService';

/**
 * useWorksheet - Main hook for all worksheet operations
 * Combines template loading, form state management, and submission
 */
export const useWorksheet = (categoryId, taskId, userId) => {
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  // Load template and draft on mount
  useEffect(() => {
    loadTemplate();
    loadSubmissions();
  }, [categoryId, taskId]);

  const loadTemplate = useCallback(() => {
    setLoading(true);
    try {
      const worksheetTemplate = WorksheetService.getTemplateByCategory(categoryId);
      
      if (worksheetTemplate) {
        setTemplate(worksheetTemplate);
        
        // Check for draft
        const draft = WorksheetService.getDraft(taskId, userId);
        if (draft) {
          setFormData(draft.data);
          setHasDraft(true);
        } else {
          // Initialize with defaults
          const initialData = {};
          worksheetTemplate.fields.forEach(field => {
            initialData[field.id] = field.defaultValue || '';
          });
          setFormData(initialData);
        }
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
    setLoading(false);
  }, [categoryId, taskId, userId]);

  const loadSubmissions = useCallback(() => {
    try {
      const taskSubmissions = WorksheetService.getSubmissionsByTask(taskId);
      setSubmissions(taskSubmissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  }, [taskId]);

  /**
   * Update a single field value
   */
  const updateField = useCallback((fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: null
      }));
    }
  }, [errors]);

  /**
   * Update multiple field values at once
   */
  const updateMultipleFields = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Reset form to default/template values
   */
  const resetForm = useCallback(() => {
    if (!template) return;
    
    const resetData = {};
    template.fields.forEach(field => {
      resetData[field.id] = field.defaultValue || '';
    });
    setFormData(resetData);
    setErrors({});
  }, [template]);

  /**
   * Validate form data
   */
  const validate = useCallback(() => {
    if (!template) return true;

    const newErrors = {};

    template.fields.forEach(field => {
      const value = formData[field.id];

      // Check required fields
      if (field.required) {
        if (value === null || value === undefined || value === '') {
          newErrors[field.id] = 'This field is required';
        } else if (Array.isArray(value) && value.length === 0) {
          newErrors[field.id] = 'Please select at least one option';
        }
      }

      // Type-specific validation
      if (value && field.type === 'number') {
        if (isNaN(Number(value))) {
          newErrors[field.id] = 'Must be a valid number';
        }
      }

      if (value && field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          newErrors[field.id] = 'Invalid email address';
        }
      }

      if (value && field.type === 'date') {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(String(value))) {
          newErrors[field.id] = 'Invalid date format';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [template, formData]);

  /**
   * Save draft
   */
  const saveDraft = useCallback(async () => {
    if (!template) return { success: false, message: 'No template loaded' };

    try {
      const draft = {
        taskId,
        userId,
        templateId: template.id,
        data: formData
      };

      const result = WorksheetService.saveDraft(draft);
      if (result.success) {
        setHasDraft(true);
      }
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, [template, taskId, userId, formData]);

  /**
   * Submit form
   */
  const submitForm = useCallback(async () => {
    if (!validate()) {
      return { success: false, message: 'Please fix validation errors' };
    }

    if (!template) {
      return { success: false, message: 'No template loaded' };
    }

    setSubmitting(true);
    try {
      const submission = {
        taskId,
        templateId: template.id,
        templateName: template.name,
        categoryId,
        userId,
        data: formData,
        status: 'submitted'
      };

      const result = WorksheetService.saveSubmission(submission);

      if (result.success) {
        // Clear draft
        WorksheetService.deleteDraft(taskId, userId);
        setHasDraft(false);
        
        // Reload submissions
        loadSubmissions();
        
        // Reset form
        resetForm();
      }

      return result;
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setSubmitting(false);
    }
  }, [validate, template, taskId, templateId, categoryId, userId, formData, loadSubmissions, resetForm]);

  /**
   * Get field by ID
   */
  const getField = useCallback((fieldId) => {
    if (!template) return null;
    return template.fields.find(f => f.id === fieldId);
  }, [template]);

  /**
   * Get all form data
   */
  const getFormData = useCallback(() => {
    return { ...formData };
  }, [formData]);

  /**
   * Check if form has been modified
   */
  const isFormDirty = useCallback(() => {
    if (!template) return false;
    
    for (let field of template.fields) {
      const currentValue = formData[field.id];
      const defaultValue = field.defaultValue || '';
      
      if (currentValue !== defaultValue) {
        return true;
      }
    }
    
    return false;
  }, [template, formData]);

  /**
   * Get form statistics
   */
  const getFormStats = useCallback(() => {
    if (!template) return null;

    const totalFields = template.fields.length;
    const requiredFields = template.fields.filter(f => f.required).length;
    const filledFields = template.fields.filter(f => {
      const value = formData[f.id];
      return value && (Array.isArray(value) ? value.length > 0 : true);
    }).length;
    const completionPercent = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

    return {
      totalFields,
      requiredFields,
      filledFields,
      completionPercent
    };
  }, [template, formData]);

  /**
   * Delete draft
   */
  const deleteDraft = useCallback(async () => {
    try {
      const result = WorksheetService.deleteDraft(taskId, userId);
      if (result.success) {
        setHasDraft(false);
      }
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, [taskId, userId]);

  return {
    // State
    template,
    formData,
    errors,
    loading,
    submitting,
    hasDraft,
    submissions,

    // Methods
    updateField,
    updateMultipleFields,
    resetForm,
    validate,
    saveDraft,
    submitForm,
    deleteDraft,
    getField,
    getFormData,
    loadTemplate,
    loadSubmissions,

    // Utilities
    isFormDirty,
    getFormStats
  };
};

/**
 * useWorksheetTemplate - Hook for loading and managing templates (admin side)
 */
export const useWorksheetTemplate = (categoryId) => {
  const [template, setTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTemplate = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const t = WorksheetService.getTemplateByCategory(categoryId);
      setTemplate(t || null);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [categoryId]);

  const loadAllTemplates = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const allTemplates = WorksheetService.getAllTemplates();
      setTemplates(allTemplates);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  const createTemplate = useCallback((templateData) => {
    try {
      const result = WorksheetService.createTemplate(templateData);
      if (result.success) {
        setTemplate(result.template);
        loadAllTemplates();
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [loadAllTemplates]);

  const updateTemplate = useCallback((templateId, updates) => {
    try {
      const result = WorksheetService.updateTemplate(templateId, updates);
      if (result.success) {
        if (template?.id === templateId) {
          setTemplate(result.template);
        }
        loadAllTemplates();
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [template, loadAllTemplates]);

  const deleteTemplate = useCallback((templateId) => {
    try {
      const result = WorksheetService.deleteTemplate(templateId);
      if (result.success) {
        if (template?.id === templateId) {
          setTemplate(null);
        }
        loadAllTemplates();
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [template, loadAllTemplates]);

  const hasTemplate = useCallback(() => {
    return !!template;
  }, [template]);

  return {
    template,
    templates,
    loading,
    error,
    loadTemplate,
    loadAllTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    hasTemplate
  };
};

/**
 * useWorksheetSubmissions - Hook for managing submissions (admin side)
 */
export const useWorksheetSubmissions = (taskId) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const loadSubmissions = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const subs = WorksheetService.getSubmissionsByTask(taskId);
      setSubmissions(subs);
      
      // Calculate stats
      const total = subs.length;
      const reviewed = subs.filter(s => s.status === 'reviewed').length;
      const pending = total - reviewed;
      
      setStats({ total, reviewed, pending });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [taskId]);

  const updateSubmission = useCallback((submissionId, updates) => {
    try {
      const result = WorksheetService.updateSubmission(submissionId, updates);
      if (result.success) {
        loadSubmissions();
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [loadSubmissions]);

  const deleteSubmission = useCallback((submissionId) => {
    try {
      const result = WorksheetService.deleteSubmission(submissionId);
      if (result.success) {
        loadSubmissions();
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [loadSubmissions]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  return {
    submissions,
    loading,
    error,
    stats,
    loadSubmissions,
    updateSubmission,
    deleteSubmission
  };
};

export default useWorksheet;