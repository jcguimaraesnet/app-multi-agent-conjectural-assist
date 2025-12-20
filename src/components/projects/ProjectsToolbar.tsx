"use client";

import { Search, Plus } from 'lucide-react';

interface ProjectsToolbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onClear: () => void;
  onAdd?: () => void;
}

export default function ProjectsToolbar({
  searchQuery,
  setSearchQuery,
  onClear,
  onAdd,
}: ProjectsToolbarProps) {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl px-4 py-3 shadow-sm mb-4 transition-colors duration-200 flex items-center gap-3 overflow-x-auto">

      <div className="flex-1 min-w-[200px]">
        <label className="sr-only" htmlFor="project-search">Project Search</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input 
            className="w-full bg-white dark:bg-gray-800 border border-border-light dark:border-gray-600 rounded-lg py-2 pl-10 pr-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary dark:text-gray-200 outline-none placeholder-gray-400" 
            id="project-search" 
            placeholder="Search by project title..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <button className="bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-gray-500/20 flex-shrink-0">
        Search
      </button>
      
      <button 
        className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-[#FDBA74] text-sm font-semibold px-2 py-2 uppercase tracking-wide transition-colors flex-shrink-0"
        onClick={onClear}
      >
        Clear
      </button>

      <div className="flex-grow"></div>

      <button 
        className="px-4 py-2 bg-primary text-white dark:text-black dark:bg-primary text-sm font-bold rounded-lg hover:brightness-110 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 flex-shrink-0"
        onClick={onAdd}
      >
        <Plus className="w-4 h-4" />
        Add Project
      </button>

    </div>
  );
}
