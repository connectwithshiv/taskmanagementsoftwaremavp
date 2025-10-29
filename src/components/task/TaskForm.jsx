// // components/TaskForm.jsx - Complete Task Form with ID Resolver

// import React, { useState, useEffect } from 'react';
// import { X, Save, AlertCircle } from 'lucide-react';
// import UserIdResolver from '../user/UserIdResolver';
// const TaskForm = ({ 
//   task = null, 
//   categories = [], 
//   users = [],
//   onSubmit, 
//   onCancel,
//   isEdit = false 
// }) => {
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     categoryId: '',
//     assignedTo: '',
//     priority: 'medium',
//     status: 'pending',
//     dueDate: '',
//     estimatedHours: '',
//     tags: ''
//   });

//   const [errors, setErrors] = useState({});
//   const [eligibleUsers, setEligibleUsers] = useState([]);

//   // Initialize form with task data if editing
//   useEffect(() => {
//     if (task) {
//       setFormData({
//         title: task.title || '',
//         description: task.description || '',
//         categoryId: task.categoryId || '',
//         assignedTo: task.assignedTo || '',
//         priority: task.priority || 'medium',
//         status: task.status || 'pending',
//         dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
//         estimatedHours: task.estimatedHours || '',
//         tags: task.tags?.join(', ') || ''
//       });
//     }
//   }, [task]);

//   // ✅ Update eligible users when category changes - WITH ID RESOLVER
//   useEffect(() => {
//     if (formData.categoryId) {
//       const eligible = users.filter(user => {
//         if (user.status !== 'active') return false;
//         if (!user.assigned_category_ids) return false;
        
//         // Check if user has 'all' categories access
//         if (user.assigned_category_ids.includes('all')) return true;
        
//         // Check if user is assigned to this category
//         return user.assigned_category_ids.includes(formData.categoryId);
//       });
      
//       console.log('📋 Eligible users for category:', formData.categoryId, eligible.length);
//       setEligibleUsers(eligible);
      
//       // ✅ Clear assigned user if not eligible (using ID resolver)
//       if (formData.assignedTo) {
//         const isStillEligible = eligible.some(u => {
//           const userId = UserIdResolver.getUserId(u);
//           return String(userId) === String(formData.assignedTo);
//         });
        
//         if (!isStillEligible) {
//           console.log('⚠️ Previously selected user not eligible, clearing selection');
//           setFormData(prev => ({ ...prev, assignedTo: '' }));
//         }
//       }
//     } else {
//       setEligibleUsers([]);
//       setFormData(prev => ({ ...prev, assignedTo: '' }));
//     }
//   }, [formData.categoryId, users]);

//   // Get category full path
//   const getCategoryPath = (categoryId) => {
//     const category = categories.find(c => c.id === categoryId);
//     if (!category) return '';
    
//     const getParentChain = (cat) => {
//       const chain = [cat.name];
//       let currentId = cat.parentId;
//       while (currentId) {
//         const parent = categories.find(c => c.id === currentId);
//         if (!parent) break;
//         chain.unshift(parent.name);
//         currentId = parent.parentId;
//       }
//       return chain.join(' > ');
//     };
    
//     return getParentChain(category);
//   };

//   // Validate form
//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.title.trim()) {
//       newErrors.title = 'Title is required';
//     }
    
//     if (!formData.categoryId) {
//       newErrors.categoryId = 'Category is required';
//     }
    
//     if (!formData.assignedTo) {
//       newErrors.assignedTo = 'Assigned user is required';
//     }
    
//     if (formData.estimatedHours && (isNaN(formData.estimatedHours) || formData.estimatedHours < 0)) {
//       newErrors.estimatedHours = 'Please enter a valid number';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // ✅ Handle form submission - WITH ID RESOLVER
//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     console.log('=== TASK FORM SUBMISSION (ID RESOLVER) ===');
//     console.log('Form assignedTo value:', formData.assignedTo);
    
//     // ✅ Find selected user using ID resolver
//     const selectedUser = UserIdResolver.findUserById(users, formData.assignedTo);
    
//     if (!selectedUser) {
//       console.error('❌ ERROR: No user found with ID:', formData.assignedTo);
//       console.error('Available users:', users.map(u => ({
//         id: u.id,
//         user_id: u.user_id,
//         username: u.username,
//         canonicalId: UserIdResolver.getUserId(u)
//       })));
//       alert('Error: Selected user not found. Please try again.');
//       return;
//     }
    
//     // ✅ Get canonical user ID using resolver
//     const assignedToId = UserIdResolver.getUserId(selectedUser);
//     const assignedToName = selectedUser.name || selectedUser.username;
    
//     console.log('✅ Selected user:', {
//       username: selectedUser.username,
//       canonicalId: assignedToId,
//       allIds: UserIdResolver.getAllUserIds(selectedUser)
//     });
    
//     const taskData = {
//       title: formData.title,
//       description: formData.description,
//       categoryId: formData.categoryId,
//       categoryPath: getCategoryPath(formData.categoryId),
//       assignedTo: assignedToId,  // ✅ Use canonical ID
//       assignedToName: assignedToName, // ✅ Use name for display
//       priority: formData.priority,
//       status: formData.status,
//       estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
//       tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
//       dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
//     };
    
//     console.log('✅ Final task data:', {
//       title: taskData.title,
//       assignedTo: taskData.assignedTo,
//       assignedToName: taskData.assignedToName,
//       categoryPath: taskData.categoryPath
//     });
//     console.log('==========================================');

//     onSubmit(taskData);
//   };

//   const handleChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
    
//     // Clear error for this field
//     if (errors[field]) {
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[field];
//         return newErrors;
//       });
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
//           <h2 className="text-2xl font-bold text-gray-800">
//             {isEdit ? 'Edit Task' : 'Create New Task'}
//           </h2>
//           <button
//             onClick={onCancel}
//             className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <X size={24} />
//           </button>
//         </div>
        
//         {/* Form */}
//         <div className="p-6">
//           <div className="space-y-5">
//             {/* Title */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Task Title <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) => handleChange('title', e.target.value)}
//                 className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                   errors.title ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 placeholder="Enter task title"
//               />
//               {errors.title && (
//                 <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                   <AlertCircle size={14} />
//                   {errors.title}
//                 </p>
//               )}
//             </div>
            
//             {/* Description */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Description
//               </label>
//               <textarea
//                 value={formData.description}
//                 onChange={(e) => handleChange('description', e.target.value)}
//                 rows={4}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter task description"
//               />
//             </div>
            
//             {/* Category and User Selection */}
//             <div className="grid grid-cols-2 gap-4">
//               {/* Category */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Category <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={formData.categoryId}
//                   onChange={(e) => handleChange('categoryId', e.target.value)}
//                   className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                     errors.categoryId ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 >
//                   <option value="">Select Category</option>
//                   {categories.map(cat => (
//                     <option key={cat.id} value={cat.id}>
//                       {getCategoryPath(cat.id)}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.categoryId && (
//                   <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                     <AlertCircle size={14} />
//                     {errors.categoryId}
//                   </p>
//                 )}
//               </div>
              
//               {/* ✅ Assigned User - WITH ID RESOLVER */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Assign To <span className="text-red-500">*</span>
//                   {formData.categoryId && (
//                     <span className="text-xs text-gray-500 ml-1">
//                       ({eligibleUsers.length} users available)
//                     </span>
//                   )}
//                 </label>
//                 <select
//                   value={formData.assignedTo}
//                   onChange={(e) => {
//                     const selectedId = e.target.value;
//                     console.log('👤 User selected from dropdown:', selectedId);
//                     handleChange('assignedTo', selectedId);
//                   }}
//                   disabled={!formData.categoryId}
//                   className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
//                     errors.assignedTo ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 >
//                   <option value="">
//                     {formData.categoryId ? 'Select User' : 'Select category first'}
//                   </option>
//                   {eligibleUsers.map(user => {
//                     // ✅ Use ID resolver to get canonical ID
//                     const userId = UserIdResolver.getUserId(user);
//                     const displayName = user.name || user.username;
//                     const displayEmail = user.email;
                    
//                     return (
//                       <option key={userId} value={userId}>
//                         {displayName} - {displayEmail}
//                       </option>
//                     );
//                   })}
//                 </select>
//                 {formData.categoryId && eligibleUsers.length === 0 && (
//                   <p className="text-amber-600 text-sm mt-1 flex items-center gap-1">
//                     <AlertCircle size={14} />
//                     No users assigned to this category
//                   </p>
//                 )}
//                 {errors.assignedTo && (
//                   <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                     <AlertCircle size={14} />
//                     {errors.assignedTo}
//                   </p>
//                 )}
//                 {/* Debug info - remove in production */}
//                 {formData.assignedTo && process.env.NODE_ENV === 'development' && (
//                   <p className="text-xs text-gray-400 mt-1">
//                     Debug: Selected ID = {formData.assignedTo}
//                   </p>
//                 )}
//               </div>
//             </div>
            
//             {/* Priority, Status, Due Date */}
//             <div className="grid grid-cols-3 gap-4">
//               {/* Priority */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Priority
//                 </label>
//                 <select
//                   value={formData.priority}
//                   onChange={(e) => handleChange('priority', e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="low">Low</option>
//                   <option value="medium">Medium</option>
//                   <option value="high">High</option>
//                   <option value="urgent">Urgent</option>
//                 </select>
//               </div>
              
//               {/* Status (only show when editing) */}
//               {isEdit && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Status
//                   </label>
//                   <select
//                     value={formData.status}
//                     onChange={(e) => handleChange('status', e.target.value)}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="pending">Pending</option>
//                     <option value="in-progress">In Progress</option>
//                     <option value="completed">Completed</option>
//                     <option value="cancelled">Cancelled</option>
//                   </select>
//                 </div>
//               )}
              
//               {/* Due Date */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Due Date
//                 </label>
//                 <input
//                   type="date"
//                   value={formData.dueDate}
//                   onChange={(e) => handleChange('dueDate', e.target.value)}
//                   min={new Date().toISOString().split('T')[0]}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>
            
//             {/* Estimated Hours and Tags */}
//             <div className="grid grid-cols-2 gap-4">
//               {/* Estimated Hours */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Estimated Hours
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   step="0.5"
//                   value={formData.estimatedHours}
//                   onChange={(e) => handleChange('estimatedHours', e.target.value)}
//                   className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                     errors.estimatedHours ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   placeholder="e.g., 8"
//                 />
//                 {errors.estimatedHours && (
//                   <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
//                     <AlertCircle size={14} />
//                     {errors.estimatedHours}
//                   </p>
//                 )}
//               </div>
              
//               {/* Tags */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Tags
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.tags}
//                   onChange={(e) => handleChange('tags', e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="e.g., urgent, frontend, bug-fix"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
//               </div>
//             </div>
//           </div>
          
//           {/* Form Actions */}
//           <div className="flex gap-3 mt-6 pt-6 border-t">
//             <button
//               onClick={handleSubmit}
//               className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
//             >
//               <Save size={20} />
//               {isEdit ? 'Update Task' : 'Create Task'}
//             </button>
//             <button
//               onClick={onCancel}
//               className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TaskForm;

// components/TaskForm.jsx - Task Form with Worksheet Template Selection

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import UserIdResolver from '../user/UserIdResolver';
import WorksheetService from '../../services/worksheetService';
const TaskForm = ({ 
  task = null, 
  categories = [], 
  users = [],
  onSubmit, 
  onCancel,
  isEdit = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    assignedTo: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    estimatedHours: '',
    tags: ''
  });

  const [errors, setErrors] = useState({});
  const [eligibleUsers, setEligibleUsers] = useState([]);
  
  // Worksheet template states
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [hasWorksheet, setHasWorksheet] = useState(false);

  // Initialize form with task data if editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        categoryId: task.categoryId || '',
        assignedTo: task.assignedTo || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        estimatedHours: task.estimatedHours || '',
        tags: task.tags?.join(', ') || ''
      });
    }
  }, [task]);

  // ==========================================
  // WORKSHEET TEMPLATE LOADING
  // ==========================================
  
  // Load worksheet template when category changes
  useEffect(() => {
    if (formData.categoryId) {
      loadWorksheetTemplate(formData.categoryId);
    } else {
      setSelectedTemplate(null);
      setHasWorksheet(false);
    }
  }, [formData.categoryId]);

  const loadWorksheetTemplate = (categoryId) => {
    setTemplateLoading(true);
    try {
      const template = WorksheetService.getTemplateByCategory(categoryId);
      
      if (template) {
        setSelectedTemplate(template);
        setHasWorksheet(true);
        console.log('✅ Worksheet template found:', {
          name: template.name,
          fields: template.fields.length
        });
      } else {
        setSelectedTemplate(null);
        setHasWorksheet(false);
        console.log('⚠️ No worksheet template for category:', categoryId);
      }
    } catch (error) {
      console.error('Error loading worksheet template:', error);
      setSelectedTemplate(null);
      setHasWorksheet(false);
    }
    setTemplateLoading(false);
  };

  // ==========================================
  // USER FILTERING BY CATEGORY
  // ==========================================

  // Update eligible users when category changes
  useEffect(() => {
    if (formData.categoryId) {
      const eligible = users.filter(user => {
        if (user.status !== 'active') return false;
        if (!user.assigned_category_ids) return false;
        
        // Check if user has 'all' categories access
        if (user.assigned_category_ids.includes('all')) return true;
        
        // Check if user is assigned to this category
        return user.assigned_category_ids.includes(formData.categoryId);
      });
      
      console.log('📋 Eligible users for category:', formData.categoryId, eligible.length);
      setEligibleUsers(eligible);
      
      // Clear assigned user if not eligible (using ID resolver)
      if (formData.assignedTo) {
        const isStillEligible = eligible.some(u => {
          const userId = UserIdResolver.getUserId(u);
          return String(userId) === String(formData.assignedTo);
        });
        
        if (!isStillEligible) {
          console.log('⚠️ Previously selected user not eligible, clearing selection');
          setFormData(prev => ({ ...prev, assignedTo: '' }));
        }
      }
    } else {
      setEligibleUsers([]);
      setFormData(prev => ({ ...prev, assignedTo: '' }));
    }
  }, [formData.categoryId, users]);

  // Get category full path
  const getCategoryPath = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    
    const getParentChain = (cat) => {
      const chain = [cat.name];
      let currentId = cat.parentId;
      while (currentId) {
        const parent = categories.find(c => c.id === currentId);
        if (!parent) break;
        chain.unshift(parent.name);
        currentId = parent.parentId;
      }
      return chain.join(' > ');
    };
    
    return getParentChain(category);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    
    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Assigned user is required';
    }
    
    if (formData.estimatedHours && (isNaN(formData.estimatedHours) || formData.estimatedHours < 0)) {
      newErrors.estimatedHours = 'Please enter a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('=== TASK FORM SUBMISSION ===');
    console.log('Form assignedTo value:', formData.assignedTo);
    
    // Find selected user using ID resolver
    const selectedUser = UserIdResolver.findUserById(users, formData.assignedTo);
    
    if (!selectedUser) {
      console.error('❌ ERROR: No user found with ID:', formData.assignedTo);
      alert('Error: Selected user not found. Please try again.');
      return;
    }
    
    // Get canonical user ID using resolver
    const assignedToId = UserIdResolver.getUserId(selectedUser);
    const assignedToName = selectedUser.name || selectedUser.username;
    
    console.log('✅ Selected user:', {
      username: selectedUser.username,
      canonicalId: assignedToId
    });
    
    const taskData = {
      title: formData.title,
      description: formData.description,
      categoryId: formData.categoryId,
      categoryPath: getCategoryPath(formData.categoryId),
      assignedTo: assignedToId,
      assignedToName: assignedToName,
      priority: formData.priority,
      status: formData.status,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      hasWorksheet: hasWorksheet,
      worksheetTemplateId: selectedTemplate?.id || null
    };
    
    console.log('✅ Final task data:', {
      title: taskData.title,
      assignedTo: taskData.assignedTo,
      assignedToName: taskData.assignedToName,
      hasWorksheet: taskData.hasWorksheet,
      worksheetTemplate: selectedTemplate?.name || 'None'
    });
    console.log('==============================');

    onSubmit(taskData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // ==========================================
  // RENDER WORKSHEET TEMPLATE SECTION
  // ==========================================

  const renderWorksheetSection = () => {
    if (!formData.categoryId) {
      return null;
    }

    if (templateLoading) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">Loading worksheet template...</span>
          </div>
        </div>
      );
    }

    if (hasWorksheet && selectedTemplate) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-900 flex items-center gap-2">
                <FileText size={16} />
                Worksheet Template Available
              </h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-green-800">
                  <strong>Template:</strong> {selectedTemplate.name}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Fields:</strong> {selectedTemplate.fields.length} field{selectedTemplate.fields.length !== 1 ? 's' : ''}
                </p>
                {selectedTemplate.description && (
                  <p className="text-sm text-green-700 italic mt-2">
                    {selectedTemplate.description}
                  </p>
                )}
              </div>
              <div className="mt-3 p-2 bg-white rounded text-xs text-green-700">
                <strong>ℹ️ Note:</strong> When you assign this task to a user, they will be prompted to fill out this worksheet.
              </div>
            </div>
          </div>
        </div>
      );
    }

    // No worksheet template found
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900">
              No Worksheet Template
            </h3>
            <p className="text-sm text-amber-800 mt-1">
              This category doesn't have a worksheet template. Users can still work on this task, but won't be asked to fill out a worksheet.
            </p>
            <p className="text-xs text-amber-700 mt-2">
              💡 Admin can add a template in the Worksheet Builder.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Form */}
        <div className="p-6">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.title}
                </p>
              )}
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task description"
              />
            </div>
            
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {getCategoryPath(cat.id)}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.categoryId}
                </p>
              )}
            </div>

            {/* ==========================================
                WORKSHEET TEMPLATE SECTION
                ========================================== */}
            {renderWorksheetSection()}

            {/* Category and User Selection */}
            <div className="grid grid-cols-2 gap-4">
              {/* Assigned User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To <span className="text-red-500">*</span>
                  {formData.categoryId && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({eligibleUsers.length} available)
                    </span>
                  )}
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    console.log('👤 User selected from dropdown:', selectedId);
                    handleChange('assignedTo', selectedId);
                  }}
                  disabled={!formData.categoryId}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                    errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">
                    {formData.categoryId ? 'Select User' : 'Select category first'}
                  </option>
                  {eligibleUsers.map(user => {
                    const userId = UserIdResolver.getUserId(user);
                    const displayName = user.name || user.username;
                    const displayEmail = user.email;
                    
                    return (
                      <option key={userId} value={userId}>
                        {displayName} - {displayEmail}
                      </option>
                    );
                  })}
                </select>
                {formData.categoryId && eligibleUsers.length === 0 && (
                  <p className="text-amber-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    No users assigned to this category
                  </p>
                )}
                {errors.assignedTo && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.assignedTo}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            
            {/* Priority, Status, Due Date */}
            <div className={`grid ${isEdit ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
              {/* Status (only show when editing) */}
              {isEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
              
              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Estimated Hours and Tags */}
            <div className="grid grid-cols-2 gap-4">
              {/* Estimated Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => handleChange('estimatedHours', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.estimatedHours ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 8"
                />
                {errors.estimatedHours && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.estimatedHours}
                  </p>
                )}
              </div>
              
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., urgent, frontend, bug-fix"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Save size={20} />
              {isEdit ? 'Update Task' : 'Create Task'}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;