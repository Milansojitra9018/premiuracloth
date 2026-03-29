"use client";
import { useSearchParams } from "next/navigation";
import React, { useState, useMemo, useEffect } from 'react';
import { mockProducts } from "@/src/mockData";
import { ProductCard } from "@/src/components/ProductCard";
import { useCart } from "@/src/context/CartContext";
import { formatCurrency, cn, getProductPrice } from "@/src/utils";
import {
  Filter,
  ChevronDown,
  Star,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from "@/src/components/SEO";

const ITEMS_PER_PAGE = 8;

export default function Products() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? [searchParams.get('category')!] : []
  );
  const [selectedGenders, setSelectedGenders] = useState<string[]>(
    searchParams.get('gender') ? [searchParams.get('gender')!] : []
  );
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedGsm, setSelectedGsm] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update search query and category when URL param changes
  useEffect(() => {
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const gender = searchParams.get('gender');
    const maxPrice = searchParams.get('maxPrice');

    if (query !== null) {
      setSearchQuery(query);
    }
    if (category !== null) {
      setSelectedCategories([category]);
    }
    if (gender !== null) {
      setSelectedGenders([gender]);
    }
    if (maxPrice !== null) {
      // Find the range that fits this maxPrice or just set it
      // For simplicity, we'll just clear and let the user select
    }
    setCurrentPage(1);
  }, [searchParams]);

  // Categories for filter
  const categories = ['clothing', 'fabric'];
  const isFabricSelected = selectedCategories.includes('fabric');

  // Price Ranges based on currency
  const currency = formatCurrency(0).includes('₹') ? 'INR' : 'USD';
  const priceRanges = currency === 'INR' ? [
    { label: 'Under ₹1,000', min: 0, max: 1000, id: 'r1' },
    { label: '₹1,000 - ₹2,000', min: 1000, max: 2000, id: 'r2' },
    { label: '₹2,000 - ₹5,000', min: 2000, max: 5000, id: 'r3' },
    { label: 'Above ₹5,000', min: 5000, max: 100000, id: 'r4' },
  ] : [
    { label: 'Under $20', min: 0, max: 20, id: 'r1' },
    { label: '$20 - $50', min: 20, max: 50, id: 'r2' },
    { label: '$50 - $100', min: 50, max: 100, id: 'r3' },
    { label: 'Above $100', min: 100, max: 1000, id: 'r4' },
  ];

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const price = getProductPrice(product);
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesGender = selectedGenders.length === 0 || (product.gender && selectedGenders.includes(product.gender));

      const matchesPrice = selectedPriceRanges.length === 0 || selectedPriceRanges.some(rangeId => {
        const range = priceRanges.find(r => r.id === rangeId);
        return range ? (price >= range.min && price <= range.max) : false;
      });

      const matchesRating = selectedRatings.length === 0 || selectedRatings.some(r => product.rating >= r);

      const matchesGsm = selectedGsm.length === 0 || (product.fabricInfo?.gsm && selectedGsm.includes(product.fabricInfo.gsm.toString()));
      const matchesMaterial = selectedMaterials.length === 0 || (product.fabricInfo?.material && selectedMaterials.includes(product.fabricInfo.material));

      return matchesSearch && matchesCategory && matchesGender && matchesPrice && matchesRating && matchesGsm && matchesMaterial;
    }).sort((a, b) => {
      const priceA = getProductPrice(a);
      const priceB = getProductPrice(b);
      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured
    });
  }, [searchQuery, selectedCategories, selectedGenders, selectedPriceRanges, selectedRatings, selectedGsm, selectedMaterials, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setCurrentPage(1);
  };

  const toggleGender = (gender: string) => {
    setSelectedGenders(prev =>
      prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedGenders([]);
    setSelectedPriceRanges([]);
    setSelectedRatings([]);
    setSelectedGsm([]);
    setSelectedMaterials([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm uppercase tracking-widest text-ink">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-[10px] font-bold text-muted hover:text-primary uppercase tracking-wider"
          >
            Clear All
          </button>
        </div>

        {/* Category Filter */}
        <div className="space-y-4 mb-8">
          <h4 className="font-bold text-xs text-ink">Category</h4>
          <div className="space-y-2">
            {categories.map(cat => (
              <label key={cat} className="flex items-center group cursor-pointer">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <div className="w-4 h-4 border border-line rounded peer-checked:bg-primary peer-checked:border-primary transition-all" />
                  <CheckIcon className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 left-0.5" />
                </div>
                <span className="ml-3 text-sm text-muted group-hover:text-ink capitalize">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Gender Filter */}
        <div className="space-y-4 mb-8">
          <h4 className="font-bold text-xs text-ink">Collection</h4>
          <div className="space-y-2">
            {['men', 'women'].map(gender => (
              <label key={gender} className="flex items-center group cursor-pointer">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={selectedGenders.includes(gender)}
                    onChange={() => toggleGender(gender)}
                  />
                  <div className="w-4 h-4 border border-line rounded peer-checked:bg-primary peer-checked:border-primary transition-all" />
                  <CheckIcon className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 left-0.5" />
                </div>
                <span className="ml-3 text-sm text-muted group-hover:text-ink capitalize">{gender}'s Collection</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div className="space-y-4 mb-8">
          <h4 className="font-bold text-xs text-ink">Price</h4>
          <div className="space-y-2">
            {priceRanges.map(range => (
              <label key={range.id} className="flex items-center group cursor-pointer">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={selectedPriceRanges.includes(range.id)}
                    onChange={() => {
                      setSelectedPriceRanges(prev =>
                        prev.includes(range.id) ? prev.filter(r => r !== range.id) : [...prev, range.id]
                      );
                      setCurrentPage(1);
                    }}
                  />
                  <div className="w-4 h-4 border border-line rounded peer-checked:bg-primary peer-checked:border-primary transition-all" />
                  <CheckIcon className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 left-0.5" />
                </div>
                <span className="ml-3 text-sm text-muted group-hover:text-ink">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-4 mb-8">
          <h4 className="font-bold text-xs text-ink">Customer Rating</h4>
          <div className="space-y-2">
            {[4, 3, 2, 1].map(rating => (
              <label key={rating} className="flex items-center group cursor-pointer">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={selectedRatings.includes(rating)}
                    onChange={() => {
                      setSelectedRatings(prev =>
                        prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
                      );
                      setCurrentPage(1);
                    }}
                  />
                  <div className="w-4 h-4 border border-line rounded peer-checked:bg-primary peer-checked:border-primary transition-all" />
                  <CheckIcon className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 left-0.5" />
                </div>
                <div className="ml-3 flex items-center space-x-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3 h-3",
                          i < rating ? "text-amber-400 fill-amber-400" : "text-line"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted group-hover:text-ink">& Up</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Fabric Specific Filters */}
        {isFabricSelected && (
          <>
            <div className="space-y-4 mb-8">
              <h4 className="font-bold text-xs text-ink">Material</h4>
              <div className="space-y-2">
                {['Cotton Denim', 'Pure Linen', 'Silk', 'Wool'].map(mat => (
                  <label key={mat} className="flex items-center group cursor-pointer">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={selectedMaterials.includes(mat)}
                        onChange={() => {
                          setSelectedMaterials(prev =>
                            prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
                          );
                          setCurrentPage(1);
                        }}
                      />
                      <div className="w-4 h-4 border border-line rounded peer-checked:bg-primary peer-checked:border-primary transition-all" />
                      <CheckIcon className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 left-0.5" />
                    </div>
                    <span className="ml-3 text-sm text-muted group-hover:text-ink">{mat}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <h4 className="font-bold text-xs text-ink">GSM</h4>
              <div className="space-y-2">
                {['200', '350', '400'].map(gsm => (
                  <label key={gsm} className="flex items-center group cursor-pointer">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={selectedGsm.includes(gsm)}
                        onChange={() => {
                          setSelectedGsm(prev =>
                            prev.includes(gsm) ? prev.filter(g => g !== gsm) : [...prev, gsm]
                          );
                          setCurrentPage(1);
                        }}
                      />
                      <div className="w-4 h-4 border border-line rounded peer-checked:bg-primary peer-checked:border-primary transition-all" />
                      <CheckIcon className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 left-0.5" />
                    </div>
                    <span className="ml-3 text-sm text-muted group-hover:text-ink">{gsm} GSM</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <SEO
        title="All Products"
        description="Browse our complete collection of premium clothing and high-quality fabrics. Find exactly what you're looking for with our advanced filters."
        keywords="all products, fashion search, clothing catalog, fabric collection, Premiura shop"
      />
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:w-64 flex-shrink-0">
          <FilterSidebar />
        </aside>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-[280px] bg-bg z-[70] p-8 lg:hidden overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold tracking-tighter text-ink">Filters</h2>
                  <button onClick={() => setIsFilterOpen(false)}>
                    <X className="w-6 h-6 text-ink" />
                  </button>
                </div>
                <FilterSidebar />
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold mt-8"
                >
                  Show Results
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-4 flex-1">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center space-x-2 bg-line px-4 py-2 rounded-full text-sm font-bold text-ink"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-line border-none rounded-full text-sm focus:ring-2 focus:ring-primary/5 text-ink placeholder:text-muted"
                />
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end space-x-4">
              <div className="flex items-center bg-line rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn("p-1.5 rounded", viewMode === 'grid' ? "bg-bg text-primary shadow-sm" : "text-muted")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn("p-1.5 rounded", viewMode === 'list' ? "bg-bg text-primary shadow-sm" : "text-muted")}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-line border-none rounded-lg text-sm py-2 pl-3 pr-8 focus:ring-0 cursor-pointer text-ink"
              >
                <option value="featured" className='bg-muted'>Featured</option>
                <option value="price-low" className='bg-muted'>Price: Low to High</option>
                <option value="price-high" className='bg-muted'>Price: High to Low</option>
                <option value="rating" className='bg-muted'>Avg. Customer Review</option>
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-6 text-sm text-muted">
            Showing {filteredProducts.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} results
          </div>

          {/* Product Grid */}
          {paginatedProducts.length > 0 ? (
            <div className={cn(
              "grid gap-4 sm:gap-8",
              viewMode === 'grid' ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
            )}>
              {paginatedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  view={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-line rounded-3xl border border-dashed border-muted/20">
              <Search className="w-12 h-12 text-muted mx-auto mb-4" />
              <h2 className="text-xl font-bold text-ink">No products found</h2>
              <p className="text-muted text-sm mt-2">Try adjusting your filters or search query.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-line disabled:opacity-30 hover:bg-line transition-colors text-ink"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "w-10 h-10 rounded-full text-sm font-bold transition-all",
                    currentPage === i + 1 ? "bg-primary text-white" : "text-ink hover:bg-line"
                  )}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full border border-line disabled:opacity-30 hover:bg-line transition-colors text-ink"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
