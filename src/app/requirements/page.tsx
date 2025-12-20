"use client";

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTitle from '@/components/ui/PageTitle';
import RequirementsTable from '@/components/requirements/RequirementsTable';
import RequirementsToolbar from '@/components/requirements/RequirementsToolbar';
import ActiveFilters from '@/components/requirements/ActiveFilters';
import { MOCK_REQUIREMENTS } from '@/constants';

export default function RequirementsPage() {
  const [filterType, setFilterType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRequirements = MOCK_REQUIREMENTS.filter(req => {
    const matchesType = filterType ? req.type === filterType : true;
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleClear = () => {
    setFilterType("");
    setSearchQuery("");
  };

  return (
    <AppLayout>
      <PageTitle title="Requirements" />

      <RequirementsToolbar
        filterType={filterType}
        setFilterType={setFilterType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onClear={handleClear}
      />

      <ActiveFilters
        filterType={filterType}
        searchQuery={searchQuery}
        onClearFilterType={() => setFilterType("")}
      />

      <RequirementsTable requirements={filteredRequirements} />
    </AppLayout>
  );
}
