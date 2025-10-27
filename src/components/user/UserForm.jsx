import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MdSave, 
  MdCancel, 
  MdPerson, 
  MdEmail, 
  MdVisibility, 
  MdVisibilityOff, 
  MdFolder,
  MdSearch,
  MdClose,
  MdExpandMore,
  MdExpandLess,
  MdCheckBox,
  MdCheckBoxOutlineBlank
} from 'react-icons/md';
import { FIELD_TYPES } from '../../utils/constants';

const UserForm = ({ 
  user = null, 
  roles = [], 
  positions = [], 
  categories = [], 
  userFields = [], 
  onSubmit, 
  onCancel,
  isDarkMode = false
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role_id: '',
    position_id: '',
    assigned_category_ids: [],
    status: 'active',
    custom_fields: {}
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category selector states
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [displayedCategoriesCount, setDisplayedCategoriesCount] = useState(20);
  const categoryDropdownRef = useRef(null);
  const categoryListRef = useRef(null);

  // Initialize form data
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        role_id: user.role_id || '',
        position_id: user.position_id || '',
        assigned_category_ids: Array.isArray(user.assigned_category_ids) 
          ? user.assigned_category_ids 
          : user.assigned_category_ids 
            ? [user.assigned_category_ids] 
            : [],
        status: user.status || 'active',
        custom_fields: user.custom_fields || {}
      });
    }
  }, [user]);

  // Filter categories based on search
  const filteredCategories = useCallback(() => {
    if (!categorySearch.trim()) return categories;
    
    const searchTerm = categorySearch.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm) ||
      cat.categoryId.toLowerCase().includes(searchTerm) ||
      cat.fullPath.toLowerCase().includes(searchTerm) ||
      (cat.description && cat.description.toLowerCase().includes(searchTerm))
    );
  }, [categories, categorySearch]);

  // Get visible categories with infinite scroll
  const visibleCategories = filteredCategories().slice(0, displayedCategoriesCount);

  // Infinite scroll handler
  const handleCategoryScroll = useCallback((e) => {
    const element = e.target;
    const scrollPercentage = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    
    if (scrollPercentage > 80 && displayedCategoriesCount < filteredCategories().length) {
      setDisplayedCategoriesCount(prev => Math.min(prev + 20, filteredCategories().length));
    }
  }, [displayedCategoriesCount, filteredCategories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset displayed count when search changes
  useEffect(() => {
    setDisplayedCategoriesCount(20);
  }, [categorySearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const newErrors = {};
    
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!user && !formData.password.trim()) newErrors.password = 'Password is required for new users';
    if (!formData.role_id) newErrors.role_id = 'Role is required';
    if (!formData.position_id) newErrors.position_id = 'Position is required';

    userFields.forEach(field => {
      if (field.is_required && !formData.custom_fields[field.field_name]) {
        newErrors[`custom_${field.field_name}`] = `${field.field_name} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await onSubmit(formData);
      if (result && !result.success) {
        setErrors({ submit: result.message || 'Failed to save user' });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save user' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (categoryId, isChecked) => {
    setFormData(prev => ({
      ...prev,
      assigned_category_ids: isChecked
        ? [...prev.assigned_category_ids, categoryId]
        : prev.assigned_category_ids.filter(id => id !== categoryId)
    }));
  };

  const handleCustomFieldChange = (fieldName, value, fieldType) => {
    let processedValue = value;
    
    if (fieldType === FIELD_TYPES.CHECKBOX) {
      processedValue = value === 'on' || value === true;
    } else if (fieldType === FIELD_TYPES.NUMBER) {
      processedValue = value === '' ? '' : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      custom_fields: {
        ...prev.custom_fields,
        [fieldName]: processedValue
      }
    }));
  };

  const renderCustomField = (field) => {
    const value = formData.custom_fields[field.field_name] || '';
    const error = errors[`custom_${field.field_name}`];

    const inputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    } ${error ? 'border-red-500 focus:ring-red-500' : ''}`;

    switch (field.field_type) {
      case FIELD_TYPES.TEXTAREA:
        return <textarea value={value} onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value, field.field_type)} className={inputClasses} rows="3" required={field.is_required} />;
      case FIELD_TYPES.NUMBER:
        return <input type="number" value={value} onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value, field.field_type)} className={inputClasses} required={field.is_required} />;
      case FIELD_TYPES.EMAIL:
        return <input type="email" value={value} onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value, field.field_type)} className={inputClasses} required={field.is_required} />;
      case FIELD_TYPES.DATE:
        return <input type="date" value={value} onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value, field.field_type)} className={inputClasses} required={field.is_required} />;
      case FIELD_TYPES.CHECKBOX:
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={value === true} onChange={(e) => handleCustomFieldChange(field.field_name, e.target.checked, field.field_type)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{field.field_name}</span>
          </label>
        );
      case FIELD_TYPES.DROPDOWN:
        return (
          <select value={value} onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value, field.field_type)} className={inputClasses} required={field.is_required}>
            <option value="">Select...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case FIELD_TYPES.RADIO:
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={field.field_name} value={option} checked={value === option} onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value, field.field_type)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" required={field.is_required} />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{option}</span>
              </label>
            ))}
          </div>
        );
      default:
        return <input type="text" value={value} onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value, field.field_type)} className={inputClasses} required={field.is_required} />;
    }
  };

  // Get selected category names
  const getSelectedCategoryNames = () => {
    return formData.assigned_category_ids
      .map(id => categories.find(c => c.id === id))
      .filter(Boolean)
      .map(c => c.name);
  };

  const inputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
    isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  }`;

  return (
    <div className={`w-full min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`}>
      <div className={`max-w-5xl mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl border ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b ${isDarkMode ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-750' : 'border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-3xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
                  <MdPerson size={32} className="text-white" />
                </div>
                {user ? 'Edit User' : 'Add New User'}
              </h2>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {user ? 'Update user information, roles, and category assignments' : 'Create a new user account with roles and category access'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6">
          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r flex items-start gap-3">
              <MdClose className="text-red-500 mt-0.5" size={20} />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Basic Information Section */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className={`w-1 h-6 rounded ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Username */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <MdPerson size={20} />
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`${inputClasses} pl-11 ${errors.username ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter username"
                    required
                  />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><MdClose size={14} />{errors.username}</p>}
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <MdEmail size={20} />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`${inputClasses} pl-11 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><MdClose size={14} />{errors.email}</p>}
              </div>
            </div>

            {/* Password */}
            <div className="mt-5">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Password {!user && <span className="text-red-500">*</span>}
                {user && <span className="text-xs ml-2 text-gray-500">(Leave blank to keep current password)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`${inputClasses} pr-11 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder={user ? "Leave blank to keep current password" : "Enter password"}
                  required={!user}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  } transition-colors`}
                >
                  {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><MdClose size={14} />{errors.password}</p>}
            </div>
          </div>

          {/* Role & Position Section */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className={`w-1 h-6 rounded ${isDarkMode ? 'bg-green-500' : 'bg-green-600'}`}></div>
              Role & Position
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className={`${inputClasses} ${errors.role_id ? 'border-red-500 focus:ring-red-500' : ''}`}
                  required
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                  ))}
                </select>
                {errors.role_id && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><MdClose size={14} />{errors.role_id}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Position <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.position_id}
                  onChange={(e) => setFormData({ ...formData, position_id: e.target.value })}
                  className={`${inputClasses} ${errors.position_id ? 'border-red-500 focus:ring-red-500' : ''}`}
                  required
                >
                  <option value="">Select a position</option>
                  {positions.map(position => (
                    <option key={position.position_id} value={position.position_id}>{position.position_name}</option>
                  ))}
                </select>
                {errors.position_id && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><MdClose size={14} />{errors.position_id}</p>}
              </div>
            </div>
          </div>

          {/* Advanced Category Selector Section */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className={`w-1 h-6 rounded ${isDarkMode ? 'bg-purple-500' : 'bg-purple-600'}`}></div>
              Category Assignments
            </h3>

            <div className="relative" ref={categoryDropdownRef}>
              {/* Category Selector Button */}
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className={`w-full px-4 py-3 border-2 rounded-lg flex items-center justify-between transition-all ${
                  showCategoryDropdown 
                    ? isDarkMode 
                      ? 'border-blue-500 bg-gray-700 ring-2 ring-blue-500 ring-opacity-30' 
                      : 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-30'
                    : isDarkMode
                      ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <MdFolder size={22} className={showCategoryDropdown ? 'text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  <div className="text-left flex-1">
                    {formData.assigned_category_ids.length === 0 ? (
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                        Select categories...
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {getSelectedCategoryNames().slice(0, 3).map((name, idx) => (
                          <span key={idx} className={`px-2 py-1 rounded text-xs font-medium ${
                            isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {name}
                          </span>
                        ))}
                        {formData.assigned_category_ids.length > 3 && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            +{formData.assigned_category_ids.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {showCategoryDropdown ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
              </button>

              {/* Category Dropdown with Search and Infinite Scroll */}
              {showCategoryDropdown && (
                <div className={`absolute z-50 w-full mt-2 rounded-lg shadow-2xl border-2 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                }`}>
                  {/* Search Bar */}
                  <div className={`p-3 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="relative">
                      <MdSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Search categories..."
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                      {categorySearch && (
                        <button
                          type="button"
                          onClick={() => setCategorySearch('')}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          <MdClose size={18} />
                        </button>
                      )}
                    </div>
                    
                    {/* Results count */}
                    <div className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {filteredCategories().length} categories found
                      {formData.assigned_category_ids.length > 0 && (
                        <span className="ml-2 font-medium text-blue-500">
                          • {formData.assigned_category_ids.length} selected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category List with Infinite Scroll */}
                  <div 
                    ref={categoryListRef}
                    onScroll={handleCategoryScroll}
                    className="max-h-80 overflow-y-auto custom-scrollbar"
                  >
                    {visibleCategories.length === 0 ? (
                      <div className="p-8 text-center">
                        <MdFolder size={48} className={`mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {categorySearch ? 'No categories match your search' : 'No categories available'}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {visibleCategories.map((category, index) => {
                          const isSelected = formData.assigned_category_ids.includes(category.id);
                          return (
                            <label
                              key={category.id}
                              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all mb-1 ${
                                isSelected
                                  ? isDarkMode 
                                    ? 'bg-blue-900/40 hover:bg-blue-900/50 border-2 border-blue-500' 
                                    : 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-300'
                                  : isDarkMode
                                    ? 'hover:bg-gray-600 border-2 border-transparent'
                                    : 'hover:bg-gray-50 border-2 border-transparent'
                              }`}
                            >
                              <div className="pt-0.5">
                                {isSelected ? (
                                  <MdCheckBox className="text-blue-500" size={20} />
                                ) : (
                                  <MdCheckBoxOutlineBlank className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} size={20} />
                                )}
                              </div>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                                className="hidden"
                              />
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                  {category.name}
                                </div>
                                <div className={`text-xs mt-1 flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                                    isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {category.categoryId}
                                  </span>
                                  {category.fullPath !== category.name && (
                                    <span className="truncate italic">
                                      {category.fullPath}
                                    </span>
                                  )}
                                </div>
                                {category.description && (
                                  <div className={`text-xs mt-1.5 line-clamp-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                                    {category.description}
                                  </div>
                                )}
                              </div>
                            </label>
                          );
                        })}
                        
                        {/* Loading indicator for infinite scroll */}
                        {displayedCategoriesCount < filteredCategories().length && (
                          <div className="py-4 text-center">
                            <div className={`inline-block animate-spin rounded-full h-6 w-6 border-b-2 ${
                              isDarkMode ? 'border-blue-400' : 'border-blue-600'
                            }`}></div>
                            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Loading more... ({displayedCategoriesCount} of {filteredCategories().length})
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className={`p-3 border-t flex items-center justify-between ${isDarkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formData.assigned_category_ids.length} categories selected
                    </div>
                    <div className="flex gap-2">
                      {formData.assigned_category_ids.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, assigned_category_ids: [] })}
                          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                            isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          Clear All
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowCategoryDropdown(false)}
                        className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Categories Display */}
            {formData.assigned_category_ids.length > 0 && (
              <div className={`mt-4 p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  SELECTED CATEGORIES ({formData.assigned_category_ids.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.assigned_category_ids.map(id => {
                    const cat = categories.find(c => c.id === id);
                    if (!cat) return null;
                    return (
                      <span
                        key={id}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                          isDarkMode ? 'bg-blue-900/40 text-blue-200 border border-blue-700' : 'bg-blue-100 text-blue-700 border border-blue-300'
                        }`}
                      >
                        <MdFolder size={14} />
                        {cat.name}
                        <button
                          type="button"
                          onClick={() => handleCategoryChange(id, false)}
                          className={`ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors`}
                        >
                          <MdClose size={14} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Status Section */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className={`w-1 h-6 rounded ${isDarkMode ? 'bg-yellow-500' : 'bg-yellow-600'}`}></div>
              Status
            </h3>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className={inputClasses}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Custom Fields */}
          {userFields.length > 0 && (
            <div className="mb-8">
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-1 h-6 rounded ${isDarkMode ? 'bg-orange-500' : 'bg-orange-600'}`}></div>
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {userFields.map(field => (
                  <div key={field.user_field_id}>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {field.field_name}
                      {field.is_required && <span className="text-red-500"> *</span>}
                    </label>
                    {renderCustomField(field)}
                    {errors[`custom_${field.field_name}`] && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <MdClose size={14} />{errors[`custom_${field.field_name}`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className={`flex justify-end gap-3 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              type="button"
              onClick={onCancel}
              className={`px-6 py-3 border-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600 hover:border-gray-500' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400'
              }`}
              disabled={isSubmitting}
            >
              <MdCancel size={20} />
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <MdSave size={20} />
              {isSubmitting ? 'Saving...' : (user ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#374151' : '#f1f5f9'};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#60a5fa' : '#3b82f6'};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#3b82f6' : '#2563eb'};
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default UserForm;