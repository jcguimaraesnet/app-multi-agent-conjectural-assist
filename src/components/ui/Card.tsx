import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function Card({ children, className, noPadding = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm",
        "border border-border-light dark:border-border-dark",
        "transition-colors duration-200",
        !noPadding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
