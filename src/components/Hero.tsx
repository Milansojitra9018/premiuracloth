"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ShoppingBag, Ruler, ChevronUp, ChevronDown } from 'lucide-react';
import { Image } from './common/Image';

const HERO_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1920",
    tag: "New Collection 2026",
    title: "ELEVATE YOUR STYLE QUOTIENT",
    description: "Discover premium ready-made clothing and exquisite bulk fabrics. Crafted for those who demand excellence in every thread.",
    primaryBtn: { text: "Shop All", link: "/products" },
    secondaryBtn: { text: "Bulk Fabric", link: "/fabric" }
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1920",
    tag: "Summer Essentials",
    title: "VIBRANT TEXTURES & PATTERNS",
    description: "Explore our curated summer collection designed for maximum comfort and unparalleled style in the heat.",
    primaryBtn: { text: "Summer Shop", link: "/products?season=summer" },
    secondaryBtn: { text: "View Fabrics", link: "/fabric" }
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1920",
    tag: "Artisan Quality",
    title: "THE ART OF FINE TAILORING",
    description: "Experience the perfect blend of traditional craftsmanship and modern precision in every piece we create.",
    primaryBtn: { text: "New Arrivals", link: "/products" },
    secondaryBtn: { text: "Our Story", link: "/faq" }
  }
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for down, -1 for up

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    initial: (direction: number) => ({
      y: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        y: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    },
    exit: (direction: number) => ({
      y: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: {
        y: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    })
  };

  const currentSlide = HERO_SLIDES[currentIndex];

  return (
    <div className="relative h-[calc(100vh-220px)] min-h-[680px] overflow-hidden bg-primary-dark">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 h-fit"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 h-fit">
            <Image 
              src={currentSlide.image} 
              alt={currentSlide.title} 
              className="w-full h-full object-cover opacity-50"
              fallback="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/40 to-transparent" />
          </div>

          <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-start pt-20 md:pt-24 items-start pr-16 md:pr-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <span className="inline-block px-4 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-bold tracking-[0.2em] uppercase mb-6">
                {currentSlide.tag}
              </span>
              <h1 className="text-2xl md:text-4xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[0.9] mb-8">
                {currentSlide.title.split(' ').map((word, i) => (
                  <React.Fragment key={i}>
                    {i === 2 ? <><br /><span className="italic text-transparent bg-clip-text bg-gradient-to-r from-white via-secondary to-white/40">{word}</span> </> : word + ' '}
                  </React.Fragment>
                ))}
              </h1>
              <p className="text-base md:text-lg text-white/70 mb-10 max-w-lg leading-relaxed">
                {currentSlide.description}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href={currentSlide.primaryBtn.link} className="group flex items-center space-x-3 bg-secondary text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold hover:opacity-90 transition-all text-sm md:text-base">
                  <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                  <span>{currentSlide.primaryBtn.text}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href={currentSlide.secondaryBtn.link} className="group flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold hover:bg-white/20 transition-all text-sm md:text-base">
                  <Ruler className="w-4 h-4 md:w-5 md:h-5" />
                  <span>{currentSlide.secondaryBtn.text}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls - Right Side */}
      <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col space-y-4 z-20">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > currentIndex ? 1 : -1);
              setCurrentIndex(i);
            }}
            className={`w-1.5 md:w-2 h-8 md:h-12 rounded-full transition-all duration-300 ${
              currentIndex === i ? 'bg-secondary h-12 md:h-16' : 'bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Offers Marquee - Always visible at bottom of Hero */}
      <div className="absolute bottom-0 left-0 right-0 bg-secondary py-4 overflow-hidden border-t border-white/10 z-30">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap space-x-12"
        >
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-white font-bold text-[10px] md:text-sm tracking-widest uppercase">
              ✨ 20% OFF ON FIRST ORDER • FREE SHIPPING ON ORDERS OVER $200 • NEW SUMMER COLLECTION OUT NOW ✨
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
