"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { productService } from "@/src/services/productService";
import { Hero } from "@/src/components/Hero";
import { ProductCard } from "@/src/components/ProductCard";
import { CategoryFilter } from "@/src/components/CategoryFilter";
import { Product } from "@/src/types";
import { mockProducts } from "@/src/mockData";
import { useCart } from "@/src/context/CartContext";
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Image } from "@/src/components/common/Image";
import { formatCurrency, getProductPrice } from "@/src/utils";
import SEO from "@/src/components/SEO";

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().getMonth();
  const currentSeason = (currentMonth >= 3 && currentMonth <= 8) ? 'summer' : 'winter';

  useEffect(() => {
    const unsubscribe = productService.subscribeToProducts((productList) => {
      if (productList.length === 0) {
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      } else {
        setProducts(productList);
        setFilteredProducts(productList);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = products;
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(result);
  }, [activeCategory, searchQuery, products]);

  return (
    <>
      <SEO 
        title="Premium Clothing & Fabric Studio"
        description="Shop the most exclusive collection of premium clothing and high-quality fabrics. Experience the perfect blend of style, comfort, and luxury with Premiura."
        keywords="home, premium fashion, luxury clothing, fabric studio, trendy wear"
      />
      <Hero />
      
      {/* Collection Categories */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/men" className="group relative h-[400px] overflow-hidden rounded-3xl">
            <Image 
              src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&q=80&w=1000" 
              alt="Men's Collection" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/40 transition-colors" />
            <div className="absolute bottom-10 left-10 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2">New Arrival</p>
              <h3 className="text-3xl font-bold tracking-tighter mb-4">MEN'S COLLECTION</h3>
              <div className="inline-flex items-center space-x-2 bg-bg text-ink px-6 py-2 rounded-full text-sm font-bold">
                <span>Shop Now</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
          <Link href="/women" className="group relative h-[400px] overflow-hidden rounded-3xl">
            <Image 
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1000" 
              alt="Women's Collection" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/40 transition-colors" />
            <div className="absolute bottom-10 left-10 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2">New Arrival</p>
              <h3 className="text-3xl font-bold tracking-tighter mb-4">WOMEN'S COLLECTION</h3>
              <div className="inline-flex items-center space-x-2 bg-bg text-ink px-6 py-2 rounded-full text-sm font-bold">
                <span>Shop Now</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
          <Link href="/kids" className="group relative h-[400px] overflow-hidden rounded-3xl">
            <Image 
              src="https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&q=80&w=1000" 
              alt="Kids' Collection" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/40 transition-colors" />
            <div className="absolute bottom-10 left-10 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2">New Arrival</p>
              <h3 className="text-3xl font-bold tracking-tighter mb-4">KIDS' COLLECTION</h3>
              <div className="inline-flex items-center space-x-2 bg-bg text-ink px-6 py-2 rounded-full text-sm font-bold">
                <span>Shop Now</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Trending Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted mb-2">Most Popular</p>
            <h2 className="text-4xl font-serif font-bold tracking-tight">Trending Now</h2>
          </div>
          <Link href="/products" className="text-sm font-bold underline underline-offset-8 hover:text-muted transition-colors">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.filter(p => p.isTrending).slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted mb-2">Fresh From The Studio</p>
            <h2 className="text-4xl font-serif font-bold tracking-tight">New Arrivals</h2>
          </div>
          <Link href="/products" className="text-sm font-bold underline underline-offset-8 hover:text-muted transition-colors">Shop The Drop</Link>
        </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {products.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      </section>

      {/* Seasonal Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="bg-primary rounded-[40px] overflow-hidden flex flex-col md:flex-row items-center">
          <div className="flex-1 p-12 md:p-24 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 mb-4">Seasonal Special</p>
            <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-8 uppercase">
              {currentSeason === 'summer' ? 'Summer Vibes' : 'Winter Essentials'}
            </h2>
            <p className="text-white/60 text-lg max-w-md mb-12">
              Discover our curated {currentSeason} collection designed for maximum comfort and style.
            </p>
            <Link href={`/products?season=${currentSeason}`}
              className="inline-flex items-center space-x-2 bg-bg text-ink px-10 py-4 rounded-full font-bold hover:opacity-90 transition-all"
            >
              <span>Explore Collection</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 h-[400px] md:h-[600px] w-full">
            <Image 
              src={currentSeason === 'summer' 
                ? "https://images.unsplash.com/photo-1523381235312-3a16838b452c?auto=format&fit=crop&q=80&w=1000"
                : "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1000"
              } 
              alt="Seasonal Collection" 
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Brand Spotlight / Under 500 Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-secondary mb-4">Exclusive Deals</p>
          <h2 className="text-5xl font-serif font-bold tracking-tight uppercase">Budget Spotlight</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { brand: "MAX", deal: `UNDER ${formatCurrency(499)}`, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=500" },
            { brand: "DN MX", deal: `UNDER ${formatCurrency(799)}`, img: "https://images.unsplash.com/photo-1529139572764-798c7df2dd74?auto=format&fit=crop&q=80&w=500" },
            { brand: "AVSAR", deal: "MIN. 50% OFF", img: "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&q=80&w=500" },
            { brand: "POINT COVE", deal: `UNDER ${formatCurrency(599)}`, img: "https://images.unsplash.com/photo-1519234221762-4b135867c406?auto=format&fit=crop&q=80&w=500" },
            { brand: "YOUSTA", deal: `UNDER ${formatCurrency(299)}`, img: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&q=80&w=500" },
            { brand: "LEE COOPER", deal: "30-70% OFF", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=500" },
            { brand: "HELLCAT", deal: "MIN. 70% OFF", img: "https://images.unsplash.com/photo-1503910368127-b4288eca296a?auto=format&fit=crop&q=80&w=500" },
            { brand: "THREADS", deal: "MIN. 50% OFF", img: "https://images.unsplash.com/photo-1523381235312-3a16838b452c?auto=format&fit=crop&q=80&w=500" },
            { brand: "TOONY PORT", deal: "MIN. 50% OFF", img: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&q=80&w=500" },
            { brand: "MOM'S LOVE", deal: `STARTING ${formatCurrency(119)}`, img: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=500" },
            { brand: "WOTROT", deal: `UNDER ${formatCurrency(699)}`, img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=500" },
            { brand: "PUMA", deal: "MIN. 40% OFF", img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=500" },
          ].map((item, i) => (
            <Link 
              key={i} 
              href={`/products?q=${item.brand}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-line"
            >
              <Image 
                src={item.img} 
                alt={item.brand} 
                className="w-full h-full transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-4 text-center text-white">
                <h4 className="font-black text-lg tracking-tighter leading-none mb-1">{item.brand}</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{item.deal}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Twirl Into Summer Section */}
      <section className="max-w-7xl mx-auto px-4 py-24 border-t border-line">
        <div className="text-center mb-16">
          <h2 className="text-6xl font-serif font-bold tracking-tight uppercase italic">Twirl Into Summer</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            "https://images.unsplash.com/photo-1502033006978-cce1d72de57e?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1519234221762-4b135867c406?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&q=80&w=800"
          ].map((img, i) => (
            <div key={i} className="aspect-[3/4] rounded-3xl overflow-hidden bg-line">
              <Image 
                src={img} 
               
                className="w-full h-full hover:scale-105 transition-transform duration-700"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Fabrics Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Premium Quality</p>
            <h2 className="text-5xl font-serif font-bold tracking-tight">The Art of Fabric</h2>
            <p className="text-muted text-lg leading-relaxed">
              We source only the finest materials from across the globe. From Egyptian cotton to Italian silk, our fabrics are chosen for their durability, comfort, and timeless elegance.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <h4 className="font-bold text-xl mb-2">100% Organic</h4>
                <p className="text-sm text-muted">Sustainably sourced and processed without harmful chemicals.</p>
              </div>
              <div>
                <h4 className="font-bold text-xl mb-2">Artisan Woven</h4>
                <p className="text-sm text-muted">Traditional techniques meeting modern precision.</p>
              </div>
            </div>
            <Link href="/fabric" className="inline-block bg-primary text-white px-10 py-4 rounded-full font-bold hover:opacity-90 transition-all">
              Browse Fabrics
            </Link>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 h-[600px]">
            <Image src="https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=1000" alt="Fabric 1" className="w-full h-full rounded-3xl" />
            <Image src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1000" alt="Fabric 2" className="w-full h-full rounded-3xl mt-12" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-line/20 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold tracking-tight">What Our Clients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah J.", role: "Fashion Designer", text: "The quality of the silk I ordered exceeded my expectations. The colors are vibrant and the texture is divine." },
              { name: "Michael R.", role: "Boutique Owner", text: "Fast shipping and excellent customer service. The bulk order process was seamless and the fabric quality is consistent." },
              { name: "Elena P.", role: "Home Sewist", text: "I love the summer collection! The linen is so breathable and easy to work with. Highly recommend for any project." }
            ].map((t, i) => (
              <div key={i} className="bg-bg p-8 rounded-3xl shadow-sm border border-line">
                <p className="text-muted italic mb-6">"{t.text}"</p>
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-xs text-muted uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="bg-line rounded-[40px] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-secondary rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary rounded-full blur-[120px]" />
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-6">Join The Inner Circle</h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-12">
            Subscribe to receive updates, access to exclusive deals, and more.
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white focus:outline-none focus:border-white transition-colors"
            />
            <button className="bg-bg text-ink px-8 py-4 rounded-full font-bold hover:opacity-90 transition-all">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold tracking-tight mb-4">Our Collection</h2>
          <p className="text-muted max-w-lg mx-auto">
            Browse through our curated selection of premium apparel and high-quality fabrics.
          </p>
        </div>

        <CategoryFilter 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-line rounded-2xl aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-muted font-medium">No products found for this category.</p>
          </div>
        )}

        <div className="mt-16 text-center">
          <Link href="/products" 
            className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all"
          >
            <span>View All Products</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
};
