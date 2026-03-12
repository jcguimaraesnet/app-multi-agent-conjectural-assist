"use client";

import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'default' | 'sm';
  className?: string;
}

export default function Toggle({ checked, onChange, disabled, size = 'default', className }: ToggleProps) {
  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex items-center rounded-full transition-colors",
        isSmall ? "h-5 w-9" : "h-6 w-11",
        checked ? "bg-primary" : "bg-gray-300 dark:bg-gray-600",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span
        className={cn(
          "inline-block transform rounded-full bg-white transition-transform",
          isSmall ? "h-3 w-3" : "h-4 w-4",
          checked
            ? isSmall ? "translate-x-4.5" : "translate-x-6"
            : "translate-x-1"
        )}
      />
    </button>
  );
}
