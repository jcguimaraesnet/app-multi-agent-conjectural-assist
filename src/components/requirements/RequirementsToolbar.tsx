"use client";

import { Search, ChevronDown, Plus } from 'lucide-react';
import { RequirementType } from '@/types';

interface RequirementsToolbarProps {
  filterType: string;
  setFilterType: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onClear: () => void;
  onExport?: () => void;
  onAdd?: () => void;
}

export default function RequirementsToolbar({
  filterType,
  setFilterType,
  searchQuery,
  setSearchQuery,
  onClear,
  onExport,
  onAdd,
}: RequirementsToolbarProps) {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl px-4 py-3 shadow-sm mb-4 transition-colors duration-200 flex items-center gap-3 overflow-x-auto">
      
      <div className="flex-shrink-0 w-40">
        <label className="sr-only" htmlFor="requirement-type">Requirement Type</label>
        <div className="relative">
          <select 
            className="w-full bg-white dark:bg-gray-800 border border-border-light dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary dark:text-gray-200 outline-none appearance-none cursor-pointer"
            id="requirement-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value={RequirementType.Functional}>Functional</option>
            <option value={RequirementType.NonFunctional}>Non-Functional</option>
            <option value={RequirementType.Conjectural}>Conjectural</option>
          </select>
          <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="sr-only" htmlFor="keyword-search">Keyword Search</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input 
            className="w-full bg-white dark:bg-gray-800 border border-border-light dark:border-gray-600 rounded-lg py-2 pl-10 pr-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary dark:text-gray-200 outline-none placeholder-gray-400" 
            id="keyword-search" 
            placeholder="Search by title or description..." 
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
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
        onClick={onExport}
      >
        Export Requirements
      </button>

      <button 
        className="px-4 py-2 bg-primary text-white dark:text-black dark:bg-primary text-sm font-bold rounded-lg hover:brightness-110 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 flex-shrink-0"
        onClick={onAdd}
      >
        <Plus className="w-4 h-4" />
        Add Requirement
      </button>

    </div>
  );
}
