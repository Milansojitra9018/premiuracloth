"use client";
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageZoom({ src, alt, className }) {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleError = () => {
    if (!hasError) {
      setImgSrc("https://images.unsplash.com/photo-1594434296621-5135bc7595c4?q=80&w=1000&auto=format&fit=crop");
      setHasError(true);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden cursor-none group", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      <img 
        src={imgSrc} 
        alt={alt} 
        className="w-full h-full object-cover transition-transform duration-500"
        style={{
          transform: isHovering ? 'scale(1.05)' : 'scale(1)'
        }}
        onError={handleError}
        referrerPolicy="no-referrer"
      />
      
      <AnimatePresence>
        {isHovering && !hasError && (
          <>
            {/* Zoomed View Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                backgroundImage: `url(${imgSrc})`,
                backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                backgroundSize: '300%',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Subtle vignette for depth */}
              <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.1)]" />
            </motion.div>

            {/* Moving Lens */}
            <motion.div
              className="absolute w-32 h-32 border-2 border-white/50 bg-white/10 backdrop-blur-[2px] rounded-2xl pointer-events-none z-20 shadow-2xl"
              style={{
                left: `${mousePos.x}%`,
                top: `${mousePos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              {/* Crosshair lines */}
              <div className="absolute top-1/2 left-0 w-full h-px bg-white/20" />
              <div className="absolute left-1/2 top-0 w-px h-full bg-white/20" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
