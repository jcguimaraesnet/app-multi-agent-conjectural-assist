"use client";

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
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
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-sans transition-colors duration-200">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header />
        
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pt-6 pb-8 bg-background-light dark:bg-background-dark">
          <div className="w-5xl min-w-5xl max-w-5xl mx-auto">
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
          </div>
        </div>
      </main>
    </div>
  );
}
