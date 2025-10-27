import React, { useState } from 'react';
import { MdFileUpload, MdDownload, MdCheckCircle, MdWarning, MdClose } from 'react-icons/md';
import { downloadJSON, downloadCSV, parseCSV } from '../../utils/helpers';
import { generateUniqueId } from '../../utils/helpers';

const ImportExport = ({ 
  categories, 
  onImport, 
  onExport,
  onClose,
  isDarkMode 
}) => {
  const [uploadMessage, setUploadMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleJSONUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let jsonData = JSON.parse(event.target.result);
        if (!Array.isArray(jsonData)) jsonData = jsonData.categories || [];

        const now = new Date().toISOString();
        const idMap = {};

        const newCategories = jsonData.map((cat, idx) => {
          const newId = generateUniqueId();
          idMap[cat.id || idx] = newId;

          return {
            id: newId,
            categoryId: cat.categoryId || `CAT${categories.length + idx + 1}`,
            name: cat.name || `Category ${idx + 1}`,
            description: cat.description || '',
            parentId: null,
            fields: cat.fields || [],
            tags: cat.tags || [],
            priority: cat.priority || 'medium',
            status: cat.status || 'active',
            fieldValues: cat.fieldValues || {},
            createdAt: now,
            modifiedAt: now,
            logs: [{ action: 'Imported', timestamp: now, details: 'JSON Import' }]
          };
        });

        const mappedCategories = newCategories.map((cat, idx) => {
          const originalCat = jsonData[idx];
          if (originalCat.parentId && idMap[originalCat.parentId]) {
            return { ...cat, parentId: idMap[originalCat.parentId] };
          }
          return cat;
        });

        onImport(mappedCategories);
        setUploadMessage(`Success: ${newCategories.length} categories imported`);
        setIsSuccess(true);
        setTimeout(() => setUploadMessage(''), 3000);
      } catch (error) {
        setUploadMessage(`Error: ${error.message}`);
        setIsSuccess(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = parseCSV(event.target.result);
        const now = new Date().toISOString();
        const idMap = {};

        const newCategories = csvData.map((row, idx) => {
          const newId = generateUniqueId();
          const origId = row.id || idx;
          idMap[origId] = newId;

          return {
            id: newId,
            categoryId: row.categoryid || `CAT${categories.length + idx + 1}`,
            name: row.name || `Category ${idx + 1}`,
            description: row.description || '',
            parentId: null,
            fields: [],
            tags: row.tags ? row.tags.split(';').map(t => t.trim()) : [],
            priority: row.priority || 'medium',
            status: row.status || 'active',
            fieldValues: {},
            createdAt: now,
            modifiedAt: now,
            logs: [{ action: 'Imported', timestamp: now, details: 'CSV Import' }]
          };
        });

        const mappedCategories = newCategories.map((cat, idx) => {
          const row = csvData[idx];
          if (row.parentid && idMap[row.parentid]) {
            return { ...cat, parentId: idMap[row.parentid] };
          }
          return cat;
        });

        onImport(mappedCategories);
        setUploadMessage(`Success: ${newCategories.length} categories imported`);
        setIsSuccess(true);
        setTimeout(() => setUploadMessage(''), 3000);
      } catch (error) {
        setUploadMessage(`Error: ${error.message}`);
        setIsSuccess(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const downloadJSONTemplate = () => {
    const template = {
      categories: [
        {
          id: 'cat1',
          categoryId: 'CAT1',
          name: 'Parent Category',
          description: 'Test parent',
          parentId: null,
          tags: ['tag1'],
          priority: 'medium',
          status: 'active',
          fields: []
        },
        {
          id: 'cat2',
          categoryId: 'CAT1.1',
          name: 'Child Category',
          description: 'Nested category',
          parentId: 'cat1',
          tags: [],
          priority: 'medium',
          status: 'active',
          fields: []
        }
      ]
    };
    downloadJSON(template, 'category-template.json');
  };

  const downloadCSVTemplate = () => {
    const csv = 'id,categoryid,name,description,parentid,tags,priority,status\ncat1,CAT1,Parent Category,Test parent,,tag1,medium,active\ncat2,CAT1.1,Child Category,Nested category,cat1,,medium,active';
    downloadCSV(csv, 'category-template.csv');
  };

  const handleExport = () => {
    const exportData = {
      categories: categories,
      exportDate: new Date().toISOString(),
      totalCategories: categories.length
    };
    downloadJSON(exportData, `categories-export-${Date.now()}.json`);
    setUploadMessage('Categories exported successfully');
    setIsSuccess(true);
    setTimeout(() => setUploadMessage(''), 3000);
  };

  return (
    <div className={`p-6 rounded-xl border ${
      isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Import / Export
        </h2>
        <button
          onClick={onClose}
          className={isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-gray-900'}
        >
          <MdClose size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className={`p-6 rounded-lg border ${
          isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'
        }`}>
          <h3 className={`font-bold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <MdFileUpload size={18} />
            Import Categories
          </h3>

          <div className="space-y-4">
            {/* JSON Upload */}
            <label className={`flex items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition ${
              isDarkMode ? 'border-slate-500 hover:bg-slate-600 bg-slate-800' : 'border-slate-400 hover:bg-slate-100 bg-white'
            }`}>
              <div className="text-center">
                <MdFileUpload className={`mx-auto mb-2 ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                }`} size={24} />
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Upload JSON File
                </p>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Click to browse
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleJSONUpload}
                  className="hidden"
                />
              </div>
            </label>

            {/* CSV Upload */}
            <label className={`flex items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition ${
              isDarkMode ? 'border-slate-500 hover:bg-slate-600 bg-slate-800' : 'border-slate-400 hover:bg-slate-100 bg-white'
            }`}>
              <div className="text-center">
                <MdFileUpload className={`mx-auto mb-2 ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                }`} size={24} />
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Upload CSV File
                </p>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Click to browse
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                />
              </div>
            </label>

            {/* Download Templates */}
            <div className="flex gap-2">
              <button
                onClick={downloadJSONTemplate}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium"
              >
                JSON Template
              </button>
              <button
                onClick={downloadCSVTemplate}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium"
              >
                CSV Template
              </button>
            </div>

            {/* Upload Message */}
            {uploadMessage && (
              <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                isSuccess
                  ? isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                  : isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
              }`}>
                {isSuccess ? <MdCheckCircle size={16} /> : <MdWarning size={16} />}
                {uploadMessage}
              </div>
            )}
          </div>
        </div>

        {/* Export Section */}
        <div className={`p-6 rounded-lg border ${
          isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-300'
        }`}>
          <h3 className={`font-bold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <MdDownload size={18} />
            Export Categories
          </h3>

          <div className="space-y-4">
            <div className={`p-4 rounded ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <p className={`text-sm mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Export all categories as JSON
              </p>
              <div className={`text-2xl font-bold mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {categories.length}
              </div>
              <p className={`text-xs ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Total categories
              </p>
            </div>

            <button
              onClick={handleExport}
              className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center justify-center gap-2"
            >
              <MdDownload size={18} />
              Export All Categories
            </button>

            <div className={`p-3 rounded text-xs ${
              isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-600'
            }`}>
              <p className="font-medium mb-1">Export includes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All category data</li>
                <li>Custom fields</li>
                <li>Hierarchy relationships</li>
                <li>Metadata & timestamps</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;