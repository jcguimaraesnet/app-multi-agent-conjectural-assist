"use client";

import Toolbar from '@/components/ui/Toolbar';
import Select from '@/components/ui/Select';
import { useProject } from '@/contexts/ProjectContext';

interface DashboardToolbarProps {
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
}

export default function DashboardToolbar({ selectedProjectId, onProjectChange }: DashboardToolbarProps) {
  const { projects, isLoading } = useProject();

  const options = [
    { value: '', label: isLoading ? 'Loading projects...' : 'Select a project' },
    ...projects.map((p) => ({
      value: p.id,
      label: p.project_id ? `${p.project_id} - ${p.title}` : p.title,
    })),
  ];

  return (
    <Toolbar>
      <div className="w-full max-w-sm">
        <Select
          options={options}
          value={selectedProjectId}
          onChange={(e) => onProjectChange(e.target.value)}
          disabled={isLoading}
        />
      </div>
    </Toolbar>
  );
}
