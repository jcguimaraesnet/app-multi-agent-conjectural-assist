"use client";

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTitle from '@/components/ui/PageTitle';
import ProjectsTable from '@/components/projects/ProjectsTable';
import ProjectsToolbar from '@/components/projects/ProjectsToolbar';
import AddProjectPopup from '@/components/projects/AddProjectPopup';
import { MOCK_PROJECTS_LIST } from '@/constants';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);

  const filteredProjects = MOCK_PROJECTS_LIST.filter(project => {
    return project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           project.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleClear = () => setSearchQuery("");
  const handleOpenAdd = () => setShowAddPopup(true);
  const handleCloseAdd = () => setShowAddPopup(false);

  return (
    <AppLayout>
      <PageTitle title="Projects" />

      <ProjectsToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onClear={handleClear}
        onAdd={handleOpenAdd}
      />

      <ProjectsTable projects={filteredProjects} />

      <AddProjectPopup open={showAddPopup} onClose={handleCloseAdd} />
    </AppLayout>
  );
}
