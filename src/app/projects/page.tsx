"use client";

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PageTitle from '@/components/ui/PageTitle';
import ProjectsTable from '@/components/projects/ProjectsTable';
import ProjectsToolbar from '@/components/projects/ProjectsToolbar';
import { MOCK_PROJECTS_LIST } from '@/constants';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = MOCK_PROJECTS_LIST.filter(project => {
    return project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           project.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleClear = () => setSearchQuery("");

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-sans transition-colors duration-200">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header />
        
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pt-6 pb-8 bg-background-light dark:bg-background-dark">
          <div className="w-5xl min-w-5xl max-w-5xl mx-auto">
            <PageTitle title="Projects" />

            <ProjectsToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onClear={handleClear}
            />

            <ProjectsTable projects={filteredProjects} />
          </div>
        </div>
      </main>
    </div>
  );
}
