import Link from "next/link";
import { Star, ShoppingBag, Ruler, Heart } from 'lucide-react';
import { Image } from './common/Image';
import { Product } from '../types';
import { formatCurrency, cn, getProductPrice } from '../utils';
import { motion } from 'motion/react';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../ThemeContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  view?: 'grid' | 'list';
}

export function ProductCard({ product, onAddToCart, view = 'grid' }) {
  const isFabric = product.category === 'fabric';
  const { toggleFavorite, isFavorite } = useFavorites();
  const { theme } = useTheme();
  const favorited = isFavorite(product.id);

  const getProductPath = () => {
    if (product.category === 'fabric') return `/fabric/product/${product.id}`;
    if (product.gender === 'men') return `/men/product/${product.id}`;
    if (product.gender === 'women') return `/women/product/${product.id}`;
    if (product.gender === 'kids') return `/kids/product/${product.id}`;
    return `/product/${product.id}`;
  };

  if (view === 'list') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="group bg-bg rounded-2xl overflow-hidden border border-line hover:shadow-lg transition-all duration-300 flex flex-row h-40 sm:h-48"
      >
        <div className="relative w-32 sm:w-40 h-full overflow-hidden flex-shrink-0">
          <Link href={getProductPath()} className="w-full h-full block">
            <Image 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </Link>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all active:scale-90 z-10",
              favorited ? "bg-secondary text-white" : "bg-bg/80 text-muted hover:text-secondary"
            )}
          >
            <Heart className={cn("w-3.5 h-3.5", favorited && "fill-current")} />
          </button>
        </div>

        <div className="flex-1 p-3 sm:p-5 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex justify-between items-start mb-1">
              <Link href={getProductPath()} className="text-base sm:text-lg font-serif font-bold text-ink truncate hover:text-primary transition-colors">{product.name}</Link>
              <span className="text-sm sm:text-base font-bold text-success ml-2 whitespace-nowrap">
                {formatCurrency(getProductPrice(product))}
                {isFabric && <span className="text-[10px] font-sans font-normal text-muted">/m</span>}
              </span>
            </div>
            <p className="text-xs text-muted mb-2">{product.subcategory}</p>
            <p className="text-xs text-muted line-clamp-2 hidden sm:block mb-3">{product.description}</p>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-ink">{product.rating}</span>
                <span className="text-[10px] text-muted">({product.reviewsCount})</span>
              </div>
              {isFabric && (
                <div className="flex items-center text-[10px] text-muted">
                  <Ruler className="w-3 h-3 mr-1" />
                  <span>Min {product.fabricInfo?.minOrder}m</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart(product);
              }}
              className={cn("bg-primary text-white px-4 py-2 rounded-full text-xs font-bold shadow-md hover:opacity-90 transition-all active:scale-95 flex items-center space-x-2",{'bg-primary/30' : theme === 'dark'})}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group bg-bg rounded-2xl overflow-hidden border border-line hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[3/4] overflow-hidden block">
        <Link href={getProductPath()} className="w-full h-full block">
          <Image 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className={cn(
            "absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all active:scale-90 z-10",
            favorited ? "bg-secondary text-white" : "bg-bg/80 text-muted hover:text-secondary"
          )}
        >
          <Heart className={cn("w-3.5 h-3.5", favorited && "fill-current")} />
        </button>

        {isFabric && (
          <div className="absolute top-2 left-2 bg-primary/80 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase">
            Fabric
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-0.5">
            <Link href={getProductPath()} className="text-xs sm:text-sm font-bold text-ink truncate flex-1 hover:text-primary transition-colors">{product.name}</Link>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold text-success">
              {formatCurrency(getProductPrice(product))}
              {isFabric && <span className="text-[9px] font-sans font-normal text-muted">/m</span>}
            </span>
            <div className="flex items-center space-x-1">
              <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] font-bold text-ink">{product.rating}</span>
            </div>
          </div>
          <p className="text-[10px] text-muted mb-3 line-clamp-1">{product.subcategory}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isFabric && (
              <div className="flex items-center text-[9px] text-muted">
                <Ruler className="w-2.5 h-2.5 mr-1" />
                <span>Min {product.fabricInfo?.minOrder}m</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(product);
            }}
            className={cn("bg-primary text-white p-1.5 sm:p-2 rounded-full shadow-md hover:opacity-90 transition-all active:scale-90",{'bg-primary/30' : theme === 'dark'})}
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
