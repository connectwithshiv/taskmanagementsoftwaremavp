import React, { useState, useMemo } from 'react';
import { MdCheck, MdArrowBack, MdNavigateNext, MdSave, MdClose, MdAdd, MdEdit, MdFolder, MdFolderOpen } from 'react-icons/md';
import { ValidationService } from '../../services/validationService';
import { CategoryService } from '../../services/categoryService';
import CustomFieldsEditor from './CustomFieldsEditor';

const AddCategoryPanel = ({ category, categories = [], roles = [], positions = [], currentUserId, onSave, onCancel, isDarkMode, parentCategoryId = null }) => {
  // ==================== STATE MANAGEMENT ====================
  const isEditMode = !!category;
  const [currentStep, setCurrentStep] = useState(1);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // Calculate hierarchy level based on parent - IMPROVED VERSION
  const calculateHierarchyLevel = (parentId) => {
    if (!parentId) return 0;
    const parent = categories.find(c => c.category_id === parentId || c.id === parentId);
    return parent ? (parent.hierarchy_level || parent.hierarchyLevel || 0) + 1 : 0;
  };

  // Initialize form data with proper parent handling
  const [formData, setFormData] = useState(() => {
    if (isEditMode && category) {
      // FIXED: Properly get parent_category_id for edit mode
      const parentId = category.parent_category_id || category.parentId || null;
      return {
        category_id: category.category_id || category.id,
        category_name: category.category_name || category.name || '',
        description: category.description || '',
        parent_category_id: parentId,
        hierarchy_level: calculateHierarchyLevel(parentId), // FIXED: Calculate based on parent
        fields: category.fields || [],
        fieldValues: category.fieldValues || {},
        
        // Access Control
        roles: category.roles || [],
        positions: category.positions || [],
        
        // Amount Configuration
        amount: category.amount || '',
        effective_from: category.effective_from || '',
        effective_to: category.effective_to || '',
        
        // Metadata
        created_by: category.created_by || currentUserId,
        created_at: category.created_at || new Date().toISOString()
      };
    }
    
    // FIXED: For new category, use parentCategoryId from props if available
    const parentId = parentCategoryId || null;
    return {
      category_name: '',
      description: '',
      parent_category_id: parentId,
      hierarchy_level: calculateHierarchyLevel(parentId),
      fields: [],
      fieldValues: {},
      roles: [],
      positions: [],
      amount: '',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '',
      created_by: currentUserId,
      created_at: new Date().toISOString()
    };
  });

  // ==================== STEP CONFIGURATION ====================
  const steps = [
    { id: 1, label: 'Basic Information', description: 'Name and description' },
    { id: 2, label: 'Hierarchy', description: 'Parent category selection' },
    { id: 3, label: 'Custom Fields', description: 'Define custom fields' },
    { id: 4, label: 'Access Control', description: 'Role & Position assignment' },
    { id: 5, label: 'Amount Configuration', description: 'Rate master setup' },
    { id: 6, label: 'Review & Save', description: 'Review and confirm' }
  ];

  // ==================== HANDLERS ====================
  const updateFormData = (updates) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      
      // FIXED: Update hierarchy level when parent changes
      if ('parent_category_id' in updates) {
        newData.hierarchy_level = calculateHierarchyLevel(updates.parent_category_id);
      }
      
      return newData;
    });
    
    // Clear errors for updated fields
    if (Object.keys(errors).length > 0) {
      const newErrors = { ...errors };
      Object.keys(updates).forEach(key => {
        delete newErrors[key];
      });
      setErrors(newErrors);
    }
  };

  const updateFieldValue = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      fieldValues: {
        ...prev.fieldValues,
        [fieldId]: value
      }
    }));
  };

  // ==================== VALIDATION ====================
  const validateStep = (step) => {
    const stepErrors = {};

    if (step === 1) {
      const categoryName = formData.category_name ? String(formData.category_name).trim() : '';
      const description = formData.description ? String(formData.description).trim() : '';
      
      if (!categoryName || categoryName.length === 0) {
        stepErrors.category_name = 'Category name is required';
      } else if (categoryName.length < 3) {
        stepErrors.category_name = 'Name must be at least 3 characters';
      } else if (categoryName.length > 255) {
        stepErrors.category_name = 'Name must not exceed 255 characters';
      }

      // Check for duplicate names
      const existingCategories = categories || [];
      const isDuplicate = existingCategories.some(c => {
        const cName = (c.category_name || c.name || '').toString().trim().toLowerCase();
        const formName = categoryName.toLowerCase();
        
        if (isEditMode) {
          const cId = c.category_id || c.id;
          const formId = formData.category_id;
          return cId !== formId && cName === formName;
        } else {
          return cName === formName;
        }
      });

      if (isDuplicate) {
        stepErrors.category_name = 'A category with this name already exists';
      }

      if (!description || description.length === 0) {
        stepErrors.description = 'Description is required';
      }
    }

    if (step === 5) {
      if (formData.amount !== '' && formData.amount !== null && formData.amount !== undefined) {
        const amountValue = parseFloat(formData.amount);
        if (isNaN(amountValue)) {
          stepErrors.amount = 'Amount must be a valid number';
        } else if (amountValue < 0) {
          stepErrors.amount = 'Amount must be greater than or equal to 0';
        }
      }

      if (formData.effective_from && formData.effective_to) {
        try {
          if (new Date(formData.effective_from) > new Date(formData.effective_to)) {
            stepErrors.effective_to = 'Effective To date must be after Effective From date';
          }
        } catch (e) {
          stepErrors.effective_to = 'Invalid date format';
        }
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // ==================== NAVIGATION ====================
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const saveData = {
        ...formData,
        updated_by: currentUserId,
        updated_at: new Date().toISOString()
      };

      await onSave(saveData);
    } catch (error) {
      setSaveError(error.message || 'Failed to save category');
      setIsSaving(false);
    }
  };

  // ==================== FIELD RENDERING ====================
  const renderFieldInput = (field) => {
    const value = formData.fieldValues?.[field.id] || '';
    const commonClass = `w-full px-3 py-2 rounded-lg text-sm transition-colors ${
      isDarkMode
        ? 'bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'
        : 'bg-white border border-slate-300 text-gray-900 placeholder-slate-400 focus:border-blue-500'
    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className={commonClass}
            rows="3"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className={commonClass}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className={commonClass}
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className={commonClass}
          />
        );

      case 'url':
        return (
          <input
            type="url"
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className={commonClass}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            className={commonClass}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            className={commonClass}
          >
            <option value="">Select {field.name.toLowerCase()}</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value === 'true' || value === true}
              onChange={(e) => updateFieldValue(field.id, e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              {field.placeholder || `Check for ${field.name.toLowerCase()}`}
            </span>
          </label>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className={commonClass}
          />
        );
    }
  };

  // ==================== UI COMPONENTS ====================
  const inputClass = `w-full px-4 py-2.5 rounded-lg text-sm transition-colors ${
    isDarkMode
      ? 'bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'
      : 'bg-white border border-slate-300 text-gray-900 placeholder-slate-400 focus:border-blue-500'
  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`;

  const labelClass = `block text-sm font-medium mb-2 ${
    isDarkMode ? 'text-slate-300' : 'text-gray-700'
  }`;

  // ==================== RENDER ====================
  return (
    <div className={`rounded-xl shadow-sm ${
      isDarkMode ? 'bg-slate-800' : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        isDarkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {isEditMode ? 'Edit Category' : 'Add New Category'}
            </h2>
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              {steps[currentStep - 1].description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MdFolder className={`w-8 h-8 ${
              isDarkMode ? 'text-slate-600' : 'text-slate-300'
            }`} />
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className={`px-6 py-4 border-b ${
        isDarkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : currentStep > step.id
                      ? isDarkMode
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-green-100 text-green-700'
                      : isDarkMode
                      ? 'bg-slate-700 text-slate-400'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {currentStep > step.id ? <MdCheck size={20} /> : step.id}
                </div>
                <span className={`ml-3 text-sm font-medium hidden lg:block ${
                  currentStep === step.id
                    ? isDarkMode ? 'text-white' : 'text-gray-900'
                    : isDarkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${
                  currentStep > step.id
                    ? 'bg-green-500'
                    : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {saveError && (
        <div className={`mx-6 mt-4 p-3 rounded-lg ${
          isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-50 text-red-700'
        }`}>
          <p className="text-sm">{saveError}</p>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className={labelClass}>
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.category_name}
                onChange={(e) => updateFormData({ category_name: e.target.value })}
                placeholder="Enter category name"
                className={inputClass}
              />
              {errors.category_name && (
                <p className="text-red-500 text-sm mt-1">{errors.category_name}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Enter category description"
                rows="4"
                className={inputClass}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Hierarchy */}
        {currentStep === 2 && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className={labelClass}>Parent Category</label>
              <select
                value={formData.parent_category_id || ''}
                onChange={(e) => updateFormData({ parent_category_id: e.target.value || null })}
                className={inputClass}
              >
                <option value="">Root Category (No Parent)</option>
                {categories
                  .filter(c => {
                    // Don't show self as parent option
                    const cId = c.category_id || c.id;
                    return cId !== formData.category_id;
                  })
                  .map(cat => (
                    <option 
                      key={cat.category_id || cat.id} 
                      value={cat.category_id || cat.id}
                    >
                      {'  '.repeat(cat.hierarchy_level || cat.hierarchyLevel || 0)}
                      {cat.category_name || cat.name}
                    </option>
                  ))}
              </select>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Hierarchy Level: {formData.hierarchy_level}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
            }`}>
              <h4 className={`font-medium mb-3 flex items-center gap-2 ${
                isDarkMode ? 'text-slate-200' : 'text-gray-700'
              }`}>
                <MdFolderOpen />
                Category Path
              </h4>
              {formData.parent_category_id ? (
                <div className="space-y-1">
                  {(() => {
                    const path = [];
                    let current = formData.parent_category_id;
                    while (current) {
                      const cat = categories.find(c => (c.category_id || c.id) === current);
                      if (cat) {
                        path.unshift(cat);
                        current = cat.parent_category_id || cat.parentId;
                      } else {
                        break;
                      }
                    }
                    return path.map((cat, index) => (
                      <div key={cat.category_id || cat.id} className="flex items-center gap-2">
                        <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {'└─'.padStart((index + 1) * 2, ' ')}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                          {cat.category_name || cat.name}
                        </span>
                      </div>
                    ));
                  })()}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {'└─'.padStart((formData.hierarchy_level + 1) * 2, ' ')}
                    </span>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formData.category_name || 'New Category'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  This will be a root-level category
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Custom Fields */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Custom Fields
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Define additional fields for this category
                </p>
              </div>
              <button
                onClick={() => setShowFieldEditor(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <MdAdd size={20} />
                Manage Fields
              </button>
            </div>

            {formData.fields?.length > 0 ? (
              <div className="space-y-4">
                {formData.fields.map(field => (
                  <div key={field.id} className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'
                  }`}>
                    <div className="mb-2">
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {field.name} {field.required && <span className="text-red-500">*</span>}
                      </label>
                    </div>
                    {renderFieldInput(field)}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 rounded-lg border-2 border-dashed ${
                isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-gray-400'
              }`}>
                <MdEdit size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No custom fields defined</p>
                <p className="text-sm mt-1">Click "Manage Fields" to add custom fields</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Access Control */}
        {currentStep === 4 && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className={labelClass}>Roles</label>
              <div className="space-y-2">
                {roles.map(role => (
                  <label key={role.role_id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role.role_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData({ roles: [...formData.roles, role.role_id] });
                        } else {
                          updateFormData({ roles: formData.roles.filter(r => r !== role.role_id) });
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      {role.role_name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Positions</label>
              <div className="space-y-2">
                {positions.map(position => (
                  <label key={position.position_id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.positions.includes(position.position_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData({ positions: [...formData.positions, position.position_id] });
                        } else {
                          updateFormData({ positions: formData.positions.filter(p => p !== position.position_id) });
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      {position.position_name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Amount Configuration */}
        {currentStep === 5 && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className={labelClass}>Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => updateFormData({ amount: e.target.value })}
                placeholder="0.00"
                className={inputClass}
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Effective From</label>
              <input
                type="date"
                value={formData.effective_from}
                onChange={(e) => updateFormData({ effective_from: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Effective To</label>
              <input
                type="date"
                value={formData.effective_to}
                onChange={(e) => updateFormData({ effective_to: e.target.value })}
                min={formData.effective_from}
                className={inputClass}
              />
              {errors.effective_to && (
                <p className="text-red-500 text-sm mt-1">{errors.effective_to}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 6: Review & Save */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className={`p-6 rounded-lg ${
              isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Review Category Details
              </h3>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                    Basic Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        Name:
                      </span>
                      <div className={`mt-1 font-medium ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        {formData.category_name}
                      </div>
                    </div>
                    <div>
                      <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        Description:
                      </span>
                      <div className={`mt-1 ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        {formData.description}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hierarchy */}
                <div>
                  <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                    Hierarchy
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        Parent:
                      </span>
                      <div className={`mt-1 font-medium ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        {formData.parent_category_id 
                          ? categories.find(c => (c.category_id || c.id) === formData.parent_category_id)?.category_name
                            || categories.find(c => (c.category_id || c.id) === formData.parent_category_id)?.name
                          : 'Root Category'}
                      </div>
                    </div>
                    <div>
                      <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        Level:
                      </span>
                      <div className={`mt-1 font-medium ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        {formData.hierarchy_level}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Access Control */}
                {(formData.roles.length > 0 || formData.positions.length > 0) && (
                  <div>
                    <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                      Access Control
                    </h4>
                    {formData.roles.length > 0 && (
                      <div className="mb-3">
                        <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          Roles:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {roles
                            .filter(r => formData.roles.includes(r.role_id))
                            .map(r => (
                              <span key={r.role_id} className={`px-3 py-1 rounded-full text-xs font-medium ${
                                isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {r.role_name}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                    {formData.positions.length > 0 && (
                      <div>
                        <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          Positions:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {positions
                            .filter(p => formData.positions.includes(p.position_id))
                            .map(p => (
                              <span key={p.position_id} className={`px-3 py-1 rounded-full text-xs font-medium ${
                                isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {p.position_name}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Amount Configuration */}
                {(formData.amount || formData.effective_from || formData.effective_to) && (
                  <div>
                    <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                      Amount Configuration
                    </h4>
                    <div className="space-y-2">
                      {formData.amount && (
                        <div>
                          <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                            Amount:
                          </span>
                          <div className={`mt-1 font-medium ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                            {typeof formData.amount === 'number' ? formData.amount.toFixed(2) : formData.amount || '0.00'}
                          </div>
                        </div>
                      )}
                      {(formData.effective_from || formData.effective_to) && (
                        <div>
                          <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                            Effective Period:
                          </span>
                          <div className={`mt-1 font-medium ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                            {formData.effective_from} {formData.effective_to && `to ${formData.effective_to}`}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Custom Fields */}
                {formData.fields?.length > 0 && (
                  <div>
                    <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                      Custom Fields
                    </h4>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      {formData.fields.length} field(s) configured
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'
            }`}>
              <p className={`text-sm flex items-start gap-2 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                <MdCheck className="mt-0.5" />
                {isEditMode 
                  ? 'All information looks correct. Click "Update Category" to save changes.'
                  : 'All information looks correct. Click "Save Category" to create this category.'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={`flex justify-between gap-3 px-6 py-4 border-t ${
        isDarkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            isSaving
              ? 'opacity-50 cursor-not-allowed'
              : ''
          } ${
            isDarkMode
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          <MdArrowBack size={20} />
          Cancel
        </button>

        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              disabled={isSaving}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                isDarkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Previous
            </button>
          )}

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              disabled={isSaving}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Next
              <MdNavigateNext size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                isEditMode
                  ? isDarkMode
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                  : isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <MdSave size={20} />
              {isSaving ? 'Saving...' : (isEditMode ? 'Update Category' : 'Save Category')}
            </button>
          )}
        </div>
      </div>

      {/* Custom Fields Editor Modal */}
      {showFieldEditor && (
        <CustomFieldsEditor
          category={formData}
          onUpdate={(fields) => updateFormData({ fields })}
          onClose={() => setShowFieldEditor(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default AddCategoryPanel;