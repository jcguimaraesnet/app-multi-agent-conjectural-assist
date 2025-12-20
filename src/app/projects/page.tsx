"use client";

import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProjectsTable from '@/components/projects/ProjectsTable';
import { MOCK_PROJECTS_LIST } from '@/constants';

export default function ProjectsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const filteredProjects = MOCK_PROJECTS_LIST.filter(project => {
    return project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           project.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-sans transition-colors duration-200">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pt-6 pb-8 bg-background-light dark:bg-background-dark">
          <div className="w-5xl min-w-5xl max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
            </div>

            {/* Toolbar */}
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
                onClick={() => setSearchQuery("")}>
                  Clear
              </button>

              <div className="flex-grow"></div>

              <button className="px-4 py-2 bg-primary text-white dark:text-black dark:bg-primary text-sm font-bold rounded-lg hover:brightness-110 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 flex-shrink-0">
                <Plus className="w-4 h-4" />
                Add Project
              </button>

            </div>

            <ProjectsTable projects={filteredProjects} />
          </div>
        </div>
      </main>
    </div>
  );
}
