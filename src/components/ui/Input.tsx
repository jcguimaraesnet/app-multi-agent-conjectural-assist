import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';
import { Search } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  showSearchIcon?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, showSearchIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="sr-only" htmlFor={id}>
            {label}
          </label>
        )}
        <div className="relative">
          {showSearchIcon && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="w-5 h-5" />
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full bg-white dark:bg-gray-800",
              "border border-border-light dark:border-gray-600 rounded-lg",
              "py-2 text-sm",
              showSearchIcon ? "pl-10 pr-3" : "px-3",
              "focus:ring-1 focus:ring-primary focus:border-primary",
              "dark:text-gray-200 outline-none placeholder-gray-400",
              className
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
