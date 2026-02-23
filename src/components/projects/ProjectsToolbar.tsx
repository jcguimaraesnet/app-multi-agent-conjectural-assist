"use client";

import { Plus } from 'lucide-react';
import Toolbar from '@/components/ui/Toolbar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface ProjectsToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  onAdd?: () => void;
}

export default function ProjectsToolbar({
  searchValue,
  onSearchChange,
  onClear,
  onAdd,
}: ProjectsToolbarProps) {
  return (
    <Toolbar>
      <div className="flex-1 min-w-[200px]">
        <Input
          id="project-search"
          label="Project Search"
          placeholder="Search by project title..."
          showSearchIcon
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Button variant="ghost" onClick={onClear}>
        Clear
      </Button>

      <div className="flex-grow"></div>

      <Button id="btn-add-project" variant="primary" onClick={onAdd}>
        <Plus className="w-4 h-4" />
        Add Project
      </Button>
    </Toolbar>
  );
}
