import React from 'react';
import { cn } from '../utils';

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ activeCategory, onCategoryChange }) {
  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'fabric', label: 'Fabric' },
  ];

  return (
    <div className="flex space-x-2 p-1 bg-line rounded-2xl w-fit mx-auto mb-12">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={cn(
            "px-4 md:px-8 py-3 rounded-full text-[10px] md:text-xs font-bold uppercase  tracking-wider md:tracking-widest transition-all duration-300",
            activeCategory === cat.id
              ? "bg-primary text-white shadow-lg scale-105"
              : "text-muted hover:text-primary hover:bg-line/50"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};
