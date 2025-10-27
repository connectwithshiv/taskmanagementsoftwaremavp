import React, { useState } from 'react';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Download, Upload, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { StorageManager } from '../services/dataService';

export const AdminPage = () => {
  const [message, setMessage] = useState(null);

  const handleExportData = () => {
    try {
      const categories = localStorage.getItem('app_categories') || '[]';
      const recruitment = localStorage.getItem('app_recruitment_data') || '[]';
      const deletedLogs = localStorage.getItem('app_deleted_logs') || '[]';

      const data = {
        categories: JSON.parse(categories),
        recruitment: JSON.parse(recruitment),
        deletedLogs: JSON.parse(deletedLogs),
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Data exported successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Export failed: ' + error.message });
    }
  };

  const handleClearCache = () => {
    if (window.confirm('This will clear all cached data. Are you sure?')) {
      StorageService.clear();
      setMessage({ type: 'success', text: 'Cache cleared successfully!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (data.categories) localStorage.setItem('app_categories', JSON.stringify(data.categories));
        if (data.recruitment) localStorage.setItem('app_recruitment_data', JSON.stringify(data.recruitment));
        if (data.deletedLogs) localStorage.setItem('app_deleted_logs', JSON.stringify(data.deletedLogs));

        setMessage({ type: 'success', text: 'Data imported successfully! Please refresh the page.' });
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Import failed: Invalid file format' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-900">Admin Settings</h2>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} className="text-green-600" />
          ) : (
            <AlertCircle size={20} className="text-red-600" />
          )}
          <span className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Data Management */}
        <Card title="Data Management">
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-2">Export Data</h4>
              <p className="text-sm text-slate-600 mb-3">Download all categories and recruitment data as JSON</p>
              <Button onClick={handleExportData} className="w-full">
                <Download size={16} /> Export Data
              </Button>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-2">Import Data</h4>
              <p className="text-sm text-slate-600 mb-3">Upload a previously exported JSON file</p>
              <label className="block">
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
                <Button as="span" className="w-full cursor-pointer">
                  <Upload size={16} /> Choose File
                </Button>
              </label>
            </div>
          </div>
        </Card>

        {/* System Maintenance */}
        <Card title="System Maintenance">
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-2">Clear Cache</h4>
              <p className="text-sm text-slate-600 mb-3">Remove all cached data from browser storage</p>
              <Button 
                variant="danger" 
                className="w-full"
                onClick={handleClearCache}
              >
                <Trash2 size={16} /> Clear Cache
              </Button>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-2">System Status</h4>
              <p className="text-sm text-green-600 font-medium">✓ System Running Normally</p>
              <p className="text-xs text-slate-600 mt-2">All systems operational</p>
            </div>
          </div>
        </Card>
      </div>

      {/* System Information */}
      <Card title="System Information">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-600">Browser Storage Used:</span>
            <span className="font-semibold text-slate-900">
              {(new Blob(Object.values(localStorage)).size / 1024).toFixed(2)} KB
            </span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-600">Last Updated:</span>
            <span className="font-semibold text-slate-900">{new Date().toLocaleString()}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-600">Environment:</span>
            <span className="font-semibold text-slate-900">Production</span>
          </div>
        </div>
      </Card>

      {/* Backup Information */}
      <Card title="Backup & Recovery">
        <div className="space-y-3 text-sm">
          <p className="text-slate-600">
            Regular backups are recommended to prevent data loss. Export your data periodically.
          </p>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
            <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-blue-700">
              Data is stored in browser local storage and will persist across browser sessions but may be cleared if cache is emptied.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};