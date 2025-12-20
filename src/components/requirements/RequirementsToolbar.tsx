"use client";

import { Plus } from 'lucide-react';
import { RequirementType } from '@/types';
import Toolbar from '@/components/ui/Toolbar';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface RequirementsToolbarProps {
  filterType: string;
  setFilterType: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onClear: () => void;
  onExport?: () => void;
  onAdd?: () => void;
}

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: RequirementType.Functional, label: 'Functional' },
  { value: RequirementType.NonFunctional, label: 'Non-Functional' },
  { value: RequirementType.Conjectural, label: 'Conjectural' },
];

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
    <Toolbar>
      <div className="flex-shrink-0 w-40">
        <Select
          id="requirement-type"
          label="Requirement Type"
          options={typeOptions}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <Input
          id="keyword-search"
          label="Keyword Search"
          placeholder="Search by title or description..."
          showSearchIcon
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Button variant="secondary">
        Search
      </Button>
      
      <Button variant="ghost" onClick={onClear}>
        Clear
      </Button>

      <div className="flex-grow"></div>

      <Button variant="outline" onClick={onExport}>
        Export Requirements
      </Button>

      <Button variant="primary" onClick={onAdd}>
        <Plus className="w-4 h-4" />
        Add Requirement
      </Button>
    </Toolbar>
  );
}
