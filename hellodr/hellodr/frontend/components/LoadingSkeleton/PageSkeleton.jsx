import React from 'react';

const PageSkeleton = () => {
  return (
    <div className="animate-pulse p-4 md:p-8 max-w-7xl mx-auto">
      {/* Page title skeleton */}
      <div className="h-8 bg-gray-200 rounded-md w-1/3 mb-8"></div>
      
      {/* Content area skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
      
      <div className="space-y-4 mb-8">
        <div className="h-5 bg-gray-200 rounded-md w-5/6"></div>
        <div className="h-5 bg-gray-200 rounded-md w-full"></div>
        <div className="h-5 bg-gray-200 rounded-md w-4/6"></div>
      </div>
      
      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
        ))}
      </div>
    </div>
  );
};

export default PageSkeleton; 