
import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 w-full animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-64 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="h-10 w-32 bg-slate-100 rounded"></div>
            <div className="h-12 w-12 bg-slate-100 rounded-full"></div>
          </div>
          <div className="mt-auto pt-6 border-t border-slate-50">
            <div className="h-4 w-full bg-slate-50 rounded mb-2"></div>
            <div className="h-4 w-3/4 bg-slate-50 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
