"use client";

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import PageTitle from '@/components/ui/PageTitle';
import RequirementsTable from '@/components/requirements/RequirementsTable';
import RequirementsToolbar from '@/components/requirements/RequirementsToolbar';
import { useProject } from '@/contexts/ProjectContext';
import { useRequirements } from '@/contexts/RequirementsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useAgent } from "@copilotkit/react-core/v2";
import { useCoAgent, useCoAgentStateRender, useLangGraphInterrupt } from "@copilotkit/react-core";
import StepProgress from '@/components/requirements/StepProgress';
import InterruptForm from '@/components/requirements/InterruptForm';
import Spinner from "@/components/ui/Spinner";
import { useAuth } from '@/contexts/AuthContext';

const PAGE_SIZE = 10;
const TOAST_DURATION_MS = 5000;

interface AgentState {
  step1_elicitation: boolean;
  step2_analysis: boolean;
  step3_specification: boolean;
  step4_validation: boolean;
}


export default function RequirementsPage() {

  const { selectedProject, selectProjectById, projects, isLoading: isLoadingProjects } = useProject();
  const { 
    requirements, 
    currentProjectId,
    isLoading, 
    error, 
    fetchRequirements, 
    deleteRequirement 
  } = useRequirements();
  const selectedProjectIdRef = useRef<string | undefined>(selectedProject?.id);

  const { settings } = useSettings();
  const requiredBriefDescriptionRef = useRef<boolean>(settings.require_brief_description);
  const batchModeRef = useRef<boolean>(settings.batch_mode);
  const quantityReqBatchRef = useRef<number>(settings.quantity_req_batch);


  useEffect(() => {
    selectedProjectIdRef.current = selectedProject?.id;
    requiredBriefDescriptionRef.current = settings.require_brief_description;
    batchModeRef.current = settings.batch_mode;
    quantityReqBatchRef.current = settings.quantity_req_batch;
  }, [selectedProject?.id, settings.require_brief_description, settings.batch_mode, settings.quantity_req_batch]);


  const searchParams = useSearchParams();
  const projectIdFromQuery = searchParams.get('projectId');
  
  const [filterType, setFilterType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [toastProgress, setToastProgress] = useState(100);

  // Select project from query string when projects are loaded
  useEffect(() => {
    if (!projectIdFromQuery) {
      return;
    }
    if (projects.length > 0 && !isLoadingProjects) {
      selectProjectById(projectIdFromQuery);
    }
  }, [projectIdFromQuery, projects, isLoadingProjects, selectProjectById]);

  // Determine if we should show requirements (only when projectId is provided and project is loaded)
  const hasValidProjectId = Boolean(projectIdFromQuery && selectedProject);

  // Fetch requirements when project changes (only if not already cached)
  useEffect(() => {
    if (!selectedProject?.id || !projectIdFromQuery) {
      return;
    }

    // Skip if requirements are already loaded for this project
    if (currentProjectId === selectedProject.id) {
      return;
    }

    // Build author name from project
    const projectAuthor = [selectedProject.author_first_name, selectedProject.author_last_name]
      .filter(Boolean)
      .join(' ') || selectedProject.author || 'Unknown';

    fetchRequirements(selectedProject.id, projectAuthor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject?.id, projectIdFromQuery, currentProjectId, fetchRequirements]);

  // Reset page when filters change
  const prevFiltersRef = useRef({ filterType, searchQuery });
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (prev.filterType !== filterType || prev.searchQuery !== searchQuery) {
      setCurrentPage(1);
      prevFiltersRef.current = { filterType, searchQuery };
    }
  }, [filterType, searchQuery]);

  // Toast progress animation
  useEffect(() => {
    if (!successMessage) {
      return;
    }

    setToastProgress(100);
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

  const handleDelete = useCallback(async (requirementId: string) => {
    if (!confirm('Are you sure you want to delete this requirement?')) {
      return;
    }

    setSuccessMessage(null);

    const success = await deleteRequirement(requirementId);
    
    if (success) {
      setSuccessMessage('Requirement deleted successfully.');
    } else {
      alert('Failed to delete requirement');
    }
  }, [deleteRequirement]);


  const { user } = useAuth();
  const { agent } = useAgent({ agentId: "sample_agent" });
  
  useEffect(() => {
    console.log("Setting agent userId to:", user?.id || "");
    agent.setState({
      ...agent.state,
      userId: user?.id || "",
    });
  }, []);




  

  // Agent state sync
  // const { agent } = useAgent({ agentId: "sample_agent" });

  // // Track previous values to avoid unnecessary state updates
  // const prevAgentStateRef = useRef<{
  //   project_id: string;
  //   require_brief_description: boolean;
  //   batch_mode: boolean;
  //   quantity_req_batch: number;
  // } | null>(null);

  // // Sync agent state when page loads or dependencies change
  // useEffect(() => {
  //   const newState = {
  //     project_id: selectedProject?.id || "",
  //     require_brief_description: settings.require_brief_description,
  //     batch_mode: settings.batch_mode,
  //     quantity_req_batch: settings.quantity_req_batch,
  //   };

  //   // Check if state actually changed
  //   const prev = prevAgentStateRef.current;
  //   const hasChanged = !prev ||
  //     prev.project_id !== newState.project_id ||
  //     prev.require_brief_description !== newState.require_brief_description ||
  //     prev.batch_mode !== newState.batch_mode ||
  //     prev.quantity_req_batch !== newState.quantity_req_batch;

  //   console.log("agent state:", newState);
  //   if (hasChanged) {
  //     agent.setState({
  //       ...agent.state,
  //       ...newState,
  //     });
  //     prevAgentStateRef.current = newState;
  //   }
  // }, [selectedProject?.id, settings.require_brief_description, settings.batch_mode, settings.quantity_req_batch, agent]);

  // const { state, nodeName, running } = useCoAgent<AgentState>({
  //   name: "sample_agent",
  //   config: {
  //     streamSubgraphs: true,
  //   }
  // });

  // const { state, nodeName, running } = useCoAgent<AgentState>({
  //   name: "sample_agent",
  //   config: {
  //     streamSubgraphs: true,
  //   }
  // });
  
  useLangGraphInterrupt({
      render: ({ event, resolve }) => (
          console.log("Interrupt event received:", selectedProjectIdRef.current),
          //console.log("quantityReqBatchRef.current:", quantityReqBatchRef.current),
          <InterruptForm
            userId={user?.id as string}
            projectId={selectedProjectIdRef.current as string}
            question={event.value as string}
            inputCount={2}
            onSubmit={resolve}
          />
      )
  });


  useCoAgentStateRender<AgentState>({
    name: "sample_agent",
    render: ({ state }) => (
      <StepProgress state={state} />
    ),
  });

  return (
    <CopilotSidebar
      clickOutsideToClose={false}
      defaultOpen={true}
      labels={{
        title: "Agent AI",
        initial: "👋 Hi, there! You're chatting with an agent.",
      }}
      suggestions={[
        {
          title: "Generate conjectural requirements",
          message: "Generate conjectural requirements for the current project.",
        },
      ]}
    >
      <AppLayout>
        <PageTitle title="Requirements" backHref="/projects" backLabel="Back Projects" />

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
    </CopilotSidebar>
  );
}
