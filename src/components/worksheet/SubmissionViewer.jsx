// components/worksheet/SubmissionViewer.jsx - Admin Submission Review Component

import React, { useState, useEffect } from 'react';
import { X, Eye, Download, ArrowLeft } from 'lucide-react';
import WorksheetService from '../../services/worksheetService';

/**
 * SubmissionDetailView - Shows detailed submission data
 */
const SubmissionDetailView = ({ submission, template, onBack }) => {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(submission.notes || '');

  const saveNotes = () => {
    const result = WorksheetService.updateSubmission(submission.id, { notes });
    if (result.success) {
      setEditingNotes(false);
      alert('Notes saved');
    }
  };

  if (!template) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Template not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-2 pb-4 border-b">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h3 className="text-lg font-semibold flex-1">{template.name}</h3>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          {submission.status || 'submitted'}
        </span>
      </div>

      {/* Submission metadata */}
      <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Submitted:</span>
          <span>{new Date(submission.submittedAt).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">User ID:</span>
          <span className="font-mono text-xs">{submission.userId}</span>
        </div>
      </div>

      {/* Form data */}
      <div className="space-y-3">
        <h4 className="font-medium">Submitted Data</h4>
        {template.fields.map((field) => {
          const value = submission.data[field.id];
          return (
            <div key={field.id} className="border rounded p-3">
              <p className="text-sm font-medium text-gray-700 mb-1">{field.label}</p>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {Array.isArray(value) ? value.join(', ') : (value || '—')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes section */}
      <div className="border rounded p-3 space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Review Notes</h4>
          {!editingNotes && (
            <button
              onClick={() => setEditingNotes(true)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          )}
        </div>

        {editingNotes ? (
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
              rows="3"
              placeholder="Add review notes..."
            />
            <div className="flex gap-2">
              <button
                onClick={saveNotes}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingNotes(false)}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
            {notes || '— No notes —'}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * SubmissionListView - Shows list of submissions for a task
 */
const SubmissionListView = ({ submissions, templates, onSelectSubmission }) => {
  const getTemplateName = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    return template?.name || 'Unknown Template';
  };

  return (
    <div className="space-y-2">
      {submissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No submissions yet</p>
        </div>
      ) : (
        submissions.map((submission) => (
          <div
            key={submission.id}
            onClick={() => onSelectSubmission(submission)}
            className="border rounded p-3 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-sm">
                  {getTemplateName(submission.templateId)}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  ID: {submission.userId.substring(0, 20)}...
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  submission.status === 'reviewed' 
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {submission.status || 'pending'}
                </span>
                <Eye size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

/**
 * SubmissionViewer - Main component for admins to review submissions
 */
const SubmissionViewer = ({ taskId, onClose }) => {
  const [submissions, setSubmissions] = useState([]);
  const [templates, setTemplates] = useState({});
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    reviewed: 0,
    pending: 0
  });

  // Load submissions on mount
  useEffect(() => {
    loadData();
  }, [taskId]);

  const loadData = () => {
    setLoading(true);
    try {
      // Get submissions for this task
      const taskSubmissions = WorksheetService.getSubmissionsByTask(taskId);
      setSubmissions(taskSubmissions);

      // Load templates
      const allTemplates = WorksheetService.getAllTemplates();
      const templateMap = {};
      allTemplates.forEach(t => {
        templateMap[t.id] = t;
      });
      setTemplates(templateMap);

      // Calculate stats
      setStats({
        total: taskSubmissions.length,
        reviewed: taskSubmissions.filter(s => s.status === 'reviewed').length,
        pending: taskSubmissions.filter(s => s.status !== 'reviewed').length
      });
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
    setLoading(false);
  };

  const handleStatusChange = (submissionId, newStatus) => {
    const result = WorksheetService.updateSubmission(submissionId, { status: newStatus });
    if (result.success) {
      loadData();
      alert(`Status updated to: ${newStatus}`);
    }
  };

  const handleExportSubmissions = () => {
    const data = WorksheetService.exportSubmissions();
    const filtered = {
      ...data,
      submissions: data.submissions.filter(s => s.taskId === taskId)
    };
    
    const dataStr = JSON.stringify(filtered, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `submissions_${taskId}_${Date.now()}.json`;
    link.click();
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          <p className="mt-2 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Worksheet Submissions</h2>
            <p className="text-sm text-purple-100 mt-1">
              {stats.total} total • {stats.pending} pending • {stats.reviewed} reviewed
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-purple-700 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats bar */}
        {submissions.length > 0 && (
          <div className="bg-gray-50 border-b p-3 flex gap-4 text-sm">
            <div className="flex-1">
              <p className="text-gray-600">Total Submissions</p>
              <p className="text-lg font-semibold">{stats.total}</p>
            </div>
            <div className="flex-1">
              <p className="text-gray-600">Pending Review</p>
              <p className="text-lg font-semibold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="flex-1">
              <p className="text-gray-600">Reviewed</p>
              <p className="text-lg font-semibold text-blue-600">{stats.reviewed}</p>
            </div>
            <div className="flex-1 flex items-end">
              <button
                onClick={handleExportSubmissions}
                disabled={submissions.length === 0}
                className="w-full px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <Download size={14} /> Export
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {selectedSubmission ? (
            <>
              <SubmissionDetailView
                submission={selectedSubmission}
                template={templates[selectedSubmission.templateId]}
                onBack={() => setSelectedSubmission(null)}
              />

              {/* Status selector */}
              <div className="mt-4 flex gap-2">
                <select
                  value={selectedSubmission.status || 'submitted'}
                  onChange={(e) => handleStatusChange(selectedSubmission.id, e.target.value)}
                  className="px-3 py-2 border rounded text-sm"
                >
                  <option value="submitted">Pending Review</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="rejected">Rejected</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
            </>
          ) : (
            <SubmissionListView
              submissions={submissions}
              templates={templates}
              onSelectSubmission={(submission) => {
                setSelectedSubmission(submission);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionViewer;