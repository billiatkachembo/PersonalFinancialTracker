// src/components/SkeletonCard.tsx
import React from 'react';

const SkeletonCard = () => (
  <div className="animate-pulse p-4 border rounded shadow-md space-y-4 max-w-sm w-full mx-auto">
    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
    <div className="h-4 bg-gray-300 rounded w-full"></div>
    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
  </div>
);

export default SkeletonCard;
