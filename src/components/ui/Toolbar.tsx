import { cn } from '@/lib/utils';

interface ToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export default function Toolbar({ children, className }: ToolbarProps) {
  return (
    <div
      className={cn(
        "bg-surface-light dark:bg-surface-dark rounded-xl",
        "px-4 py-3 shadow-sm mb-4",
        "transition-colors duration-200",
        "flex items-center gap-3 overflow-x-auto",
        className
      )}
    >
      {children}
    </div>
  );
}
