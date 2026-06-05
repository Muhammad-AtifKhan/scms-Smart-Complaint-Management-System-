// src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ fullScreen = true, message = 'Loading...' }) => {
  const containerClass = fullScreen 
    ? "min-h-screen fixed inset-0 bg-gray-50/80 backdrop-blur-sm z-50"
    : "py-12";
  
  return (
    <div className={`${containerClass} flex items-center justify-center`}>
      <div className="text-center">
        {/* Animated Spinner */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-14 h-14 border-4 border-primary-100 rounded-full animate-pulse"></div>
          {/* Inner spinner */}
          <div className="absolute top-0 left-0 w-14 h-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary-500 rounded-full"></div>
        </div>
        
        {/* Loading message */}
        <p className="mt-4 text-sm font-medium text-gray-600 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;