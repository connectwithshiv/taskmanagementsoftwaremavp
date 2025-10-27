import React, { useState, useEffect } from 'react';
import { MdMenu } from 'react-icons/md';

const AdminHeader = ({ onToggleSidebar, isDarkMode, onToggleDarkMode }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className={`border-b sticky top-0 z-30 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className={`lg:hidden ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <MdMenu size={24} />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Admin Dashboard</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>{formatDate}</p>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{formatTime}</p>
          </div>
          <button
            onClick={onToggleDarkMode}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isDarkMode ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-slate-800 text-white hover:bg-slate-900'
            }`}
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;