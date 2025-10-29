// // components/worksheet/WorksheetSubmission.jsx - User Worksheet Submission Form

// import React, { useState, useEffect } from 'react';
// import { Send, AlertCircle, X, Save } from 'lucide-react';
// import WorksheetService from '../../services/worksheetService';

// /**
//  * FieldRenderer - Renders form fields based on type
//  */
// const FieldRenderer = ({ field, value, error, onChange }) => {
//   const commonProps = {
//     className: `w-full px-3 py-2 border rounded text-sm ${error ? 'border-red-500' : 'border-gray-300'}`
//   };

//   switch (field.type) {
//     case 'text':
//       return (
//         <input
//           type="text"
//           {...commonProps}
//           placeholder={field.placeholder}
//           value={value || ''}
//           onChange={(e) => onChange(e.target.value)}
//         />
//       );

//     case 'textarea':
//       return (
//         <textarea
//           {...commonProps}
//           placeholder={field.placeholder}
//           value={value || ''}
//           onChange={(e) => onChange(e.target.value)}
//           rows="4"
//         />
//       );

//     case 'number':
//       return (
//         <input
//           type="number"
//           {...commonProps}
//           placeholder={field.placeholder}
//           value={value || ''}
//           onChange={(e) => onChange(e.target.value)}
//         />
//       );

//     case 'date':
//       return (
//         <input
//           type="date"
//           {...commonProps}
//           value={value || ''}
//           onChange={(e) => onChange(e.target.value)}
//         />
//       );

//     case 'file':
//       return (
//         <input
//           type="file"
//           className="w-full text-sm"
//           onChange={(e) => onChange(e.target.files[0]?.name || '')}
//         />
//       );

//     case 'dropdown':
//       return (
//         <select
//           {...commonProps}
//           value={value || ''}
//           onChange={(e) => onChange(e.target.value)}
//         >
//           <option value="">-- Select --</option>
//           {field.options.map((opt, i) => (
//             <option key={i} value={opt}>{opt}</option>
//           ))}
//         </select>
//       );

//     case 'radio':
//       return (
//         <div className="space-y-2">
//           {field.options.map((opt, i) => (
//             <label key={i} className="flex items-center gap-2">
//               <input
//                 type="radio"
//                 name={field.id}
//                 value={opt}
//                 checked={value === opt}
//                 onChange={(e) => onChange(e.target.value)}
//               />
//               <span className="text-sm">{opt}</span>
//             </label>
//           ))}
//         </div>
//       );

//     case 'checkbox':
//       return (
//         <div className="space-y-2">
//           {field.options.map((opt, i) => {
//             const isChecked = Array.isArray(value) ? value.includes(opt) : false;
//             return (
//               <label key={i} className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   checked={isChecked}
//                   onChange={(e) => {
//                     const checked = e.target.checked;
//                     const newValue = Array.isArray(value) ? [...value] : [];
//                     if (checked) {
//                       if (!newValue.includes(opt)) newValue.push(opt);
//                     } else {
//                       newValue = newValue.filter(v => v !== opt);
//                     }
//                     onChange(newValue);
//                   }}
//                 />
//                 <span className="text-sm">{opt}</span>
//               </label>
//             );
//           })}
//         </div>
//       );

//     default:
//       return (
//         <input
//           type="text"
//           {...commonProps}
//           placeholder={field.placeholder}
//           value={value || ''}
//           onChange={(e) => onChange(e.target.value)}
//         />
//       );
//   }
// };

// /**
//  * WorksheetSubmission - Main component for users to submit worksheets
//  */
// const WorksheetSubmission = ({ 
//   taskId, 
//   categoryId, 
//   userId, 
//   onSubmit, 
//   onClose,
//   showDraftOption = true 
// }) => {
//   const [template, setTemplate] = useState(null);
//   const [formData, setFormData] = useState({});
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [hasDraft, setHasDraft] = useState(false);

//   // Load template and draft on mount
//   useEffect(() => {
//     loadTemplate();
//   }, [categoryId]);

//   const loadTemplate = () => {
//     setLoading(true);
//     try {
//       const worksheetTemplate = WorksheetService.getTemplateByCategory(categoryId);
      
//       if (worksheetTemplate) {
//         setTemplate(worksheetTemplate);
        
//         // Check for existing draft
//         const draft = WorksheetService.getDraft(taskId, userId);
//         if (draft) {
//           setFormData(draft.data);
//           setHasDraft(true);
//         } else {
//           // Initialize with default values
//           const initialData = {};
//           worksheetTemplate.fields.forEach(field => {
//             initialData[field.id] = field.defaultValue || '';
//           });
//           setFormData(initialData);
//         }
//       }
//     } catch (error) {
//       console.error('Error loading template:', error);
//     }
//     setLoading(false);
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!template) return true;

//     template.fields.forEach(field => {
//       const value = formData[field.id];
      
//       // Check required fields
//       if (field.required) {
//         if (!value || (Array.isArray(value) && value.length === 0)) {
//           newErrors[field.id] = 'This field is required';
//         }
//       }

//       // Type-specific validation
//       if (value && field.type === 'number') {
//         if (isNaN(value)) {
//           newErrors[field.id] = 'Must be a number';
//         }
//       }

//       if (value && field.type === 'email') {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(value)) {
//           newErrors[field.id] = 'Invalid email address';
//         }
//       }
//     });

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSaveDraft = () => {
//     if (!template) return;

//     const draft = {
//       taskId,
//       userId,
//       templateId: template.id,
//       data: formData
//     };

//     const result = WorksheetService.saveDraft(draft);
//     if (result.success) {
//       setHasDraft(true);
//       alert('Draft saved successfully');
//     } else {
//       alert('Error saving draft: ' + result.message);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     if (!template) return;

//     setSubmitting(true);
//     try {
//       const submission = {
//         taskId,
//         templateId: template.id,
//         templateName: template.name,
//         categoryId,
//         userId,
//         data: formData,
//         status: 'submitted'
//       };

//       const result = WorksheetService.saveSubmission(submission);
      
//       if (result.success) {
//         // Delete draft if exists
//         WorksheetService.deleteDraft(taskId, userId);
        
//         onSubmit?.(result.submission);
//         alert('Worksheet submitted successfully!');
//         onClose?.();
//       } else {
//         alert('Error: ' + result.message);
//       }
//     } catch (error) {
//       console.error('Error submitting:', error);
//       alert('Failed to submit worksheet');
//     }
//     setSubmitting(false);
//   };

//   const updateField = (fieldId, value) => {
//     setFormData({
//       ...formData,
//       [fieldId]: value
//     });
//     // Clear error for this field
//     if (errors[fieldId]) {
//       setErrors({
//         ...errors,
//         [fieldId]: null
//       });
//     }
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg p-4">
//           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
//           <p className="mt-2 text-gray-600">Loading worksheet...</p>
//         </div>
//       </div>
//     );
//   }

//   // No template state
//   if (!template) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-lg p-6 text-center max-w-sm">
//           <AlertCircle size={32} className="mx-auto text-gray-400 mb-2" />
//           <p className="text-gray-600 mb-4">No worksheet template found for this category</p>
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Form render
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="bg-green-600 text-white p-4 flex justify-between items-center">
//           <div>
//             <h2 className="text-xl font-bold">{template.name}</h2>
//             {template.description && (
//               <p className="text-sm text-green-100 mt-1">{template.description}</p>
//             )}
//             {hasDraft && (
//               <p className="text-xs text-green-200 mt-1">📝 Draft saved</p>
//             )}
//           </div>
//           <button
//             onClick={onClose}
//             className="p-1 hover:bg-green-700 rounded"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* Form Fields */}
//         <div className="flex-1 overflow-auto p-4">
//           <div className="space-y-4">
//             {template.fields.map((field) => (
//               <div key={field.id}>
//                 <label className="block text-sm font-medium mb-2">
//                   {field.label}
//                   {field.required && <span className="text-red-600 ml-1">*</span>}
//                 </label>

//                 <FieldRenderer
//                   field={field}
//                   value={formData[field.id]}
//                   error={errors[field.id]}
//                   onChange={(value) => updateField(field.id, value)}
//                 />

//                 {errors[field.id] && (
//                   <p className="text-red-600 text-xs mt-1">{errors[field.id]}</p>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="border-t p-4 flex justify-end gap-2">
//           {showDraftOption && (
//             <button
//               onClick={handleSaveDraft}
//               disabled={submitting}
//               className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
//             >
//               <Save size={16} /> Save Draft
//             </button>
//           )}
          
//           <button
//             onClick={onClose}
//             disabled={submitting}
//             className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handleSubmit}
//             disabled={submitting}
//             className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
//           >
//             <Send size={16} /> 
//             {submitting ? 'Submitting...' : 'Submit'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WorksheetSubmission;
import React, { useState, useEffect } from 'react';
import { FileText, X, Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';

/**
 * ==========================================
 * WORKSHEET SUBMISSION FORM COMPONENT
 * ==========================================
 * Renders dynamic form based on worksheet template
 * Allows users to fill and submit worksheets for tasks
 */
export const WorksheetSubmissionForm = ({ 
  task, 
  template, 
  onSubmit, 
  onCancel,
  isDarkMode = false 
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Initialize form with empty fields
  useEffect(() => {
    if (template && template.fields) {
      const initialData = {};
      template.fields.forEach(field => {
        initialData[field.id] = field.defaultValue || '';
      });
      setFormData(initialData);
    }
  }, [template]);

  // Validate field based on type
  const validateField = (field, value) => {
    if (field.required && !value) {
      return `${field.label} is required`;
    }

    switch (field.type) {
      case 'number':
        if (value && isNaN(value)) return `${field.label} must be a number`;
        if (field.validation?.min !== undefined && value < field.validation.min) {
          return `${field.label} must be at least ${field.validation.min}`;
        }
        if (field.validation?.max !== undefined && value > field.validation.max) {
          return `${field.label} must be at most ${field.validation.max}`;
        }
        break;

      case 'text':
        if (field.validation?.pattern === 'url' && value) {
          try {
            new URL(value);
          } catch {
            return `${field.label} must be a valid URL`;
          }
        }
        break;

      case 'dropdown':
        if (field.required && (!value || value === '')) {
          return `${field.label} is required`;
        }
        break;

      default:
        break;
    }

    return null;
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    
    template.fields.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field change
  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const submissionData = {
        taskId: task.id,
        templateId: template.id,
        templateName: template.name,
        categoryId: task.categoryId,
        data: formData
      };

      await onSubmit(submissionData);
      setSubmitStatus('success');
      
      setTimeout(() => {
        onCancel();
      }, 1500);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render field based on type
  const renderField = (field) => {
    const baseInputClass = `w-full px-4 py-2 rounded-lg border ${
      errors[field.id]
        ? 'border-red-500 focus:ring-red-500'
        : isDarkMode
          ? 'border-slate-600 focus:ring-blue-500'
          : 'border-gray-300 focus:ring-blue-500'
    } ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-white'} focus:ring-2 focus:outline-none`;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            className={baseInputClass}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            min={field.validation?.min}
            max={field.validation?.max}
            step={field.validation?.decimal ? '0.01' : '1'}
            className={baseInputClass}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClass}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            rows={4}
            className={baseInputClass}
          />
        );

      case 'dropdown':
        return (
          <select
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClass}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
            isDarkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-300 bg-white'
          }`}>
            <input
              type="checkbox"
              checked={formData[field.id] === true}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="w-5 h-5 accent-blue-500 rounded"
            />
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              {field.label}
            </span>
          </label>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <label key={idx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                formData[field.id] === option
                  ? isDarkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50'
                  : isDarkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-300 bg-white'
              }`}>
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 border-b px-6 py-4 flex justify-between items-center ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <FileText className="text-blue-500" size={24} />
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {template?.name}
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Task: {task?.title}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            <X size={24} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {template?.description && (
            <div className={`mb-6 p-4 rounded-lg ${
              isDarkMode ? 'bg-slate-700' : 'bg-blue-50'
            }`}>
              <p className={isDarkMode ? 'text-gray-300' : 'text-blue-900'}>
                {template.description}
              </p>
            </div>
          )}

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 rounded-lg bg-green-100 border border-green-300">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <p className="text-green-800 font-medium">
                  ✅ Worksheet submitted successfully!
                </p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-300">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-red-800 font-medium">
                  ❌ Error submitting worksheet. Please try again.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {template?.fields?.map((field) => (
              <div key={field.id}>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {renderField(field)}

                {errors[field.id] && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors[field.id]}
                  </p>
                )}
              </div>
            ))}

            {/* Submit Actions */}
            <div className={`flex gap-3 pt-6 border-t ${
              isDarkMode ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                  isSubmitting
                    ? 'opacity-50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Worksheet
                  </>
                )}
              </button>
              <button
                onClick={onCancel}
                disabled={isSubmitting}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                } disabled:opacity-50`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ==========================================
 * TASK CARD WITH WORKSHEET INDICATOR
 * ==========================================
 * Enhanced task card showing worksheet status
 */
export const TaskCardWithWorksheet = ({ 
  task, 
  onStatusChange, 
  onViewWorksheet,
  isDarkMode = false 
}) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className={`p-6 rounded-lg ${
      isDarkMode ? 'bg-slate-800' : 'bg-white'
    } shadow hover:shadow-lg transition-shadow ${
      isOverdue ? 'border-2 border-red-500' : ''
    }`}>
      <div className="flex items-start justify-between gap-4">
        {/* Task Info */}
        <div className="flex-1 space-y-3">
          {/* Title */}
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}

          {/* Worksheet Indicator */}
          {task.hasWorksheet && task.worksheetTemplateId && (
            <div className="p-3 rounded-lg bg-green-100 border border-green-300">
              <div className="flex items-center gap-2">
                <FileText className="text-green-600" size={18} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    ✓ Worksheet Required
                  </p>
                  <p className="text-xs text-green-800">
                    Complete the worksheet to finish this task
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            {task.dueDate && (
              <span className={isOverdue ? 'text-red-500 font-medium' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {task.priority && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority?.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {task.hasWorksheet && task.worksheetTemplateId && (
            <button
              onClick={() => onViewWorksheet(task)}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <FileText size={16} />
              Fill Worksheet
            </button>
          )}

          <button
            onClick={() => onStatusChange(task.id, 'in-progress')}
            disabled={task.status === 'in-progress'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              task.status === 'in-progress'
                ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Start
          </button>

          <button
            onClick={() => onStatusChange(task.id, 'completed')}
            disabled={task.status === 'completed'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              task.status === 'completed'
                ? 'bg-green-100 text-green-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ==========================================
 * USER TASK LIST WITH WORKSHEET SUPPORT
 * ==========================================
 * Main component for user task list with worksheet integration
 */
export const UserTaskListWithWorksheet = ({ 
  currentUser, 
  categories = [],
  isDarkMode = false,
  selectedCategoryId = null
}) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [worksheetTemplate, setWorksheetTemplate] = useState(null);
  const [showWorksheetForm, setShowWorksheetForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load tasks assigned to current user
  const loadMyTasks = () => {
    setLoading(true);
    try {
      const allTasks = window.TaskService?.getAllTasks?.() || [];
      
      const myTasks = allTasks.filter(task => 
        task.assignedTo === (currentUser.id || currentUser.user_id)
      );
      
      setTasks(myTasks);
      console.log(`Loaded ${myTasks.length} tasks for ${currentUser.username}`);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...tasks];

    if (selectedCategoryId) {
      result = result.filter(t => t.categoryId === selectedCategoryId);
    }

    if (filterStatus !== 'all') {
      result = result.filter(t => t.status === filterStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
      );
    }

    setFilteredTasks(result);
  }, [tasks, filterStatus, searchTerm, selectedCategoryId]);

  // Load tasks on mount
  useEffect(() => {
    loadMyTasks();
  }, [currentUser]);

  // Handle view worksheet
  const handleViewWorksheet = (task) => {
    try {
      const template = window.WorksheetService?.getTemplateByCategory?.(task.categoryId);
      
      if (template) {
        setSelectedTask(task);
        setWorksheetTemplate(template);
        setShowWorksheetForm(true);
        console.log('Worksheet template loaded:', template.name);
      } else {
        console.error('No worksheet template found for category:', task.categoryId);
        alert('Worksheet template not found');
      }
    } catch (error) {
      console.error('Error loading worksheet template:', error);
      alert('Error loading worksheet');
    }
  };

  // Handle worksheet submission
  const handleWorksheetSubmit = async (submissionData) => {
    try {
      const result = window.WorksheetService?.saveSubmission?.(submissionData);
      
      if (result?.success) {
        console.log('✅ Worksheet submitted successfully');
        
        window.TaskService?.addWorksheetSubmission?.(
          submissionData.taskId,
          result.submissionId
        );
        
        setShowWorksheetForm(false);
        loadMyTasks();
        alert('✅ Worksheet submitted successfully!');
      } else {
        throw new Error(result?.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      throw error;
    }
  };

  // Handle status change
  const handleStatusChange = (taskId, newStatus) => {
    try {
      const result = window.TaskService?.updateTaskStatus?.(
        taskId,
        newStatus,
        currentUser.id || currentUser.user_id
      );

      if (result?.success) {
        loadMyTasks();
        console.log(`✅ Task status updated to ${newStatus}`);
      } else {
        alert(`Error: ${result?.message || 'Failed to update task'}`);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Error updating task status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          My Tasks
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className={`flex-1 min-w-[200px] px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-slate-700 border-slate-600 text-white' 
                : 'bg-white border-gray-300'
            } focus:ring-2 focus:ring-blue-500`}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-slate-700 border-slate-600 text-white' 
                : 'bg-white border-gray-300'
            } focus:ring-2 focus:ring-blue-500`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <Loader className="animate-spin mx-auto text-blue-500" size={40} />
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading tasks...
            </p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          } shadow`}>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No tasks assigned to you yet
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCardWithWorksheet
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onViewWorksheet={handleViewWorksheet}
              isDarkMode={isDarkMode}
            />
          ))
        )}
      </div>

      {/* Worksheet Submission Modal */}
      {showWorksheetForm && selectedTask && worksheetTemplate && (
        <WorksheetSubmissionForm
          task={selectedTask}
          template={worksheetTemplate}
          onSubmit={handleWorksheetSubmit}
          onCancel={() => {
            setShowWorksheetForm(false);
            setSelectedTask(null);
            setWorksheetTemplate(null);
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default UserTaskListWithWorksheet;