"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import PageTitle from '@/components/ui/PageTitle';
import RequirementsTable from '@/components/requirements/RequirementsTable';
import RequirementsToolbar from '@/components/requirements/RequirementsToolbar';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { Requirement, RequirementAPI, mapBackendTypeToFrontend } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PREFIX = "/api";
const PAGE_SIZE = 10;
const TOAST_DURATION_MS = 5000;

// Transform backend API response to frontend Requirement format
function transformRequirement(apiReq: RequirementAPI, projectAuthor: string): Requirement {
  return {
    id: apiReq.id,
    requirement_id: apiReq.requirement_id,
    project_id: apiReq.project_id,
    title: apiReq.requirement_id, // Use requirement_id as title
    description: apiReq.description,
    type: mapBackendTypeToFrontend(apiReq.type),
    category: apiReq.category,
    author: projectAuthor,
    created_at: apiReq.created_at,
    updated_at: apiReq.updated_at,
  };
}

export default function RequirementsPage() {
  const { user } = useAuth();
  const { selectedProject, selectProjectById, projects, isLoading: isLoadingProjects } = useProject();
  const searchParams = useSearchParams();
  const projectIdFromQuery = searchParams.get('projectId');
  
  const [filterType, setFilterType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [toastProgress, setToastProgress] = useState(100);

  // Select project from query string when projects are loaded
  // If no projectId is provided in the URL, clear any previously selected project
  useEffect(() => {
    if (!projectIdFromQuery) {
      // No projectId in URL - clear selection
      return;
    }
    if (projects.length > 0 && !isLoadingProjects) {
      selectProjectById(projectIdFromQuery);
    }
  }, [projectIdFromQuery, projects, isLoadingProjects, selectProjectById]);

  // Determine if we should show requirements (only when projectId is provided and project is loaded)
  const hasValidProjectId = Boolean(projectIdFromQuery && selectedProject);

  // Fetch requirements from API
  const fetchRequirements = useCallback(async () => {
    if (!user?.id || !selectedProject?.id || !projectIdFromQuery) {
      setRequirements([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Build author name from project
    const projectAuthor = [selectedProject.author_first_name, selectedProject.author_last_name]
      .filter(Boolean)
      .join(' ') || selectedProject.author || 'Unknown';

    try {
      const url = `${API_BASE_URL}${API_PREFIX}/requirements/project/${selectedProject.id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setRequirements([]);
          return;
        }
        throw new Error('Failed to fetch requirements');
      }

      const data: RequirementAPI[] = await response.json();
      const transformed = data.map(req => transformRequirement(req, projectAuthor));
      setRequirements(transformed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load requirements';
      setError(message);
      console.error('Error fetching requirements:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, selectedProject?.id, projectIdFromQuery]);

  // Fetch requirements when project or filter changes
  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery]);

  // Toast progress animation
  useEffect(() => {
    if (!successMessage) {
      setToastProgress(100);
      return;
    }

    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 1 - elapsed / TOAST_DURATION_MS);
      setToastProgress(Math.round(remaining * 100));
    }, 50);

    const timeoutId = setTimeout(() => {
      setSuccessMessage(null);
    }, TOAST_DURATION_MS);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [successMessage]);

  const handleDismissSuccess = () => {
    setSuccessMessage(null);
  };

  // Filter requirements by type and search query (client-side)
  const filteredRequirements = requirements.filter(req => {
    const matchesType = filterType ? req.type === filterType : true;
    const matchesSearch = searchQuery
      ? req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requirement_id.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesType && matchesSearch;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRequirements.length / PAGE_SIZE));
  const paginatedRequirements = filteredRequirements.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleClear = () => {
    setFilterType("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleDelete = async (requirementId: string) => {
    if (!user?.id) return;
    
    if (!confirm('Are you sure you want to delete this requirement?')) {
      return;
    }

    setSuccessMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/requirements/${requirementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete requirement');
      }

      // Refresh requirements after delete
      fetchRequirements();
      setSuccessMessage('Requirement deleted successfully.');
    } catch (err) {
      console.error('Error deleting requirement:', err);
      setSuccessMessage(null);
      alert('Failed to delete requirement');
    }
  };

  return (
    <AppLayout>
      <PageTitle title="Requirements" />

      {successMessage && (
        <div className="fixed top-24 right-6 z-50 w-80 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-800 dark:text-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold text-green-600 dark:text-green-400">Success</div>
              <p className="mt-1 text-gray-600 dark:text-gray-300">{successMessage}</p>
            </div>
            <button
              onClick={handleDismissSuccess}
              className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
          <div className="mt-3 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full bg-green-500 dark:bg-green-400 transition-[width] duration-100 ease-linear"
              style={{ width: `${toastProgress}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {!hasValidProjectId && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            No project selected. Please access this page with a valid projectId parameter.
          </p>
        </div>
      )}

      <RequirementsToolbar
        filterType={filterType}
        setFilterType={setFilterType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onClear={handleClear}
      />

      <RequirementsTable 
        requirements={paginatedRequirements}
        isLoading={isLoading}
        error={error}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </AppLayout>
  );
}
