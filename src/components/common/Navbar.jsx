import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';

export const Navbar = ({ isDarkMode, onThemeToggle, onMenuToggle }) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuToggle}
            className="text-slate-600 hover:text-slate-900 lg:hidden"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onThemeToggle}
            className="text-slate-600 hover:text-slate-900 p-2 hover:bg-slate-100 rounded-lg transition"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};