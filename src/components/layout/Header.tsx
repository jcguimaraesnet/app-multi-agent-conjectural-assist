"use client";

import { Folder, ChevronDown, Moon, Sun } from 'lucide-react';
import { MOCK_PROJECTS } from '@/constants';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export default function Header({ isDarkMode, toggleTheme }: HeaderProps) {
  return (
    <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-8 flex-shrink-0 transition-colors duration-200">
      <div className="w-64 sm:w-96">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Folder className="w-5 h-5" />
          </span>
          <select className="w-full py-2 pl-10 pr-4 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer outline-none">
            {MOCK_PROJECTS.map((project, idx) => (
              <option key={project} value={idx === 0 ? "" : project}>{project}</option>
            ))}
          </select>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
            <ChevronDown className="w-4 h-4" />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border-light dark:border-border-dark cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">Rahul Sharma</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Admin</p>
          </div>
          <div className="relative">
            <img 
              alt="User Avatar" 
              className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm object-cover" 
              src="https://picsum.photos/id/64/200/200" 
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
        </div>
      </div>
    </header>
  );
}
