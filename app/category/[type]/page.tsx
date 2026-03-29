"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from "@/src/firebase";
import { Product } from "@/src/types";
import { mockProducts } from "@/src/mockData";
import { ProductCard } from "@/src/components/ProductCard";
import { useCart } from "@/src/context/CartContext";
import { motion, AnimatePresence } from 'motion/react';

export default function CategoryPage() {
  const { type } = useParams<{ type: string }>();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Determine filter based on URL param
    let categoryFilter = '';
    let subcategoryFilter = '';

    if (type === 'men') {
      categoryFilter = 'clothing';
      subcategoryFilter = 'Men';
    } else if (type === 'women') {
      categoryFilter = 'clothing';
      subcategoryFilter = 'Women';
    } else if (type === 'fabric') {
      categoryFilter = 'fabric';
    }

    const q = categoryFilter
      ? query(collection(db, 'products'), where('category', '==', categoryFilter))
      : query(collection(db, 'products'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

      if (list.length === 0) {
        list = mockProducts;
      }

      if (subcategoryFilter) {
        list = list.filter(p => p.subcategory === subcategoryFilter);
      }

      setProducts(list);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'products');
      setProducts(mockProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [type]);

  const getTitle = () => {
    switch (type) {
      case 'men': return "MEN'S COLLECTION";
      case 'women': return "WOMEN'S COLLECTION";
      case 'fabric': return "PREMIUM FABRICS";
      case 'new': return "NEW ARRIVALS";
      default: return "OUR COLLECTION";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold tracking-tighter mb-4">{getTitle()}</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Explore our latest curated selection of premium {type === 'fabric' ? 'fabrics' : 'apparel'}.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-2xl aspect-[3/4]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-24">
          <p className="text-gray-400 font-medium">No products found in this category.</p>
        </div>
      )}
    </div>
  );
};
