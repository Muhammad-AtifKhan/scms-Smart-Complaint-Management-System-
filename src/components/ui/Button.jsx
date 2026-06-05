// src/components/ui/Button.jsx
import React from 'react';
import { cn } from '../../utils/cn';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  className = '',
  disabled = false,
  fullWidth = false,
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    outline: 'border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md',
    ghost: 'hover:bg-gray-100 text-gray-600',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm hover:shadow-md',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-base gap-2',
    xl: 'px-8 py-3 text-lg gap-2.5',
  };

  return (
    <button
      className={cn(
        // Base styles
        'font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95 transform',
        'flex items-center justify-center',
        // Variant and size
        variants[variant],
        sizes[size],
        // Full width option
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;