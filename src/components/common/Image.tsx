"use client";
import React, { useState, useEffect } from 'react';
import { cn } from '../../utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  showSkeleton?: boolean;
}

export const Image: React.FC<ImageProps> = ({ 
  src, 
  alt, 
  fallback = "https://images.unsplash.com/photo-1594750825015-49c2846b0977?auto=format&fit=crop&q=80&w=800", // A generic fashion/product placeholder
  className,
  showSkeleton = true,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallback);
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={cn("relative overflow-hidden bg-line", className)}>
      {/* Skeleton / Loading State */}
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 z-10 animate-shimmer bg-gradient-to-r from-line via-white/10 to-line bg-[length:200%_100%]" />
      )}
      
      <img
        src={imgSrc || fallback}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100",
          hasError ? "grayscale opacity-50" : ""
        )}
        onLoad={handleLoad}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          handleError();
        }}
        referrerPolicy="no-referrer"
        {...props}
      />

      {/* Error State Overlay */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none">
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-8 h-8 text-muted opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[8px] font-bold text-muted uppercase tracking-widest opacity-30">
              No Image
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
