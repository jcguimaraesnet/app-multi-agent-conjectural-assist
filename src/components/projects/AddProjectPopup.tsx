"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, UploadCloud, Check, Loader2, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PREFIX = "/api";

interface AddProjectPopupProps {
  open: boolean;
  onClose: () => void;
  onProjectCreated?: () => void;
  projectCount: number;
}

interface VisionExtractionResult {
  text: string;
  metadata: Record<string, unknown>;
  char_count: number;
  page_count: number;
}

interface FunctionalRequirement {
  id: string;
  description: string;
}

interface NonFunctionalRequirement {
  id: string;
  description: string;
  category: string;
}

interface ExtractedRequirements {
  functional: FunctionalRequirement[];
  non_functional: NonFunctionalRequirement[];
}

type WizardStep = 1 | 2 | 3 | 4; // 4 = success screen

export default function AddProjectPopup({ open, onClose, onProjectCreated, projectCount }: AddProjectPopupProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<WizardStep>(1);
  
  // Step 1: Project Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Step 2: Vision Document
  const [visionFile, setVisionFile] = useState<File | null>(null);
  const [visionProcessing, setVisionProcessing] = useState(false);
  const [visionProcessed, setVisionProcessed] = useState(false);
  const [visionProgress, setVisionProgress] = useState(0);
  const [visionExtractedText, setVisionExtractedText] = useState<string | null>(null);
  const [visionError, setVisionError] = useState<string | null>(null);
  
  // Step 3: Requirements Document
  const [requirementsFile, setRequirementsFile] = useState<File | null>(null);
  const [requirementsProcessing, setRequirementsProcessing] = useState(false);
  const [requirementsProcessed, setRequirementsProcessed] = useState(false);
  const [requirementsProgress, setRequirementsProgress] = useState(0);
  const [extractedRequirements, setExtractedRequirements] = useState<ExtractedRequirements | null>(null);
  const [requirementsError, setRequirementsError] = useState<string | null>(null);

  // Project creation state
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [requirementsCount, setRequirementsCount] = useState(0);

  // Refs for interval cleanup (used for progress simulation)
  const visionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const requirementsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when popup closes
  useEffect(() => {
    if (!open) {
      // Clear any running intervals
      if (visionIntervalRef.current) {
        clearInterval(visionIntervalRef.current);
        visionIntervalRef.current = null;
      }
      if (requirementsIntervalRef.current) {
        clearInterval(requirementsIntervalRef.current);
        requirementsIntervalRef.current = null;
      }
      
      setStep(1);
      setTitle("");
      setDescription("");
      setVisionFile(null);
      setVisionProcessing(false);
      setVisionProcessed(false);
      setVisionProgress(0);
      setVisionExtractedText(null);
      setVisionError(null);
      setRequirementsFile(null);
      setRequirementsProcessing(false);
      setRequirementsProcessed(false);
      setRequirementsProgress(0);
      setExtractedRequirements(null);
      setRequirementsError(null);
      setIsCreatingProject(false);
      setCreationError(null);
      setRequirementsCount(0);
    }
  }, [open]);

  // Process vision document via API
  const processVisionDocument = async (file: File) => {
    setVisionProcessing(true);
    setVisionProcessed(false);
    setVisionProgress(0);
    setVisionError(null);

    // Start progress simulation
    let progress = 0;
    visionIntervalRef.current = setInterval(() => {
      progress += 5;
      if (progress <= 90) {
        setVisionProgress(progress);
      }
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/projects/vision/extract`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to process document: ${response.status}`);
      }

      const result: VisionExtractionResult = await response.json();
      setVisionExtractedText(result.text);
      setVisionProgress(100);
      setVisionProcessed(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process vision document";
      setVisionError(message);
      setVisionProgress(0);
    } finally {
      if (visionIntervalRef.current) {
        clearInterval(visionIntervalRef.current);
        visionIntervalRef.current = null;
      }
      setVisionProcessing(false);
    }
  };

  // Process requirements document via API
  const processRequirementsDocument = async (file: File) => {
    setRequirementsProcessing(true);
    setRequirementsProcessed(false);
    setRequirementsProgress(0);
    setRequirementsError(null);

    // Start progress simulation
    let progress = 0;
    requirementsIntervalRef.current = setInterval(() => {
      progress += 3;
      if (progress <= 90) {
        setRequirementsProgress(progress);
      }
    }, 500);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/projects/requirements/extract`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to extract requirements: ${response.status}`);
      }

      const result: ExtractedRequirements = await response.json();
      setExtractedRequirements(result);
      setRequirementsProgress(100);
      setRequirementsProcessed(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to extract requirements";
      setRequirementsError(message);
      setRequirementsProgress(0);
    } finally {
      if (requirementsIntervalRef.current) {
        clearInterval(requirementsIntervalRef.current);
        requirementsIntervalRef.current = null;
      }
      setRequirementsProcessing(false);
    }
  };

  // Handle vision file selection
  useEffect(() => {
    if (visionFile && !visionProcessing && !visionProcessed) {
      processVisionDocument(visionFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visionFile]);

  // Handle requirements file selection
  useEffect(() => {
    if (requirementsFile && !requirementsProcessing && !requirementsProcessed) {
      processRequirementsDocument(requirementsFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requirementsFile]);

  // Create project via API
  const createProject = async () => {
    if (!user?.id) {
      setCreationError("You must be logged in to create a project");
      return;
    }

    setIsCreatingProject(true);
    setCreationError(null);

    try {
      // Generate project_id based on current count (PRJ-001, PRJ-002, etc.)
      const nextProjectNumber = projectCount + 1;
      const projectId = `PRJ-${String(nextProjectNumber).padStart(3, '0')}`;
      
      // Use FormData to send files along with form fields
      const formData = new FormData();
      
      // Required fields
      formData.append("title", title.trim());
      formData.append("project_id", projectId);
      
      // Optional fields
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      if (visionFile?.name) {
        formData.append("vision_document_name", visionFile.name);
      }
      if (visionExtractedText) {
        formData.append("vision_extracted_text", visionExtractedText);
      }
      if (requirementsFile?.name) {
        formData.append("requirements_document_name", requirementsFile.name);
      }
      
      // Add requirements as JSON string
      if (extractedRequirements) {
        formData.append("requirements_json", JSON.stringify(extractedRequirements));
      }
      
      // Add document files
      if (visionFile) {
        formData.append("vision_file", visionFile);
      }
      if (requirementsFile) {
        formData.append("requirements_file", requirementsFile);
      }

      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/projects`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.id}`,
          // Note: Don't set Content-Type header - browser will set it with boundary for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to create project: ${response.status}`);
      }

      const result = await response.json();
      setRequirementsCount(result.requirements_count || 0);
      setStep(4);
      
      // Notify parent to refresh project list
      onProjectCreated?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create project";
      setCreationError(message);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const canProceedStep1 = title.trim() !== "" && description.trim() !== "";
  const canProceedStep2 = visionProcessed && !visionError;
  const canProceedStep3 = requirementsProcessed && !requirementsError && !isCreatingProject;

  const handleNext = async () => {
    if (step === 3) {
      // On step 3, create the project instead of just moving to step 4
      await createProject();
    } else if (step < 4) {
      setStep((step + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as WizardStep);
    }
  };

  const handleNavigateToRequirements = () => {
    onClose();
    router.push("/requirements");
  };

  const handleClose = () => {
    onClose();
  };

  if (!open) return null;

  const stepTitles = {
    1: "Project Information",
    2: "Vision Document",
    3: "Requirements Document",
    4: "Project Created"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-lg w-full max-w-2xl relative overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-6 pb-4 border-b border-border-light dark:border-border-dark">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-primary transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={22} />
          </button>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {step === 4 ? "Success!" : "Add Project"}
          </h2>
          
          {/* Step Indicator */}
          {step !== 4 && (
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      s === step
                        ? "bg-primary text-white"
                        : s < step
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {s < step ? <Check size={16} /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 rounded ${
                        s < step ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {step !== 4 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Step {step} of 3: {stepTitles[step]}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="px-8 py-6 min-h-[280px]">
          {/* Step 1: Project Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none min-h-[120px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter project description"
                />
              </div>
            </div>
          )}

          {/* Step 2: Vision Document */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-gray-600 dark:text-gray-300">
                Upload the project vision document. The system will extract the text content for analysis.
              </p>
              
              <div className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-8 text-center">
                {!visionFile ? (
                  <label className="cursor-pointer flex flex-col items-center gap-3">
                    <UploadCloud size={48} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Click to upload vision document
                    </span>
                    <span className="text-sm text-gray-400">PDF, DOCX, or TXT files</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={(e) => setVisionFile(e.target.files?.[0] || null)}
                    />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <FileText size={32} className="text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {visionFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(visionFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    
                    {visionProcessing && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <Loader2 size={18} className="animate-spin" />
                          <span className="text-sm">Extracting text from document...</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${visionProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{visionProgress}% complete</p>
                      </div>
                    )}
                    
                    {visionProcessed && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-green-500">
                          <CheckCircle2 size={18} />
                          <span className="text-sm">Text extraction complete!</span>
                        </div>
                        {visionExtractedText && (
                          <p className="text-xs text-gray-500">
                            Extracted {visionExtractedText.length.toLocaleString()} characters
                          </p>
                        )}
                      </div>
                    )}

                    {visionError && (
                      <div className="flex items-center justify-center gap-2 text-red-500">
                        <AlertCircle size={18} />
                        <span className="text-sm">{visionError}</span>
                      </div>
                    )}
                    
                    {!visionProcessing && (
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline"
                        onClick={() => {
                          setVisionFile(null);
                          setVisionProcessed(false);
                          setVisionProgress(0);
                          setVisionExtractedText(null);
                          setVisionError(null);
                        }}
                      >
                        Remove and upload different file
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Requirements Document */}
          {step === 3 && (
            <div className="space-y-5">
              <p className="text-gray-600 dark:text-gray-300">
                Upload the requirements document. The system will extract functional and non-functional requirements.
              </p>
              
              <div className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-8 text-center">
                {!requirementsFile ? (
                  <label className="cursor-pointer flex flex-col items-center gap-3">
                    <UploadCloud size={48} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Click to upload requirements document
                    </span>
                    <span className="text-sm text-gray-400">PDF, DOCX, or TXT files</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={(e) => setRequirementsFile(e.target.files?.[0] || null)}
                    />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <FileText size={32} className="text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {requirementsFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(requirementsFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    
                    {requirementsProcessing && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <Loader2 size={18} className="animate-spin" />
                          <span className="text-sm">Extracting requirements from document...</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${requirementsProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{requirementsProgress}% complete</p>
                      </div>
                    )}
                    
                    {requirementsProcessed && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-green-500">
                          <CheckCircle2 size={18} />
                          <span className="text-sm">Requirements extraction complete!</span>
                        </div>
                        {extractedRequirements && (
                          <p className="text-xs text-gray-500">
                            Found {extractedRequirements.functional.length} functional and {extractedRequirements.non_functional.length} non-functional requirements
                          </p>
                        )}
                      </div>
                    )}

                    {requirementsError && (
                      <div className="flex items-center justify-center gap-2 text-red-500">
                        <AlertCircle size={18} />
                        <span className="text-sm">{requirementsError}</span>
                      </div>
                    )}

                    {creationError && (
                      <div className="mt-2 flex items-center justify-center gap-2 text-red-500">
                        <AlertCircle size={18} />
                        <span className="text-sm">{creationError}</span>
                      </div>
                    )}
                    
                    {!requirementsProcessing && (
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline"
                        onClick={() => {
                          setRequirementsFile(null);
                          setRequirementsProcessed(false);
                          setRequirementsProgress(0);
                          setExtractedRequirements(null);
                          setRequirementsError(null);
                          setCreationError(null);
                        }}
                      >
                        Remove and upload different file
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Project Created Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2 max-w-md">
                Your project &quot;{title}&quot; has been created with the uploaded documents.
              </p>
              {requirementsCount > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {requirementsCount} requirement{requirementsCount !== 1 ? 's' : ''} extracted and saved.
                </p>
              )}
              <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 max-w-md">
                <p className="text-gray-700 dark:text-gray-200 text-sm">
                  Would you like to navigate to the requirements page to generate conjectural requirements using AI?
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-border-light dark:border-border-dark flex justify-between">
          {step !== 4 ? (
            <>
              <button
                type="button"
                className="rounded-lg px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={step === 1 ? onClose : handleBack}
                disabled={isCreatingProject}
              >
                {step === 1 ? "Cancel" : "Back"}
              </button>
              <button
                type="button"
                className="rounded-lg px-6 py-2 bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleNext}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2) ||
                  (step === 3 && !canProceedStep3) ||
                  isCreatingProject
                }
              >
                {isCreatingProject && <Loader2 size={16} className="animate-spin" />}
                {step === 3 ? (isCreatingProject ? "Creating..." : "Finish") : "Next"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="rounded-lg px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={handleClose}
              >
                Close
              </button>
              <button
                type="button"
                className="rounded-lg px-6 py-2 bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                onClick={handleNavigateToRequirements}
              >
                Go to Requirements
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
