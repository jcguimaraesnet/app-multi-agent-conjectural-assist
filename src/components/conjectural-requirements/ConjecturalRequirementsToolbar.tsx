"use client";

import Toolbar from '@/components/ui/Toolbar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface ConjecturalRequirementsToolbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onClear: () => void;
  onExport?: () => void;
}

export default function ConjecturalRequirementsToolbar({
  searchQuery,
  setSearchQuery,
  onClear,
  onExport,
}: ConjecturalRequirementsToolbarProps) {
  return (
    <Toolbar>
      <div className="flex-1 min-w-[200px]">
        <Input
          id="keyword-search"
          label="Keyword Search"
          placeholder="Search by description..."
          showSearchIcon
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Button variant="ghost" onClick={onClear}>
        Clear
      </Button>

      <div className="flex-grow"></div>

      <Button variant="outline" onClick={onExport}>
        Export Requirements
      </Button>
    </Toolbar>
  );
}
