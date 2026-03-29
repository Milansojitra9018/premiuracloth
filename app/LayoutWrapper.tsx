"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from "@/src/components/Navbar";
import { Cart } from "@/src/components/Cart";
import { useCart } from "@/src/context/CartContext";
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const TopBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const ads = [
    "✨ 20% OFF ON FIRST ORDER \u2022 USE CODE: FIRST20 ✨",
    "🚚 FREE SHIPPING ON ORDERS OVER $200 🚚",
    "🔥 NEW SUMMER COLLECTION OUT NOW \u2022 SHOP THE DROP 🔥"
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-secondary text-white overflow-hidden h-10 relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-xs font-bold uppercase tracking-[0.2em]"
        >
          {ads[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const Footer = () => (
      <footer className="bg-primary-dark text-white py-16 lg:py-24">
      <div className='mb-6 max-w-7xl mx-auto px-4'>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Newsletter</h4>
            <div className="flex space-x-2 w-fit">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-white/10 border-none rounded-full px-4 py-2 text-sm flex-1 focus:ring-1 focus:ring-white/20"
              />
              <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold">Join</button>
            </div>
          </div>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold tracking-tight">PREMIURA<span className="text-secondary italic">.</span></h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Redefining premium fashion and fabric sourcing for the modern era.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Shop</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><a href="/category/men" className="hover:text-white transition-colors">Men's Wear</a></li>
              <li><a href="/category/women" className="hover:text-white transition-colors">Women's Wear</a></li>
              <li><a href="/category/fabric" className="hover:text-white transition-colors">Bulk Fabric</a></li>
              <li><a href="/favorites" className="hover:text-white transition-colors">My Favorites</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Support</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/shipping" className="hover:text-white transition-colors">Shipping Policy</a></li>
              <li><a href="/returns" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
              <li><a href="/faq" className="hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-16 lg:mt-20 pt-8 border-t border-white/10 text-center text-[10px] text-white/40 uppercase tracking-[0.3em]">
          &copy; 2026 Premiura Fashion Group. All Rights Reserved.
        </div>
      </footer>
);


export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, cartCount } = useCart();
  const router = useRouter();

  // Handle client side hydration to prevent layout shift with Zustand or contexts
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const handleSearch = (query: string, category: string) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query);
    if (category !== 'all') params.set('category', category);
    
    router.push(`/products?${params.toString()}`);
  };

  if (!mounted) return <div className="min-h-screen bg-bg text-ink" />;

  return (
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-primary selection:text-white">
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        gutter={12}
        toastOptions={{
          className: 'premium-toast',
          duration: 3500,
          style: {
            background: 'rgba(255, 255, 255, 0.8)',
            color: '#1a1a1a',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            padding: '16px 24px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            maxWidth: '400px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          },
          success: {
            iconTheme: {
              primary: '#1a1a1a',
              secondary: '#ffffff',
            },
            style: {
              border: '1px solid rgba(34, 197, 94, 0.1)',
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.1)',
            }
          },
        }}
      />
      <div className="sticky top-0 z-50">
        <TopBanner />
        <Navbar 
          cartCount={cartCount}
          onCartClick={() => setIsCartOpen(true)}
          onSearch={handleSearch}
        />
      </div>

      <main>
        {children}
      </main>

      <Footer />

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
