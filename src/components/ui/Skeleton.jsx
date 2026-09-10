// src/components/ui/Skeleton.jsx
import React from 'react';

export const SkeletonLine = ({ w = 'w-full', h = 'h-4', className = '' }) => (
  <div className={`skeleton ${w} ${h} ${className}`} />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`card p-4 flex items-center justify-between border border-gray-100 dark:border-brand-darkBorder ${className}`}>
    <div className="flex items-center gap-3 flex-1">
      <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonLine w="w-2/3" h="h-3.5" />
        <SkeletonLine w="w-1/3" h="h-3" />
      </div>
    </div>
    <SkeletonLine w="w-16" h="h-4" />
  </div>
);

export const SkeletonList = ({ count = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
