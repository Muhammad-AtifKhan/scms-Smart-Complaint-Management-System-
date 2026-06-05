// src/components/ui/Card.jsx
import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ children, className = '', hover = false }) => {
  return (
    <div 
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-100',
        hover && 'transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={cn('px-6 py-4 border-b border-gray-100', className)}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={cn('px-6 py-4 border-t border-gray-100 bg-gray-50/30 rounded-b-xl', className)}>
    {children}
  </div>
);

export default Card;