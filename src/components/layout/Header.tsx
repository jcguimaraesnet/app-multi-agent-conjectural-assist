"use client";

import { useState, useRef, useEffect } from 'react';
import { Folder, ChevronDown, Moon, Sun, LogOut } from 'lucide-react';
import { MOCK_PROJECTS } from '@/constants';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export default function Header({ isDarkMode, toggleTheme }: HeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout clicked');
    setIsProfileMenuOpen(false);
  };

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

        <div className="relative" ref={profileMenuRef}>
          <div 
            className="flex items-center gap-3 pl-4 border-l border-border-light dark:border-border-dark cursor-pointer group"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">Júlio Guimarães</p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm bg-primary flex items-center justify-center text-white dark:text-black font-semibold text-sm">
                JG
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark py-1 z-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
