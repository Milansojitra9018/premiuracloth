import { useParams } from "next/navigation";
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from 'firebase/firestore';
import { db } from "@/src/firebase";
import { Product } from "@/src/types";
import { mockProducts } from "@/src/mockData";
import { useCart } from "@/src/context/CartContext";
import { formatCurrency, cn, getProductPrice } from "@/src/utils";
import { Star, ShoppingBag, Ruler, ArrowLeft, ShieldCheck, Truck, RotateCcw, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Image } from "@/src/components/common/Image";
import SEO from "@/src/components/SEO";
import { useFavorites } from "@/src/context/FavoritesContext";
import { ImageZoom } from "@/src/components/ImageZoom";
import { useTheme } from '@/src/ThemeContext';

export default function FabricProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useRouter();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  const favorited = product ? isFavorite(product.id) : false;
  const { theme } = useTheme();

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
          const mock = mockProducts.find(p => p.id === id);
          setProduct(mock || null);
          setSelectedColor(mock?.color || null);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Fabric not found</h2>
        <button onClick={() => navigate.push('/fabric')} className="text-black underline">Back to Fabric Collection</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <SEO 
        title={product.name}
        description={product.description}
        keywords={`fabric, textile, ${product.fabricInfo?.material || ''}, ${product.name}, Premiura`}
        image={product.images[0]}
        type="product"
      />
      <button onClick={() => navigate.back()} className="flex items-center text-sm text-gray-500 hover:text-black mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-[3/4] rounded-3xl overflow-hidden bg-line relative max-h-[50%]">
            <ImageZoom src={product.images[selectedImage]} alt={product.name} className="w-full h-full" />
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button key={idx} onClick={() => setSelectedImage(idx)} className={cn("aspect-square rounded-xl overflow-hidden border-2 transition-all", selectedImage === idx ? "border-black" : "border-transparent opacity-60 hover:opacity-100")}>
                <Image src={img} alt="" className="w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-muted">Fabric</span>
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
            </div>
            <p className="text-3xl font-bold tracking-tight text-success">
              {formatCurrency(getProductPrice(product))}
              <span className="text-lg font-sans font-normal text-muted"> / meter</span>
            </p>
          </div>

          <div className="prose prose-sm text-gray-600 mb-10 max-w-none">
            <p>{product.description}</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl mb-10">
            <div className="flex items-start space-x-3">
              <Ruler className="w-5 h-5 text-amber-600 mt-1" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Fabric Order Policy</h4>
                <ul className="text-xs text-amber-800 mt-2 space-y-1 list-disc list-inside">
                  <li>Minimum order: {product.fabricInfo?.minOrder} meters</li>
                  <li>GSM: {product.fabricInfo?.gsm} | Material: {product.fabricInfo?.material}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mb-12">
          <button onClick={() => addToCart(product)} className={cn("flex-1 bg-primary text-white py-5 rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-primary/90 transition-all active:scale-95",{'bg-primary/30' : theme === 'dark'})}>
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
            <button onClick={() => toggleFavorite(product.id)} className={cn("p-5 rounded-2xl border transition-all active:scale-95", favorited ? "bg-red-50 border-red-100 text-red-500" : "border-black/5 text-gray-400 hover:text-red-500")}>
              <Heart className={cn("w-6 h-6", favorited && "fill-current")} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-black/5">
            <div className="flex flex-col items-center text-center space-y-2">
              <Truck className="w-6 h-6 text-gray-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Bulk Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <RotateCcw className="w-6 h-6 text-gray-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Quality Check</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <ShieldCheck className="w-6 h-6 text-gray-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
