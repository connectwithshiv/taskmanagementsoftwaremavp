import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';

const CustomFieldValuesEditor = ({ category, onClose, isDarkMode }) => {
  const [fieldValues, setFieldValues] = useState(() => {
    const values = {};
    category?.fields?.forEach(field => {
      values[field.id] = '';
    });
    return values;
  });

  const renderFieldInput = (field) => {
    const value = fieldValues[field.id] || '';
    const commonClass = `w-full px-3 py-2 rounded ${
      isDarkMode ? 'bg-slate-800 border border-slate-600 text-white' : 'bg-white border border-slate-300 text-gray-900'
    }`;
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setFieldValues({...fieldValues, [field.id]: e.target.value})}
            className={commonClass}
            rows="3"
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        );
      
      case 'dropdown':
        return (
          <select
            value={value}
            onChange={(e) => setFieldValues({...fieldValues, [field.id]: e.target.value})}
            className={commonClass}
          >
            <option value="">Select...</option>
            {field.options?.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((opt, idx) => (
              <label key={idx} className={`flex gap-2 cursor-pointer ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <input
                  type="radio"
                  name={field.id}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => setFieldValues({...fieldValues, [field.id]: e.target.value})}
                />
                {opt}
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <label className={`flex gap-2 cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => setFieldValues({...fieldValues, [field.id]: e.target.checked ? 'true' : 'false'})}
            />
            Yes
          </label>
        );
      
      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => setFieldValues({...fieldValues, [field.id]: e.target.value})}
            className={commonClass}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'
      }`}>
        <div className={`p-6 border-b sticky top-0 flex justify-between items-center ${
          isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'
        }`}>
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Field Values: {category?.name}
          </h3>
          <button 
            onClick={onClose} 
            className={isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-gray-900'}
          >
            <MdClose size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {category?.fields && category.fields.length > 0 ? (
            category.fields.map(field => (
              <div key={field.id}>
                <label className={`text-sm font-medium block mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderFieldInput(field)}
              </div>
            ))
          ) : (
            <div className={`text-center py-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              <p className="text-sm">No custom fields defined for this category</p>
            </div>
          )}

          <button 
            onClick={onClose} 
            className={`w-full px-4 py-2 rounded-lg font-medium ${
              isDarkMode ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-slate-300 hover:bg-slate-400 text-gray-900'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomFieldValuesEditor;