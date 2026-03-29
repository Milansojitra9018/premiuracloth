"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from "@/src/firebase";
import { Product } from "@/src/types";
import { mockProducts } from "@/src/mockData";
import { useCart } from "@/src/context/CartContext";
import { formatCurrency, cn, getProductPrice } from "@/src/utils";
import { Star, ShoppingBag, Ruler, ArrowLeft, ShieldCheck, Truck, RotateCcw, Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Image } from "@/src/components/common/Image";
import SEO from "@/src/components/SEO";
import { useFavorites } from "@/src/context/FavoritesContext";
import { ImageZoom } from "@/src/components/ImageZoom";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useRouter();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Related Products Filter States
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedGsm, setSelectedGsm] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [isRelatedFilterOpen, setIsRelatedFilterOpen] = useState(false);

  const favorited = product ? isFavorite(product.id) : false;

  // Find other products with the same name but different colors
  const colorVariants = product ? mockProducts.filter(p =>
    p.name.split('(')[0].trim() === product.name.split('(')[0].trim() &&
    p.id !== product.id
  ) : [];

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(data);
          setSelectedColor(data.color || null);
        } else {
          // Fallback to mock
          const mock = mockProducts.find(p => p.id === id);
          setProduct(mock || null);
          setSelectedColor(mock?.color || null);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        // Fallback to mock on any error
        const mock = mockProducts.find(p => p.id === id);
        setProduct(mock || null);
        setSelectedColor(mock?.color || null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <button onClick={() => navigate.push('/')} className="text-ink underline">Back to Home</button>
      </div>
    );
  }

  const isFabric = product.category === 'fabric';

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

  // Related products logic
  const relatedProducts = mockProducts
    .filter(p => {
      const price = getProductPrice(p);
      const matchesBase = p.id !== product.id && p.category === product.category && (p.subcategory === product.subcategory || p.color === product.color);

      const matchesRating = selectedRatings.length === 0 || selectedRatings.some(r => p.rating >= r);

      const matchesPrice = selectedPriceRanges.length === 0 || selectedPriceRanges.some(rangeId => {
        const range = priceRanges.find(r => r.id === rangeId);
        return range ? (price >= range.min && price <= range.max) : false;
      });

      const matchesGsm = selectedGsm.length === 0 || (p.fabricInfo?.gsm && selectedGsm.includes(p.fabricInfo.gsm.toString()));
      const matchesMaterial = selectedMaterials.length === 0 || (p.fabricInfo?.material && selectedMaterials.includes(p.fabricInfo.material));
      const matchesSubcategory = selectedSubcategories.length === 0 || selectedSubcategories.includes(p.subcategory);

      return matchesBase && matchesRating && matchesPrice && matchesGsm && matchesMaterial && matchesSubcategory;
    })
    .slice(0, 8);

  const subcategories = Array.from(new Set(mockProducts.filter(p => p.category === product.category).map(p => p.subcategory)));

  const RelatedFilterContent = () => (
    <div className="space-y-8">
      {/* Category/Subcategory Filter */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-ink">Category</h4>
        <div className="space-y-2">
          {subcategories.map(sub => (
            <label key={sub} className="flex items-center group cursor-pointer">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={selectedSubcategories.includes(sub)}
                  onChange={() => setSelectedSubcategories(prev =>
                    prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
                  )}
                />
                <div className="w-4 h-4 border border-line rounded peer-checked:bg-primary peer-checked:border-primary transition-all" />
                <CheckIcon className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 left-0.5" />
              </div>
              <span className="ml-3 text-xs text-muted group-hover:text-ink capitalize">{sub}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-ink">Customer Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map(rating => (
            <label key={rating} className="flex items-center group cursor-pointer">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={selectedRatings.includes(rating)}
                  onChange={() => setSelectedRatings(prev =>
                    prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
                  )}
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

      {/* Price Filter */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-ink">Price</h4>
        <div className="space-y-2">
          {priceRanges.map(range => (
            <label key={range.id} className="flex items-center group cursor-pointer">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={selectedPriceRanges.includes(range.id)}
                  onChange={() => setSelectedPriceRanges(prev =>
                    prev.includes(range.id) ? prev.filter(r => r !== range.id) : [...prev, range.id]
                  )}
                />
                <div className="w-4 h-4 border border-line rounded peer-checked:bg-primary peer-checked:border-primary transition-all" />
                <CheckIcon className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 left-0.5" />
              </div>
              <span className="ml-3 text-xs text-muted group-hover:text-ink">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Fabric Specific Filters */}
      {isFabric && (
        <>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-ink">Material</h4>
            <div className="space-y-2">
              {['Cotton Denim', 'Pure Linen', 'Silk', 'Wool'].map(mat => (
                <label key={mat} className="flex items-center group cursor-pointer">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={selectedMaterials.includes(mat)}
                      onChange={() => setSelectedMaterials(prev =>
                        prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
                      )}
                    />
                    <div className="w-4 h-4 border border-line rounded peer-checked:bg-primary peer-checked:border-primary transition-all" />
                    <CheckIcon className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 left-0.5" />
                  </div>
                  <span className="ml-3 text-xs text-muted group-hover:text-ink">{mat}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-ink">GSM</h4>
            <div className="space-y-2">
              {['200', '350', '400'].map(gsm => (
                <label key={gsm} className="flex items-center group cursor-pointer">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={selectedGsm.includes(gsm)}
                      onChange={() => setSelectedGsm(prev =>
                        prev.includes(gsm) ? prev.filter(g => g !== gsm) : [...prev, gsm]
                      )}
                    />
                    <div className="w-4 h-4 border border-line rounded peer-checked:bg-primary peer-checked:border-primary transition-all" />
                    <CheckIcon className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 left-0.5" />
                  </div>
                  <span className="ml-3 text-xs text-muted group-hover:text-ink">{gsm} GSM</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <button
        onClick={() => {
          setSelectedRatings([]);
          setSelectedPriceRanges([]);
          setSelectedGsm([]);
          setSelectedMaterials([]);
          setSelectedSubcategories([]);
        }}
        className="text-[10px] font-bold text-muted hover:text-ink uppercase tracking-widest underline underline-offset-4"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <SEO
        title={product.name}
        description={product.description}
        keywords={`${product.category}, ${product.gender || ''}, ${product.fabricInfo?.material || ''}, ${product.name}, Premiura`}
        image={product.images[0]}
        type="product"
      />
      <button
        onClick={() => navigate.back()}
        className="flex items-center text-sm text-muted hover:text-ink mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Gallery */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-[3/4] rounded-3xl overflow-hidden bg-line relative"
          >
            <ImageZoom
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full"
            />
            {product.isTrending && (
              <div className="absolute top-6 left-6 bg-secondary text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                Trending
              </div>
            )}
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={cn(
                  "aspect-square rounded-xl overflow-hidden border-2 transition-all",
                  selectedImage === idx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-muted">{product.category}</span>
              <span className="text-line">/</span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted">{product.subcategory}</span>
            </div>
            <h1 className="text-4xl font-serif font-bold tracking-tight mb-4 text-ink">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-ink">{product.rating}</span>
                <span className="text-muted text-sm">({product.reviewsCount} reviews)</span>
              </div>
              <div className="h-4 w-px bg-line" />
              <span className="text-sm text-green-600 font-medium">In Stock</span>
            </div>
            <p className="text-3xl font-bold tracking-tight text-success">
              {formatCurrency(getProductPrice(product))}
              {isFabric && <span className="text-lg font-sans font-normal text-muted"> / meter</span>}
            </p>
          </div>

          {/* Color Selection */}
          <div className="mb-10">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
              Color: <span className="text-ink">{selectedColor || 'N/A'}</span>
            </h4>
            <div className="flex flex-wrap gap-3">
              {/* Current Product Color */}
              {product.color && (
                <button
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all p-0.5",
                    selectedColor === product.color ? "border-primary" : "border-transparent"
                  )}
                  onClick={() => setSelectedColor(product.color!)}
                  title={product.color}
                >
                  <div
                    className="w-full h-full rounded-full border border-ink/10"
                    style={{ backgroundColor: product.color.toLowerCase() }}
                  />
                </button>
              )}
              {/* Variant Colors */}
              {colorVariants.map(variant => (
                <button
                  key={variant.id}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all p-0.5",
                    selectedColor === variant.color ? "border-primary" : "border-transparent"
                  )}
                  onClick={() => {
                    setSelectedColor(variant.color!);
                    navigate.push(`/product/${variant.id}`);
                  }}
                  title={variant.color}
                >
                  <div
                    className="w-full h-full rounded-full border border-ink/10"
                    style={{ backgroundColor: variant.color?.toLowerCase() }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="prose prose-sm text-muted mb-10 max-w-none">
            <p>{product.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="p-6 bg-line rounded-2xl">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">Care Instructions</h4>
              <ul className="text-sm text-muted space-y-2">
                <li>• Machine wash cold with like colors</li>
                <li>• Tumble dry low or hang to dry</li>
                <li>• Iron on low heat if needed</li>
                <li>• Do not bleach</li>
              </ul>
            </div>
            <div className="p-6 bg-line rounded-2xl">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">Shipping Info</h4>
              <ul className="text-sm text-muted space-y-2">
                <li>• Free standard shipping on orders over $200</li>
                <li>• Estimated delivery: 3-5 business days</li>
                <li>• Express shipping available at checkout</li>
                <li>• 30-day easy return policy</li>
              </ul>
            </div>
          </div>

          {isFabric && (
            <div className="bg-amber-50/10 border border-amber-100/20 p-6 rounded-2xl mb-10">
              <div className="flex items-start space-x-3">
                <Ruler className="w-5 h-5 text-amber-600 mt-1" />
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-400 text-sm">Fabric Order Policy</h4>
                  <ul className="text-xs text-amber-800 dark:text-amber-500 mt-2 space-y-1 list-disc list-inside">
                    <li>Minimum order: {product.fabricInfo?.minOrder} meters</li>
                    <li>50% advance payment required to process</li>
                    <li>Remaining 50% due on delivery/confirmation</li>
                    <li>GSM: {product.fabricInfo?.gsm} | Material: {product.fabricInfo?.material}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4 mb-12">
            <button
              onClick={() => addToCart(product)}
              className="flex-1 bg-primary text-white py-5 rounded-2xl font-bold flex items-center justify-center space-x-3 hover:opacity-90 transition-all active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={() => toggleFavorite(product.id)}
              className={cn(
                "p-5 rounded-2xl border transition-all active:scale-95",
                favorited ? "bg-secondary border-secondary text-white shadow-lg" : "border-line text-muted hover:text-secondary"
              )}
            >
              <Heart className={cn("w-6 h-6", favorited && "fill-current")} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-line">
            <div className="flex flex-col items-center text-center space-y-2">
              <Truck className="w-6 h-6 text-muted" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Free Shipping</span>
              <span className="text-[10px] text-muted">On orders over $200</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <RotateCcw className="w-6 h-6 text-muted" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Easy Returns</span>
              <span className="text-[10px] text-muted">30-day return policy</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <ShieldCheck className="w-6 h-6 text-muted" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Secure Payment</span>
              <span className="text-[10px] text-muted">100% secure checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-32 pt-32 border-t border-line">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-serif font-bold tracking-tight mb-2 uppercase italic text-ink">You May Also Like</h2>
            <p className="text-muted text-sm">Curated recommendations based on your selection.</p>
          </div>
          <button
            onClick={() => setIsRelatedFilterOpen(true)}
            className="lg:hidden flex items-center space-x-2 bg-line px-6 py-3 rounded-full text-sm font-bold text-ink"
          >
            <Star className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <RelatedFilterContent />
          </aside>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {isRelatedFilterOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsRelatedFilterOpen(false)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden"
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-[300px] bg-bg z-[110] p-8 lg:hidden overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold tracking-tighter uppercase text-ink">Filters</h2>
                    <button onClick={() => setIsRelatedFilterOpen(false)} className="text-ink">
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                  </div>
                  <RelatedFilterContent />
                  <button
                    onClick={() => setIsRelatedFilterOpen(false)}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold mt-12 uppercase tracking-widest text-xs"
                  >
                    View Results
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {relatedProducts.length > 0 ? (
                relatedProducts.map(p => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onClick={() => navigate.push(`/product/${p.id}`)}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-line mb-4 relative">
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/5 transition-colors" />
                    </div>
                    <h3 className="font-serif font-bold text-sm truncate uppercase tracking-tight text-ink">{p.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-secondary font-bold text-sm">{formatCurrency(getProductPrice(p))}</p>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-bold text-muted">{p.rating}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-24 text-center bg-line rounded-[40px] border border-dashed border-muted/20">
                  <p className="text-muted text-sm font-medium">No related products match your filters.</p>
                  <button
                    onClick={() => {
                      setSelectedRatings([]);
                      setSelectedPriceRanges([]);
                      setSelectedGsm([]);
                      setSelectedMaterials([]);
                      setSelectedSubcategories([]);
                    }}
                    className="text-secondary text-xs font-bold underline mt-4 uppercase tracking-widest"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
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
