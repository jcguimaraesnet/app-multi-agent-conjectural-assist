import { cn } from '@/lib/utils';
import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, id, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="sr-only" htmlFor={id}>
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              "w-full bg-white dark:bg-gray-800",
              "border border-border-light dark:border-gray-600 rounded-lg",
              "py-2 px-3 text-sm",
              "focus:ring-1 focus:ring-primary focus:border-primary",
              "dark:text-gray-200 outline-none",
              "appearance-none cursor-pointer",
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
