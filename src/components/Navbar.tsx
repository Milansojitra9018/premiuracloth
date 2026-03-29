"use client";
import { useRouter } from "next/navigation";
import React from 'react';
import Link from "next/link";
import { ShoppingCart, User, LogIn, LogOut, Menu, X, Search, Heart, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Image } from './common/Image';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../ThemeContext';
import { authService } from '../services/authService';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onSearch: (query: string, category: string) => void;
}

export function Navbar({ cartCount, onCartClick, onSearch }) {
  const { user, profile } = useAuth();
  const { favoriteCount } = useFavorites();
  const { theme, toggleTheme } = useTheme();
  const navigate = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchCategory, setSearchCategory] = React.useState('all');

  const handleLogin = () => navigate.push('/login');

  const handleLogout = () => authService.logout();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() || searchCategory !== 'all') {
      onSearch(searchQuery, searchCategory);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <span className="text-xl xl:text-2xl font-serif font-bold tracking-tight text-primary">PREMIURA<span className="text-secondary italic">.</span></span>
          </Link>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8 ml-8 xl:ml-10">
            <Link href="/men" className="text-sm font-bold uppercase tracking-widest hover:text-muted transition-colors">Men</Link>
            <Link href="/women" className="text-sm font-bold uppercase tracking-widest hover:text-muted transition-colors">Women</Link>
            <Link href="/kids" className="text-sm font-bold uppercase tracking-widest hover:text-muted transition-colors">Kids</Link>
            <Link href="/fabric" className="text-sm font-bold uppercase tracking-widest hover:text-muted transition-colors">Fabrics</Link>
            {profile?.role === 'admin' && (
              <Link href="/admin" className="text-sm font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">Admin</Link>
            )}
            {(profile?.role === 'seller' || profile?.role === 'admin') && (
              <Link href="/seller" className="text-sm font-bold uppercase tracking-widest text-purple-600 hover:text-purple-700 transition-colors">Seller Hub</Link>
            )}
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center bg-line rounded-full px-1 py-1">
              <div className="flex items-center px-3 border-r border-line">
                <select 
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-bold uppercase tracking-wider focus:ring-0 cursor-pointer pr-8"
                >
                  <option value="all">All</option>
                  <option value="clothing">Clothing</option>
                  <option value="fabric">Fabric</option>
                </select>
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-10 pr-4 py-2 bg-transparent border-none text-sm focus:ring-0 transition-all text-ink"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="hidden">Search</button>
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-line transition-colors text-ink"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <Link href="/favorites" className="relative text-ink/70 hover:text-primary transition-colors">
              <Heart className="w-6 h-6" />
              {favoriteCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {favoriteCount}
                </span>
              )}
            </Link>
            <button 
              className="relative text-ink/70 hover:text-primary transition-colors"
              onClick={onCartClick}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                  <Image 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`} 
                    alt={user.displayName || ''} 
                    className="w-8 h-8 rounded-full border border-line"
                  />
                  <span className="text-sm font-medium text-ink/80">{profile?.displayName}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-ink/70 hover:text-primary transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-line transition-colors text-ink"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button onClick={onCartClick} className="relative">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-ink/70"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-bg border-t border-line overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <form onSubmit={(e) => { handleSearchSubmit(e); setIsMenuOpen(false); }} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-line border-none rounded-xl text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <div className="flex flex-col space-y-4">
                <Link href="/favorites" className="text-left text-ink/70 font-medium flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
                  <span>My Favorites</span>
                  {favoriteCount > 0 && (
                    <span className="bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {favoriteCount}
                    </span>
                  )}
                </Link>
                <Link href="/products" className="text-left text-ink/70 font-medium" onClick={() => setIsMenuOpen(false)}>Shop All</Link>
                <Link href="/men" className="text-left text-ink/70 font-medium" onClick={() => setIsMenuOpen(false)}>Shop Men</Link>
                <Link href="/women" className="text-left text-ink/70 font-medium" onClick={() => setIsMenuOpen(false)}>Shop Women</Link>
                <Link href="/kids" className="text-left text-ink/70 font-medium" onClick={() => setIsMenuOpen(false)}>Shop Kids</Link>
                <Link href="/fabric" className="text-left text-ink/70 font-medium" onClick={() => setIsMenuOpen(false)}>Shop Fabric</Link>
                <Link href="/profile" className="text-left text-ink/70 font-medium" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                <Link href="/faq" className="text-left text-ink/70 font-medium" onClick={() => setIsMenuOpen(false)}>FAQs</Link>
                {user ? (
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-left text-secondary font-medium">Logout</button>
                ) : (
                  <button onClick={() => { handleLogin(); setIsMenuOpen(false); }} className="text-left text-primary font-medium">Login with Google</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
