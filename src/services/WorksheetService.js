// services/worksheetService.js - Core Worksheet Service

const STORAGE_KEYS = {
  TEMPLATES: 'worksheetTemplates',
  SUBMISSIONS: 'worksheetSubmissions',
  DRAFTS: 'worksheetDrafts'
};

// Helper: Get all data from localStorage with chunking support
const getStorageData = (key) => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
  }
  return [];
};

// Helper: Save data to localStorage with chunking support
const setStorageData = (key, data) => {
  try {
    const jsonData = JSON.stringify(data);
    
    // If data exceeds 1MB, use chunking
    const maxChunkSize = 1000000;
    if (jsonData.length > maxChunkSize) {
      const chunks = [];
      for (let i = 0; i < jsonData.length; i += maxChunkSize) {
        chunks.push(jsonData.slice(i, i + maxChunkSize));
      }
      
      // Clear old chunks
      Object.keys(localStorage).forEach(storageKey => {
        if (storageKey.startsWith(`${key}_chunk_`)) {
          localStorage.removeItem(storageKey);
        }
      });
      
      // Save new chunks
      chunks.forEach((chunk, index) => {
        localStorage.setItem(`${key}_chunk_${index}`, chunk);
      });
      localStorage.setItem(`${key}_chunks`, chunks.length.toString());
      localStorage.removeItem(key);
    } else {
      // Save as single entry
      localStorage.setItem(key, jsonData);
      localStorage.removeItem(`${key}_chunks`);
      
      // Clear any existing chunks
      Object.keys(localStorage).forEach(storageKey => {
        if (storageKey.startsWith(`${key}_chunk_`)) {
          localStorage.removeItem(storageKey);
        }
      });
    }
    return true;
  } catch (error) {
    console.error(`Error writing to ${key}:`, error);
    return false;
  }
};

// Helper: Load chunked data
const getChunkedData = (key) => {
  try {
    const chunks = localStorage.getItem(`${key}_chunks`);
    
    if (chunks) {
      const chunkCount = parseInt(chunks);
      let fullData = '';
      for (let i = 0; i < chunkCount; i++) {
        fullData += localStorage.getItem(`${key}_chunk_${i}`) || '';
      }
      return JSON.parse(fullData);
    }
    
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading chunked data from ${key}:`, error);
    return [];
  }
};

const WorksheetService = {
  // ==========================================
  // TEMPLATE OPERATIONS
  // ==========================================

  /**
   * Get all worksheet templates
   */
  getAllTemplates: () => {
    return getChunkedData(STORAGE_KEYS.TEMPLATES);
  },

  /**
   * Get template by ID
   */
  getTemplateById: (templateId) => {
    const templates = WorksheetService.getAllTemplates();
    return templates.find(t => t.id === templateId);
  },

  /**
   * Get template by category ID
   * Returns the template for a specific category (one per category)
   */
  getTemplateByCategory: (categoryId) => {
    const templates = WorksheetService.getAllTemplates();
    return templates.find(t => t.categoryId === categoryId);
  },

  /**
   * Get all templates for a category (if multiple versions)
   */
  getTemplatesByCategory: (categoryId) => {
    const templates = WorksheetService.getAllTemplates();
    return templates.filter(t => t.categoryId === categoryId);
  },

  /**
   * Create new template
   */
  createTemplate: (templateData) => {
    try {
      if (!templateData.name || !templateData.categoryId) {
        return {
          success: false,
          message: 'Template name and category ID are required'
        };
      }

      if (!templateData.fields || templateData.fields.length === 0) {
        return {
          success: false,
          message: 'Template must have at least one field'
        };
      }

      const templates = WorksheetService.getAllTemplates();
      
      // Check if category already has a template
      const existingTemplate = templates.find(t => t.categoryId === templateData.categoryId);
      if (existingTemplate) {
        return {
          success: false,
          message: 'Category already has a worksheet template. Update existing or delete first.'
        };
      }

      const newTemplate = {
        id: `worksheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...templateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      templates.push(newTemplate);
      const saved = setStorageData(STORAGE_KEYS.TEMPLATES, templates);

      if (!saved) {
        return {
          success: false,
          message: 'Failed to save template to storage'
        };
      }

      return {
        success: true,
        template: newTemplate,
        message: 'Template created successfully'
      };
    } catch (error) {
      console.error('Error creating template:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  /**
   * Update template
   */
  updateTemplate: (templateId, updateData) => {
    try {
      const templates = WorksheetService.getAllTemplates();
      const index = templates.findIndex(t => t.id === templateId);

      if (index === -1) {
        return {
          success: false,
          message: 'Template not found'
        };
      }

      const updated = {
        ...templates[index],
        ...updateData,
        id: templateId, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };

      templates[index] = updated;
      const saved = setStorageData(STORAGE_KEYS.TEMPLATES, templates);

      if (!saved) {
        return {
          success: false,
          message: 'Failed to save template updates'
        };
      }

      return {
        success: true,
        template: updated,
        message: 'Template updated successfully'
      };
    } catch (error) {
      console.error('Error updating template:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  /**
   * Delete template
   */
  deleteTemplate: (templateId) => {
    try {
      const templates = WorksheetService.getAllTemplates();
      const filteredTemplates = templates.filter(t => t.id !== templateId);

      const saved = setStorageData(STORAGE_KEYS.TEMPLATES, filteredTemplates);

      if (!saved) {
        return {
          success: false,
          message: 'Failed to delete template'
        };
      }

      // Also delete all submissions for this template
      const submissions = WorksheetService.getAllSubmissions();
      const filteredSubmissions = submissions.filter(s => s.templateId !== templateId);
      setStorageData(STORAGE_KEYS.SUBMISSIONS, filteredSubmissions);

      return {
        success: true,
        message: 'Template deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting template:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  /**
   * Check if category has a template
   */
  hasTemplate: (categoryId) => {
    const template = WorksheetService.getTemplateByCategory(categoryId);
    return !!template;
  },

  // ==========================================
  // SUBMISSION OPERATIONS
  // ==========================================

  /**
   * Save submission
   */
  saveSubmission: (submissionData) => {
    try {
      if (!submissionData.taskId || !submissionData.userId || !submissionData.templateId) {
        return {
          success: false,
          message: 'Task ID, User ID, and Template ID are required'
        };
      }

      const submissions = getChunkedData(STORAGE_KEYS.SUBMISSIONS);

      const newSubmission = {
        id: `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...submissionData,
        status: submissionData.status || 'submitted',
        submittedAt: new Date().toISOString()
      };

      submissions.push(newSubmission);
      const saved = setStorageData(STORAGE_KEYS.SUBMISSIONS, submissions);

      if (!saved) {
        return {
          success: false,
          message: 'Failed to save submission'
        };
      }

      return {
        success: true,
        submission: newSubmission,
        message: 'Submission saved successfully'
      };
    } catch (error) {
      console.error('Error saving submission:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  /**
   * Get all submissions
   */
  getAllSubmissions: () => {
    return getChunkedData(STORAGE_KEYS.SUBMISSIONS);
  },

  /**
   * Get submissions by task ID
   */
  getSubmissionsByTask: (taskId) => {
    const submissions = WorksheetService.getAllSubmissions();
    return submissions.filter(s => s.taskId === taskId);
  },

  /**
   * Get submissions by user ID
   */
  getSubmissionsByUser: (userId) => {
    const submissions = WorksheetService.getAllSubmissions();
    return submissions.filter(s => s.userId === userId);
  },

  /**
   * Get submissions by template ID
   */
  getSubmissionsByTemplate: (templateId) => {
    const submissions = WorksheetService.getAllSubmissions();
    return submissions.filter(s => s.templateId === templateId);
  },

  /**
   * Get specific submission
   */
  getSubmissionById: (submissionId) => {
    const submissions = WorksheetService.getAllSubmissions();
    return submissions.find(s => s.id === submissionId);
  },

  /**
   * Update submission (for status changes, reviews, etc.)
   */
  updateSubmission: (submissionId, updateData) => {
    try {
      const submissions = WorksheetService.getAllSubmissions();
      const index = submissions.findIndex(s => s.id === submissionId);

      if (index === -1) {
        return {
          success: false,
          message: 'Submission not found'
        };
      }

      const updated = {
        ...submissions[index],
        ...updateData,
        id: submissionId,
        updatedAt: new Date().toISOString()
      };

      submissions[index] = updated;
      const saved = setStorageData(STORAGE_KEYS.SUBMISSIONS, submissions);

      if (!saved) {
        return {
          success: false,
          message: 'Failed to update submission'
        };
      }

      return {
        success: true,
        submission: updated
      };
    } catch (error) {
      console.error('Error updating submission:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  /**
   * Delete submission
   */
  deleteSubmission: (submissionId) => {
    try {
      const submissions = WorksheetService.getAllSubmissions();
      const filtered = submissions.filter(s => s.id !== submissionId);
      
      const saved = setStorageData(STORAGE_KEYS.SUBMISSIONS, filtered);

      if (!saved) {
        return {
          success: false,
          message: 'Failed to delete submission'
        };
      }

      return {
        success: true,
        message: 'Submission deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting submission:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // ==========================================
  // DRAFT OPERATIONS (Optional)
  // ==========================================

  /**
   * Save draft submission
   */
  saveDraft: (draftData) => {
    try {
      const drafts = getStorageData(STORAGE_KEYS.DRAFTS) || [];
      
      // Check if draft already exists
      const existingIndex = drafts.findIndex(
        d => d.taskId === draftData.taskId && d.userId === draftData.userId
      );

      const draftRecord = {
        id: draftData.id || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...draftData,
        savedAt: new Date().toISOString()
      };

      if (existingIndex !== -1) {
        drafts[existingIndex] = draftRecord;
      } else {
        drafts.push(draftRecord);
      }

      setStorageData(STORAGE_KEYS.DRAFTS, drafts);

      return {
        success: true,
        draft: draftRecord
      };
    } catch (error) {
      console.error('Error saving draft:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  /**
   * Get draft for task/user
   */
  getDraft: (taskId, userId) => {
    const drafts = getStorageData(STORAGE_KEYS.DRAFTS) || [];
    return drafts.find(d => d.taskId === taskId && d.userId === userId);
  },

  /**
   * Delete draft
   */
  deleteDraft: (taskId, userId) => {
    try {
      const drafts = getStorageData(STORAGE_KEYS.DRAFTS) || [];
      const filtered = drafts.filter(
        d => !(d.taskId === taskId && d.userId === userId)
      );
      setStorageData(STORAGE_KEYS.DRAFTS, filtered);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // ==========================================
  // STATISTICS & UTILITIES
  // ==========================================

  /**
   * Get template statistics
   */
  getTemplateStats: (templateId) => {
    const submissions = WorksheetService.getSubmissionsByTemplate(templateId);
    
    return {
      totalSubmissions: submissions.length,
      byStatus: {
        submitted: submissions.filter(s => s.status === 'submitted').length,
        draft: submissions.filter(s => s.status === 'draft').length,
        reviewed: submissions.filter(s => s.status === 'reviewed').length
      },
      lastSubmission: submissions.length > 0 
        ? submissions[submissions.length - 1].submittedAt 
        : null
    };
  },

  /**
   * Get task statistics
   */
  getTaskStats: (taskId) => {
    const submissions = WorksheetService.getSubmissionsByTask(taskId);
    
    return {
      totalSubmissions: submissions.length,
      uniqueUsers: new Set(submissions.map(s => s.userId)).size,
      byStatus: {
        submitted: submissions.filter(s => s.status === 'submitted').length,
        draft: submissions.filter(s => s.status === 'draft').length,
        reviewed: submissions.filter(s => s.status === 'reviewed').length
      }
    };
  },

  /**
   * Export all templates
   */
  exportTemplates: () => {
    return {
      templates: WorksheetService.getAllTemplates(),
      exportedAt: new Date().toISOString()
    };
  },

  /**
   * Export all submissions
   */
  exportSubmissions: () => {
    return {
      submissions: WorksheetService.getAllSubmissions(),
      exportedAt: new Date().toISOString()
    };
  },

  /**
   * Clear all data (use with caution)
   */
  clearAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
      localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
      localStorage.removeItem(STORAGE_KEYS.DRAFTS);
      
      // Clear chunks
      Object.keys(localStorage).forEach(key => {
        if (key.includes('_chunk_') && 
            (key.includes('worksheetTemplates') || 
             key.includes('worksheetSubmissions') || 
             key.includes('worksheetDrafts'))) {
          localStorage.removeItem(key);
        }
      });

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

export default WorksheetService;