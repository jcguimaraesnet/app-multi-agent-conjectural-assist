'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { Project } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PREFIX = "/api";

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  selectProject: (project: Project | null) => void;
  selectProjectById: (projectId: string) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Module-level state to persist between navigations
let cachedProjects: Project[] | null = null;
let cachedUserId: string | null = null;
let hasFetched = false;

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();

  const getInitialProjects = () => {
    // First try in-memory cache for same user
    if (user?.id && user.id === cachedUserId && cachedProjects) {
      return cachedProjects;
    }
    return [];
  };

  const initialProjects = getInitialProjects();
  const initialLoading = initialProjects.length === 0;

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isFetching, setIsFetching] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  // Consider loading while auth is still resolving or while fetching projects
  const isLoading = useMemo(() => isAuthLoading || isFetching, [isAuthLoading, isFetching]);
  
  // Track if we've already fetched for this user
  const fetchedForUser = useRef<string | null>(null);

  const fetchProjects = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setProjects([]);
      setIsFetching(false);
      return;
    }

    // Skip if already fetched for this user (unless forcing refresh)
    if (!forceRefresh && fetchedForUser.current === user.id && hasFetched) {
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/projects`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      
      // Update module-level cache
      cachedProjects = data;
      cachedUserId = user.id;
      hasFetched = true;
      fetchedForUser.current = user.id;
      
      setProjects(data);

      // Auto-select first project if none selected
      if (data.length > 0) {
        setSelectedProject(prev => prev || data[0]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load projects';
      setError(message);
      console.error('Error fetching projects:', err);
    } finally {
      setIsFetching(false);
    }
  }, [user?.id]);

  // Fetch projects when user becomes available
  useEffect(() => {
    // Don't clear state while auth is still resolving
    if (isAuthLoading) return;

    if (!user?.id) {
      setProjects([]);
      setSelectedProject(null);
      setIsFetching(false);
      return;
    }

    // If we have cached data for this user, use it immediately
    const cacheToUse = user.id === cachedUserId ? cachedProjects : null;

    if (cacheToUse) {
      cachedProjects = cacheToUse; // hydrate in-memory cache
      cachedUserId = user.id;
      hasFetched = true;
      fetchedForUser.current = user.id;
      setProjects(cacheToUse);
      setIsFetching(false);
      if (cacheToUse.length > 0) {
        setSelectedProject(prev => prev || cacheToUse[0]);
      }
      return;
    }

    // Otherwise fetch from API
    fetchProjects();
  }, [user?.id, isAuthLoading, fetchProjects]);

  const selectProject = useCallback((project: Project | null) => {
    setSelectedProject(project);
  }, []);

  const selectProjectById = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project || null);
  }, [projects]);

  const refreshProjects = useCallback(async () => {
    await fetchProjects(true);
  }, [fetchProjects]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        isLoading,
        error,
        selectProject,
        selectProjectById,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
