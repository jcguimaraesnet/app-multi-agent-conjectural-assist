import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-primary text-white dark:text-black",
    "hover:brightness-110",
    "shadow-lg shadow-primary/20"
  ),
  secondary: cn(
    "bg-gray-900 dark:bg-white",
    "text-white dark:text-black",
    "hover:bg-black dark:hover:bg-gray-200",
    "shadow-lg shadow-gray-500/20"
  ),
  ghost: cn(
    "text-gray-500 dark:text-gray-400",
    "hover:text-primary dark:hover:text-[#FDBA74]",
    "uppercase tracking-wide"
  ),
  outline: cn(
    "bg-gray-200 dark:bg-gray-700",
    "text-gray-700 dark:text-gray-200",
    "hover:bg-gray-300 dark:hover:bg-gray-600"
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "font-medium rounded-lg transition-colors",
          "flex items-center justify-center gap-2",
          "flex-shrink-0",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
