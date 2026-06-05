// src/components/ui/Input.jsx
import React from 'react';
import { cn } from '../../utils/cn';

const Input = ({ 
  label, 
  error, 
  className = '', 
  required = false,
  icon: Icon,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
        <input
          className={cn(
            'w-full px-3 py-2 border rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-all duration-200',
            'placeholder:text-gray-400',
            error 
              ? 'border-red-500 focus:ring-red-500 bg-red-50/10' 
              : 'border-gray-200 hover:border-gray-300',
            Icon && 'pl-9',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;