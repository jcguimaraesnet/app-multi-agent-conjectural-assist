"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Spinner from "@/components/ui/Spinner";

interface StepState {
  step1_elicitation: boolean;
  step2_analysis: boolean;
  step3_specification: boolean;
  step4_validation: boolean;
  pending_progress: boolean;
}

interface StepProgressProps {
  status: string;
  state: StepState;
  nodeName?: string;
  runId?: string;
}

const steps = [
  { key: "step1_elicitation", label: "Elicitation" },
  { key: "step2_analysis", label: "Analysis" },
  { key: "step3_specification", label: "Specification" },
  { key: "step4_validation", label: "Validation" },
] as const;

const CHECK_DISPLAY_MS = 300;

// Total phases: 0..8
// Even phase (0,2,4,6) = spinner for step at index phase/2
// Odd phase (1,3,5,7) = check for step at index (phase-1)/2
// Phase 8 = all done

export default function StepProgress({ state }: StepProgressProps) {
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    phaseRef.current += 1;
    setPhase(phaseRef.current);
  }, []);

  // Extract boolean values to use as stable deps
  const s1 = state.step1_elicitation;
  const s2 = state.step2_analysis;
  const s3 = state.step3_specification;
  const s4 = state.step4_validation;

  const pending = state.pending_progress;

  useEffect(() => {
    // Don't advance phases until pending_progress is true
    if (!pending) return;

    const p = phaseRef.current;
    const stepIndex = Math.floor(p / 2);
    const isCheckPhase = p % 2 === 1;

    // All done
    if (stepIndex >= steps.length) return;

    if (isCheckPhase) {
      // Check phase: wait 300ms then advance to next spinner
      timerRef.current = setTimeout(advance, CHECK_DISPLAY_MS);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    // Spinner phase: check if the corresponding state is already true
    const completedValues = [s1, s2, s3, s4];
    if (completedValues[stepIndex]) {
      // State is true — move to check phase immediately
      advance();
    }

    // If not completed, do nothing — wait for next state change to re-evaluate
  }, [phase, s1, s2, s3, s4, pending, advance]);

  const stepIndex = Math.floor(phase / 2);
  const isCheckPhase = phase % 2 === 1;
  const currentStep = stepIndex < steps.length ? steps[stepIndex] : null;

  if (!state.pending_progress) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        <span>Processing request...</span>
      </div>
    );
  }

  if (!currentStep) return null;

  return (
    <div className="flex items-center gap-2">
      {isCheckPhase ? (
        <span className="text-green-600">✅</span>
      ) : (
        <Spinner size="sm" />
      )}
      <span>{currentStep.label}</span>
    </div>
  );
}
