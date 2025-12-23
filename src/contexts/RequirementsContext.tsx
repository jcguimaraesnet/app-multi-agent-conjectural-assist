'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Requirement, RequirementAPI, mapBackendTypeToFrontend } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PREFIX = "/api";

// Transform backend API response to frontend Requirement format
function transformRequirement(apiReq: RequirementAPI, projectAuthor: string): Requirement {
  return {
    id: apiReq.id,
    requirement_id: apiReq.requirement_id,
    project_id: apiReq.project_id,
    title: apiReq.requirement_id,
    description: apiReq.description,
    type: mapBackendTypeToFrontend(apiReq.type),
    category: apiReq.category,
    author: projectAuthor,
    created_at: apiReq.created_at,
    updated_at: apiReq.updated_at,
  };
}

interface RequirementsContextType {
  requirements: Requirement[];
  currentProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchRequirements: (projectId: string, projectAuthor: string, forceRefresh?: boolean) => Promise<Requirement[]>;
  prefetchRequirements: (projectId: string, projectAuthor: string) => Promise<void>;
  clearRequirements: () => void;
  deleteRequirement: (requirementId: string) => Promise<boolean>;
  refreshRequirements: () => Promise<void>;
}

const RequirementsContext = createContext<RequirementsContextType | undefined>(undefined);

// Module-level cache to persist between navigations
interface RequirementsCache {
  projectId: string;
  requirements: Requirement[];
  projectAuthor: string;
}
let cachedRequirements: RequirementsCache | null = null;

export function RequirementsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const getInitialState = () => {
    if (cachedRequirements) {
      return {
        requirements: cachedRequirements.requirements,
        projectId: cachedRequirements.projectId,
      };
    }
    return { requirements: [], projectId: null };
  };

  const initialState = getInitialState();
  
  const [requirements, setRequirements] = useState<Requirement[]>(initialState.requirements);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(initialState.projectId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequirements = useCallback(async (
    projectId: string, 
    projectAuthor: string, 
    forceRefresh = false
  ): Promise<Requirement[]> => {
    if (!user?.id) {
      setRequirements([]);
      setCurrentProjectId(null);
      return [];
    }

    // Return cached data if available and not forcing refresh
    if (!forceRefresh && cachedRequirements?.projectId === projectId) {
      setRequirements(cachedRequirements.requirements);
      setCurrentProjectId(projectId);
      setIsLoading(false);
      return cachedRequirements.requirements;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}${API_PREFIX}/requirements/project/${projectId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          const emptyResult: Requirement[] = [];
          cachedRequirements = { projectId, requirements: emptyResult, projectAuthor };
          setRequirements(emptyResult);
          setCurrentProjectId(projectId);
          return emptyResult;
        }
        throw new Error('Failed to fetch requirements');
      }

      const data: RequirementAPI[] = await response.json();
      const transformed = data.map(req => transformRequirement(req, projectAuthor));
      
      // Update module-level cache
      cachedRequirements = { projectId, requirements: transformed, projectAuthor };
      
      setRequirements(transformed);
      setCurrentProjectId(projectId);
      
      return transformed;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load requirements';
      setError(message);
      console.error('Error fetching requirements:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Prefetch requirements without updating loading state visually
  const prefetchRequirements = useCallback(async (projectId: string, projectAuthor: string): Promise<void> => {
    if (!user?.id) return;

    // Skip if already cached for this project
    if (cachedRequirements?.projectId === projectId) {
      return;
    }

    try {
      const url = `${API_BASE_URL}${API_PREFIX}/requirements/project/${projectId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          cachedRequirements = { projectId, requirements: [], projectAuthor };
          return;
        }
        throw new Error('Failed to prefetch requirements');
      }

      const data: RequirementAPI[] = await response.json();
      const transformed = data.map(req => transformRequirement(req, projectAuthor));
      
      // Update module-level cache
      cachedRequirements = { projectId, requirements: transformed, projectAuthor };
    } catch (err) {
      console.error('Error prefetching requirements:', err);
    }
  }, [user?.id]);

  const clearRequirements = useCallback(() => {
    setRequirements([]);
    setCurrentProjectId(null);
    cachedRequirements = null;
  }, []);

  const deleteRequirement = useCallback(async (requirementId: string): Promise<boolean> => {
    if (!user?.id) return false;

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

      // Update local state and cache
      const updatedRequirements = requirements.filter(r => r.id !== requirementId);
      setRequirements(updatedRequirements);
      
      if (cachedRequirements) {
        cachedRequirements = {
          ...cachedRequirements,
          requirements: updatedRequirements,
        };
      }

      return true;
    } catch (err) {
      console.error('Error deleting requirement:', err);
      return false;
    }
  }, [user?.id, requirements]);

  const refreshRequirements = useCallback(async () => {
    if (currentProjectId && cachedRequirements?.projectAuthor) {
      await fetchRequirements(currentProjectId, cachedRequirements.projectAuthor, true);
    }
  }, [currentProjectId, fetchRequirements]);

  return (
    <RequirementsContext.Provider
      value={{
        requirements,
        currentProjectId,
        isLoading,
        error,
        fetchRequirements,
        prefetchRequirements,
        clearRequirements,
        deleteRequirement,
        refreshRequirements,
      }}
    >
      {children}
    </RequirementsContext.Provider>
  );
}

export function useRequirements() {
  const context = useContext(RequirementsContext);
  if (context === undefined) {
    throw new Error('useRequirements must be used within a RequirementsProvider');
  }
  return context;
}
