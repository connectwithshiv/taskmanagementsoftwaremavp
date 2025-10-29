// components/worksheet/WorksheetBuilder.jsx - Admin Worksheet Builder UI

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Eye, ChevronUp, ChevronDown, Copy } from 'lucide-react';
import WorksheetService from '../../services/worksheetService';

// Field type definitions
const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'file', label: 'File Upload' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Button' }
];

/**
 * FieldEditor - Component to edit individual fields
 */
const FieldEditor = ({ field, index, totalFields, onUpdate, onDelete, onMove, onDuplicate }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border rounded-lg bg-white mb-3">
      {/* Field Header */}
      <div className="bg-gray-50 p-3 flex items-center gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 hover:bg-gray-200 rounded"
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <span className="text-sm font-medium text-gray-700 flex-1">
          {field.label || `Field ${index + 1}`}
        </span>

        {field.required && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
            Required
          </span>
        )}

        <div className="flex gap-1">
          <button
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={index === totalFields - 1}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
          >
            <ChevronDown size={16} />
          </button>
          <button onClick={onDuplicate} className="p-1 hover:bg-gray-200 rounded">
            <Copy size={16} />
          </button>
          <button onClick={onDelete} className="p-1 hover:bg-red-100 text-red-600 rounded">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Field Content */}
      {expanded && (
        <div className="p-4 space-y-3 border-t">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Field Label *</label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="e.g., Project Name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Field Type</label>
              <select
                value={field.type}
                onChange={(e) => onUpdate({ type: e.target.value })}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                {FIELD_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Placeholder</label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Default Value</label>
              <input
                type="text"
                value={field.defaultValue || ''}
                onChange={(e) => onUpdate({ defaultValue: e.target.value })}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>

          {/* Options for dropdown/radio/checkbox */}
          {['dropdown', 'radio', 'checkbox'].includes(field.type) && (
            <div>
              <label className="block text-xs font-medium mb-1">Options (one per line)</label>
              <textarea
                value={(field.options || []).join('\n')}
                onChange={(e) => onUpdate({ options: e.target.value.split('\n').filter(o => o.trim()) })}
                className="w-full px-2 py-1 border rounded text-sm"
                rows="3"
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Required field</span>
          </label>
        </div>
      )}
    </div>
  );
};

/**
 * WorksheetBuilder - Main component for admin to create/edit worksheet templates
 */
const WorksheetBuilder = ({ onClose, categories = [] }) => {
  const [mode, setMode] = useState('list'); // 'list' or 'edit'
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    fields: []
  });

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const data = WorksheetService.getAllTemplates();
    setTemplates(data);
  };

  const startNewTemplate = () => {
    setFormData({
      name: '',
      categoryId: '',
      description: '',
      fields: []
    });
    setSelectedTemplate(null);
    setMode('edit');
  };

  const editTemplate = (template) => {
    setFormData({ ...template });
    setSelectedTemplate(template);
    setMode('edit');
  };

  const saveTemplate = () => {
    if (!formData.name.trim()) {
      alert('Please enter template name');
      return;
    }
    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }
    if (formData.fields.length === 0) {
      alert('Please add at least one field');
      return;
    }

    if (selectedTemplate) {
      const result = WorksheetService.updateTemplate(selectedTemplate.id, formData);
      if (result.success) {
        loadTemplates();
        setMode('list');
        alert('Template updated successfully');
      } else {
        alert('Error: ' + result.message);
      }
    } else {
      const result = WorksheetService.createTemplate(formData);
      if (result.success) {
        loadTemplates();
        setMode('list');
        alert('Template created successfully');
      } else {
        alert('Error: ' + result.message);
      }
    }
  };

  const deleteTemplate = (templateId) => {
    if (confirm('Delete this template?')) {
      const result = WorksheetService.deleteTemplate(templateId);
      if (result.success) {
        loadTemplates();
        alert('Template deleted');
      }
    }
  };

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      defaultValue: '',
      options: []
    };
    setFormData({
      ...formData,
      fields: [...formData.fields, newField]
    });
  };

  const updateField = (fieldId, updates) => {
    setFormData({
      ...formData,
      fields: formData.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
    });
  };

  const deleteField = (fieldId) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter(f => f.id !== fieldId)
    });
  };

  const moveField = (fieldId, direction) => {
    const index = formData.fields.findIndex(f => f.id === fieldId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.fields.length) return;

    const newFields = [...formData.fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];

    setFormData({ ...formData, fields: newFields });
  };

  const duplicateField = (field) => {
    const newField = {
      ...field,
      id: `field_${Date.now()}`,
      label: `${field.label} (Copy)`
    };
    setFormData({
      ...formData,
      fields: [...formData.fields, newField]
    });
  };

  // List Mode
  if (mode === 'list') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Worksheet Builder</h2>
            <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Templates</h3>
              <button
                onClick={startNewTemplate}
                className="bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus size={16} /> New Template
              </button>
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No templates yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map(template => {
                  const category = categories.find(c => c.id === template.categoryId);
                  return (
                    <div key={template.id} className="border rounded p-3 flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600">
                          {category?.name || 'Unknown Category'} • {template.fields.length} fields
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editTemplate(template)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setPreviewMode(true);
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {previewMode && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {selectedTemplate.fields.map((field, idx) => (
                  <div key={field.id} className="border rounded p-3">
                    <p className="font-medium text-sm">
                      {field.label} {field.required && <span className="text-red-600">*</span>}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Type: {field.type}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {selectedTemplate ? 'Edit Template' : 'New Template'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('list')}
              className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={saveTemplate}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center gap-1"
            >
              <Save size={16} /> Save
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Template Info */}
          <div className="bg-gray-50 rounded p-3 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Template Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., Code Review Checklist"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                rows="2"
                placeholder="Describe this worksheet..."
              />
            </div>
          </div>

          {/* Fields */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Form Fields</h3>
              <button
                onClick={addField}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-green-700"
              >
                <Plus size={16} /> Add Field
              </button>
            </div>

            <div className="space-y-2">
              {formData.fields.length === 0 ? (
                <div className="text-center py-6 text-gray-500 border-2 border-dashed rounded">
                  No fields. Click "Add Field" to start.
                </div>
              ) : (
                formData.fields.map((field, idx) => (
                  <FieldEditor
                    key={field.id}
                    field={field}
                    index={idx}
                    totalFields={formData.fields.length}
                    onUpdate={(updates) => updateField(field.id, updates)}
                    onDelete={() => deleteField(field.id)}
                    onMove={(direction) => moveField(field.id, direction)}
                    onDuplicate={() => duplicateField(field)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorksheetBuilder;