"use client";

import Spinner from "@/components/ui/Spinner";

interface StepState {
  step1_elicitation: boolean;
  step2_analysis: boolean;
  step3_specification: boolean;
  step4_validation: boolean;
}

interface StepProgressProps {
  state: StepState;
}

const steps = [
  { key: "step1_elicitation", label: "Elicitation Step" },
  { key: "step2_analysis", label: "Analysis Step" },
  { key: "step3_specification", label: "Specification Step" },
  { key: "step4_validation", label: "Validation Step" },
] as const;

export default function StepProgress({ state }: StepProgressProps) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Subagents Progress</h2>
      <ul className="list-disc list-inside space-y-2">
        {steps.map(({ key, label }) => (
          <li key={key} className="flex items-center gap-2">
            <span>{label}:</span>
            {state[key] ? (
              <span className="text-green-600">✅ Completed</span>
            ) : (
              <Spinner size="sm" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}