"use client";
import React from 'react';
import { useRouter, usePathname } from "next/navigation";
import { useFavorites } from "@/src/context/FavoritesContext";
import { useCart } from "@/src/context/CartContext";
import { mockProducts } from "@/src/mockData";
import { ProductCard } from "@/src/components/ProductCard";
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import SEO from "@/src/components/SEO";

export default function Favorites() {
  const { favorites } = useFavorites();
  const { addToCart } = useCart();
  const navigate = useRouter();

  const favoriteProducts = mockProducts.filter(p => favorites.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <SEO 
        title="My Favorites"
        description="View and manage your favorite premium clothing and fabrics at Premiura. Save the items you love for later."
        keywords="favorites, wishlist, saved items, Premiura favorites"
      />
      <button 
        onClick={() => navigate.back()}
        className="flex items-center text-sm text-gray-500 hover:text-black mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="flex items-center space-x-4 mb-12">
        <div className="p-3 bg-red-50 rounded-2xl">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        </div>
        <div>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-ink">My Favorites</h1>
          <p className="text-muted text-sm mt-1">Items you've saved for later</p>
        </div>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="py-24 text-center bg-line/20 rounded-3xl border border-dashed border-line">
          <Heart className="w-12 h-12 text-muted/30 mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold text-ink">Your favorites list is empty</h2>
          <p className="text-muted text-sm mt-2 mb-8">Start exploring our collection and save items you love!</p>
          <button 
            onClick={() => navigate.push('/')}
            className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all shadow-lg"
          >
            Explore Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {favoriteProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={addToCart} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
