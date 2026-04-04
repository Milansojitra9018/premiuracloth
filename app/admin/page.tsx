"use client";
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Settings, 
  Search, 
  Filter,
  MoreVertical,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  TrendingUp,
  BarChart3,
  Plus,
  Edit2,
  X,
  Image as ImageIcon,
  DollarSign,
  UserPlus,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from "@/src/context/AuthContext";
import { Image } from "@/src/components/common/Image";
import { productService } from "@/src/services/productService";
import { orderService } from "@/src/services/orderService";
import { userService } from "@/src/services/userService";
import { heroService } from "@/src/services/heroService";
import { budgetSpotlightService } from "@/src/services/budgetSpotlightService";
import { formatCurrency, getProductPrice, formatDate } from "@/src/utils";
import { HeroSlide, BudgetSpotlightItem } from "@/src/types";
import { ConfirmationModal } from "@/src/components/common/ConfirmationModal";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [products, setProducts] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [heroSlides, setHeroSlides] = React.useState<HeroSlide[]>([]);
  const [budgetSpotlights, setBudgetSpotlights] = React.useState<BudgetSpotlightItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<any>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'products' | 'users' | 'orders' | 'settings' | 'hero' | 'budgetSpotlight'>('products');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<string | null>(null);

  // Hero Form State
  const [isHeroModalOpen, setIsHeroModalOpen] = React.useState(false);
  const [editingHeroSlide, setEditingHeroSlide] = React.useState<HeroSlide | null>(null);
  const [heroToDelete, setHeroToDelete] = React.useState<string | null>(null);
  const [isHeroDeleteModalOpen, setIsHeroDeleteModalOpen] = React.useState(false);
  const [heroFormData, setHeroFormData] = React.useState({
    image: '', tag: '', title: '', description: '',
    primaryBtnText: '', primaryBtnLink: '',
    secondaryBtnText: '', secondaryBtnLink: ''
  });

  // Spotlight Form State
  const [isSpotlightModalOpen, setIsSpotlightModalOpen] = React.useState(false);
  const [editingSpotlight, setEditingSpotlight] = React.useState<BudgetSpotlightItem | null>(null);
  const [spotlightToDelete, setSpotlightToDelete] = React.useState<string | null>(null);
  const [isSpotlightDeleteModalOpen, setIsSpotlightDeleteModalOpen] = React.useState(false);
  const [spotlightFormData, setSpotlightFormData] = React.useState({ brand: '', deal: '', img: '' });

  // Form State
  const [formData, setFormData] = React.useState<any>({
    name: '',
    description: '',
    price: '',
    priceINR: '',
    priceUSD: '',
    category: 'clothing',
    subcategory: '',
    gender: 'men',
    color: '',
    isTrending: false,
    season: 'all',
    images: [''],
    stock: '10',
    sellerName: 'Admin',
    fabricInfo: {
      gsm: '',
      material: '',
      minOrder: ''
    }
  });

  const collectionsSchema = [
    {
      name: 'products',
      fields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'string', required: true },
        { name: 'category', type: 'string', required: true, desc: '"clothing" | "fabric"' },
        { name: 'subcategory', type: 'string', required: true },
        { name: 'gender', type: 'string', required: false, desc: '"men" | "women" | "kids" | "unisex"' },
        { name: 'price', type: 'number', required: true },
        { name: 'priceINR', type: 'number', required: true },
        { name: 'priceUSD', type: 'number', required: true },
        { name: 'images', type: 'array', required: true },
        { name: 'stock', type: 'number', required: true },
        { name: 'sellerId', type: 'string', required: true },
        { name: 'rating', type: 'number', required: true, desc: 'default 0' },
        { name: 'reviewsCount', type: 'number', required: true, desc: 'default 0' },
        { name: 'fabricInfo', type: 'map', required: false, desc: 'required if category is "fabric"' },
      ]
    },
    {
      name: 'users',
      fields: [
        { name: 'uid', type: 'string', required: true },
        { name: 'email', type: 'string', required: true },
        { name: 'role', type: 'string', required: true, desc: '"admin" | "seller" | "user"' },
        { name: 'address', type: 'string', required: false },
      ]
    },
    {
      name: 'orders',
      fields: [
        { name: 'userId', type: 'string', required: true },
        { name: 'items', type: 'array', required: true, desc: 'OrderItem maps' },
        { name: 'totalAmount', type: 'number', required: true },
        { name: 'status', type: 'string', required: true, desc: '"pending" | "paid" | "shipped" | "delivered"' },
      ]
    }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, usersData, ordersData, heroData, spotlightData] = await Promise.all([
        productService.getAllProducts(),
        userService.getAllUsers(),
        orderService.getAllOrders(),
        heroService.getAllHeroSlides(),
        budgetSpotlightService.getAllBudgetSpotlights()
      ]);
      setProducts(productsData);
      setUsers(usersData);
      setOrders(ordersData);
      setHeroSlides(heroData);
      setBudgetSpotlights(spotlightData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await productService.deleteProduct(productToDelete);
      toast.success('Product deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    const productData = {
      ...formData,
      price: parseFloat(formData.price || formData.priceUSD || '0'),
      priceINR: parseFloat(formData.priceINR || '0'),
      priceUSD: parseFloat(formData.priceUSD || '0'),
      stock: parseInt(formData.stock),
      sellerId: user.uid,
      sellerName: formData.sellerName || 'Admin',
      rating: editingProduct?.rating || 0,
      reviewsCount: editingProduct?.reviewsCount || 0,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      fabricInfo: formData.category === 'fabric' ? {
        ...formData.fabricInfo,
        gsm: parseInt(formData.fabricInfo.gsm) || 0,
        minOrder: parseInt(formData.fabricInfo.minOrder) || 0,
        colors: [formData.color].filter(Boolean)
      } : undefined
    };

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData);
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(productData);
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ 
        name: '', 
        description: '', 
        price: '', 
        priceINR: '', 
        priceUSD: '', 
        category: 'clothing', 
        subcategory: '',
        gender: 'men', 
        color: '',
        isTrending: false,
        season: 'all',
        images: [''], 
        stock: '10',
        sellerName: 'Admin',
        fabricInfo: {
          gsm: '',
          material: '',
          minOrder: ''
        }
      });
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      priceINR: product.priceINR?.toString() || '',
      priceUSD: product.priceUSD?.toString() || '',
      category: product.category || 'clothing',
      subcategory: product.subcategory || '',
      gender: product.gender || 'men',
      color: product.color || '',
      isTrending: product.isTrending || false,
      season: product.season || 'all',
      images: product.images || [''],
      stock: product.stock?.toString() || '10',
      sellerName: product.sellerName || 'Admin',
      fabricInfo: {
        gsm: product.fabricInfo?.gsm?.toString() || '',
        material: product.fabricInfo?.material || '',
        minOrder: product.fabricInfo?.minOrder?.toString() || ''
      }
    });
    setIsModalOpen(true);
  };

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      image: heroFormData.image,
      tag: heroFormData.tag,
      title: heroFormData.title,
      description: heroFormData.description,
      primaryBtn: { text: heroFormData.primaryBtnText, link: heroFormData.primaryBtnLink },
      secondaryBtn: { text: heroFormData.secondaryBtnText, link: heroFormData.secondaryBtnLink },
      createdAt: editingHeroSlide ? editingHeroSlide.createdAt : new Date().toISOString()
    };

    try {
      if (editingHeroSlide) {
        await heroService.updateHeroSlide(editingHeroSlide.id, payload);
        toast.success('Hero slide updated');
      } else {
        await heroService.createHeroSlide(payload);
        toast.success('Hero slide created');
      }
      setIsHeroModalOpen(false);
      setEditingHeroSlide(null);
      setHeroFormData({
        image: '', tag: '', title: '', description: '',
        primaryBtnText: '', primaryBtnLink: '',
        secondaryBtnText: '', secondaryBtnLink: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to save hero slide');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openHeroEditModal = (slide: HeroSlide) => {
    setEditingHeroSlide(slide);
    setHeroFormData({
      image: slide.image || '',
      tag: slide.tag || '',
      title: slide.title || '',
      description: slide.description || '',
      primaryBtnText: slide.primaryBtn?.text || '',
      primaryBtnLink: slide.primaryBtn?.link || '',
      secondaryBtnText: slide.secondaryBtn?.text || '',
      secondaryBtnLink: slide.secondaryBtn?.link || ''
    });
    setIsHeroModalOpen(true);
  };

  const handleDeleteHero = (id: string) => {
    setHeroToDelete(id);
    setIsHeroDeleteModalOpen(true);
  };

  const confirmHeroDelete = async () => {
    if (!heroToDelete) return;
    try {
      await heroService.deleteHeroSlide(heroToDelete);
      toast.success('Hero slide deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete hero slide');
    } finally {
      setIsHeroDeleteModalOpen(false);
      setHeroToDelete(null);
    }
  };

  const handleSpotlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      brand: spotlightFormData.brand,
      deal: spotlightFormData.deal,
      img: spotlightFormData.img,
      createdAt: editingSpotlight ? editingSpotlight.createdAt : new Date().toISOString()
    };

    try {
      if (editingSpotlight) {
        await budgetSpotlightService.updateBudgetSpotlight(editingSpotlight.id, payload);
        toast.success('Spotlight item updated');
      } else {
        await budgetSpotlightService.createBudgetSpotlight(payload);
        toast.success('Spotlight item created');
      }
      setIsSpotlightModalOpen(false);
      setEditingSpotlight(null);
      setSpotlightFormData({ brand: '', deal: '', img: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to save spotlight item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSpotlightEditModal = (item: BudgetSpotlightItem) => {
    setEditingSpotlight(item);
    setSpotlightFormData({
      brand: item.brand,
      deal: item.deal,
      img: item.img
    });
    setIsSpotlightModalOpen(true);
  };

  const handleDeleteSpotlight = (id: string) => {
    setSpotlightToDelete(id);
    setIsSpotlightDeleteModalOpen(true);
  };

  const confirmSpotlightDelete = async () => {
    if (!spotlightToDelete) return;
    try {
      await budgetSpotlightService.deleteBudgetSpotlight(spotlightToDelete);
      toast.success('Spotlight item deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete spotlight item');
    } finally {
      setIsSpotlightDeleteModalOpen(false);
      setSpotlightToDelete(null);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sellerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders
  .filter(order => order.status === 'delivered')
  .reduce((acc, order) => acc + (order.totalAmount || 0), 0);

  // Generate chart data from orders
  const getChartData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: d.toDateString(),
        value: 0
      };
    }).reverse();

    orders.forEach(order => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate().toDateString() : new Date(order.createdAt).toDateString();
      const chartDay = last7Days.find(d => d.fullDate === orderDate);
      if (chartDay) {
        chartDay.value += order.totalAmount || 0;
      }
    });

    // If no real data, use some mock data for visualization
    if (totalRevenue === 0) {
      return [
        { date: 'Mon', value: 4000 },
        { date: 'Tue', value: 3000 },
        { date: 'Wed', value: 2000 },
        { date: 'Thu', value: 2780 },
        { date: 'Fri', value: 1890 },
        { date: 'Sat', value: 2390 },
        { date: 'Sun', value: 3490 },
      ];
    }

    return last7Days;
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-ink">Access Denied</h1>
          <p className="text-muted">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink">Admin Dashboard</h1>
            <p className="text-muted">Manage your entire marketplace from here.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
              className="bg-ink text-bg px-6 py-3 rounded-2xl text-sm font-bold hover:opacity-90 transition-all flex items-center shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </button>
            <button 
              onClick={() => { 
                setEditingHeroSlide(null); 
                setHeroFormData({
                  image: '', tag: '', title: '', description: '',
                  primaryBtnText: '', primaryBtnLink: '',
                  secondaryBtnText: '', secondaryBtnLink: ''
                });
                setIsHeroModalOpen(true); 
              }}
              className="bg-secondary text-white px-6 py-3 rounded-2xl text-sm font-bold hover:opacity-90 transition-all flex items-center shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Hero Slide
            </button>
            <button 
              onClick={() => { 
                setEditingSpotlight(null); 
                setSpotlightFormData({ brand: '', deal: '', img: '' });
                setIsSpotlightModalOpen(true); 
              }}
              className="bg-primary/10 text-primary px-6 py-3 rounded-2xl text-sm font-bold hover:bg-primary/20 transition-all flex items-center shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Spotlight
            </button>
            <button className="bg-bg border border-line text-ink px-4 py-3 rounded-2xl text-sm font-bold hover:bg-ink/5 transition-all flex items-center shadow-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Reports
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Total Products', value: products.length, icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { label: 'Total Users', value: users.length, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Total Orders', value: orders.length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-bg p-6 rounded-3xl border border-line shadow-sm hover:shadow-md transition-all"
            >
              <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-ink">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-bg p-6 rounded-3xl border border-line shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-ink">Marketplace Performance</h2>
                <p className="text-xs text-muted">Revenue tracking across all sellers</p>
              </div>
              <div className="bg-ink/5 p-2 rounded-xl">
                <BarChart3 className="w-4 h-4 text-muted" />
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getChartData()}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--ink)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--ink)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'var(--muted)' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'var(--muted)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg)',
                      borderRadius: '16px', 
                      border: '1px solid var(--line)', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      color: 'var(--ink)'
                    }}
                    itemStyle={{ color: 'var(--ink)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--ink)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-bg p-6 rounded-3xl border border-line shadow-sm">
            <h2 className="text-lg font-bold mb-6 text-ink">Quick Management</h2>
            <div className="space-y-4">
              {[
                { label: 'Manage Users', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', tab: 'users' },
                { label: 'System Settings', icon: Settings, color: 'text-muted', bg: 'bg-ink/5', tab: 'settings' },
                { label: 'Manage Hero', icon: ImageIcon, color: 'text-pink-500', bg: 'bg-pink-500/10', tab: 'hero' },
                { label: 'Spotlights', icon: Plus, color: 'text-indigo-500', bg: 'bg-indigo-500/10', tab: 'budgetSpotlight' },
                { label: 'Review Products', icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-500/10', tab: 'products' },
                { label: 'View Reports', icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-500/10', tab: 'orders' },
              ].map((action, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveTab(action.tab as any)}
                  className={`w-full flex items-center p-4 rounded-2xl transition-all group border ${activeTab === action.tab ? 'bg-ink/5 border-line' : 'border-transparent hover:bg-ink/5 hover:border-line'}`}
                >
                  <div className={`${action.bg} ${action.color} p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-ink">{action.label}</span>
                  <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all text-muted" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="bg-bg rounded-3xl border border-line shadow-sm overflow-hidden">
          <div className="p-6 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setActiveTab('products')}
                className={`text-sm font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'products' ? 'border-ink text-ink' : 'border-transparent text-muted'}`}
              >
                Products
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`text-sm font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'users' ? 'border-ink text-ink' : 'border-transparent text-muted'}`}
              >
                Users
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`text-sm font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'orders' ? 'border-ink text-ink' : 'border-transparent text-muted'}`}
              >
                Orders
              </button>
              <button 
                onClick={() => setActiveTab('hero')}
                className={`text-sm font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'hero' ? 'border-ink text-ink' : 'border-transparent text-muted'}`}
              >
                Hero Form
              </button>
              <button 
                onClick={() => setActiveTab('budgetSpotlight')}
                className={`text-sm font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'budgetSpotlight' ? 'border-ink text-ink' : 'border-transparent text-muted'}`}
              >
                Spotlights
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`text-sm font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'settings' ? 'border-ink text-ink' : 'border-transparent text-muted'}`}
              >
                Settings
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input 
                  type="text" 
                  placeholder={`Search ${activeTab}...`} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-ink/5 border-none rounded-xl text-sm focus:ring-1 focus:ring-ink w-full md:w-64 text-ink placeholder:text-muted"
                />
              </div>
              <div className="relative">
                <button 
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                  className={`p-2 rounded-xl transition-colors ${isFilterMenuOpen ? 'bg-ink text-bg' : 'bg-ink/5 text-ink hover:bg-ink/10'}`}
                >
                  <Filter className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {isFilterMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsFilterMenuOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-bg border border-line rounded-2xl shadow-xl z-20 p-2"
                      >
                        {activeTab === 'products' && (
                          <div className="space-y-1">
                            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted">Category</p>
                            {['all', 'clothing', 'fabric', 'accessories'].map((cat) => (
                              <button
                                key={cat}
                                onClick={() => { setCategoryFilter(cat); setIsFilterMenuOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${categoryFilter === cat ? 'bg-ink text-bg' : 'text-ink hover:bg-ink/5'}`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        )}
                        {activeTab === 'users' && (
                          <div className="space-y-1">
                            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted">Role</p>
                            {['all', 'admin', 'seller', 'user'].map((role) => (
                              <button
                                key={role}
                                onClick={() => { setRoleFilter(role); setIsFilterMenuOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${roleFilter === role ? 'bg-ink text-bg' : 'text-ink hover:bg-ink/5'}`}
                              >
                                {role}
                              </button>
                            ))}
                          </div>
                        )}
                        {activeTab === 'orders' && (
                          <div className="space-y-1">
                            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted">Status</p>
                            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                              <button
                                key={status}
                                onClick={() => { setStatusFilter(status); setIsFilterMenuOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${statusFilter === status ? 'bg-ink text-bg' : 'text-ink hover:bg-ink/5'}`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'products' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-ink/5">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Product</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Seller</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Price</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-6 py-4 h-16 bg-ink/5"></td>
                      </tr>
                    ))
                  ) : filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-ink/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Image src={product.images?.[0]} alt="" className="w-10 h-10 rounded-lg mr-3 shadow-sm" />
                          <div>
                            <p className="font-bold text-sm text-ink">{product.name}</p>
                            <p className="text-[10px] text-muted uppercase tracking-widest">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-ink">{product.sellerName || 'Unknown'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-ink">{formatCurrency(getProductPrice(product))}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => openEditModal(product)}
                            className="p-2 hover:bg-ink/10 text-muted hover:text-ink rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'users' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-ink/5">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">User</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Role</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Joined</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-6 py-4 h-16 bg-ink/5"></td>
                      </tr>
                    ))
                  ) : filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-ink/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center mr-3">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <Users className="w-5 h-5 text-muted" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-ink">{u.displayName || 'Anonymous'}</p>
                            <p className="text-xs text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          u.role === 'admin' ? 'bg-purple-500/10 text-purple-600' : 
                          u.role === 'seller' ? 'bg-blue-500/10 text-blue-600' : 
                          'bg-ink/5 text-muted'
                        }`}>
                          {u.role === 'admin' && <ShieldCheck className="w-3 h-3 mr-1" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-ink/10 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-muted" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'orders' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-ink/5">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Order ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted italic">No orders found</td>
                    </tr>
                  ) : filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-ink/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 font-bold text-sm text-ink">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600' : 
                          order.status === 'pending' ? 'bg-orange-500/10 text-orange-600' : 
                          'bg-blue-500/10 text-blue-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'settings' && (
              <div className="p-8 space-y-12">
                <div>
                  <h2 className="text-2xl font-bold text-ink mb-2">System Configuration</h2>
                  <p className="text-sm text-muted">This blueprint shows exactly how your Firestore database should be configured.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {collectionsSchema.map((collection) => (
                    <div key={collection.name} className="bg-surface rounded-3xl border border-line p-6 shadow-sm">
                      <div className="flex items-center space-x-3 mb-6 border-b border-line pb-4">
                        <div className="bg-ink text-bg px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase">Collection</div>
                        <h3 className="text-xl font-bold text-ink">{collection.name}</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {collection.fields.map((field) => (
                          <div key={field.name} className="flex items-start justify-between group">
                            <div className="space-y-1">
                              <p className="text-xs font-mono font-bold text-ink group-hover:text-secondary transition-colors">{field.name}</p>
                              {field.desc && <p className="text-[10px] text-muted italic">{field.desc}</p>}
                            </div>
                            <div className="flex items-center space-x-2 text-right">
                              <span className="text-[10px] uppercase font-bold text-muted bg-ink/5 px-2 py-0.5 rounded-md">{field.type}</span>
                              {field.required && (
                                <span className="text-[8px] uppercase font-bold text-emerald-500 border border-emerald-500/20 px-1.5 rounded">Required</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 p-2 rounded-xl text-amber-700">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 mb-1 leading-none">Database Compliance Warning</h4>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        The frontend application requires these exact field names and types. Missing required fields in Firestore documents will cause the app to crash or display empty content.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hero' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-ink/5">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Slide Image</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Title / Tag</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Buttons</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {heroSlides.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted italic">No hero slides found. The default mock slides will be shown.</td>
                    </tr>
                  ) : heroSlides.map((slide) => (
                    <tr key={slide.id} className="hover:bg-ink/5 transition-colors">
                      <td className="px-6 py-4">
                        <img src={slide.image} alt="" className="w-24 h-12 object-cover rounded-md shadow-sm border border-line" />
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-ink">{slide.title}</p>
                        <p className="text-xs text-muted mt-1">{slide.tag}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          {slide.primaryBtn?.text && <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">{slide.primaryBtn.text}</span>}
                          {slide.secondaryBtn?.text && <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{slide.secondaryBtn.text}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => openHeroEditModal(slide)}
                            className="p-2 hover:bg-ink/10 text-muted hover:text-ink rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteHero(slide.id)}
                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'budgetSpotlight' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-ink/5">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Image</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Brand & Deal</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {budgetSpotlights.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted italic">No budget spotlights found. Add some to display them on the homepage.</td>
                    </tr>
                  ) : budgetSpotlights.map((item) => (
                    <tr key={item.id} className="hover:bg-ink/5 transition-colors">
                      <td className="px-6 py-4">
                        <img src={item.img} alt={item.brand} className="w-16 h-16 object-cover rounded-md shadow-sm border border-line" />
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-ink">{item.brand}</p>
                        <p className="text-xs text-secondary font-bold mt-1 uppercase">{item.deal}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => openSpotlightEditModal(item)}
                            className="p-2 hover:bg-ink/10 text-muted hover:text-ink rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSpotlight(item.id)}
                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="relative bg-bg w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden border border-line"
              >
                <div className="p-8 border-b border-line flex justify-between items-center bg-ink/5">
                  <div>
                    <h2 className="text-2xl font-bold text-ink">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
                    <p className="text-sm text-muted">Admin product management tool.</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    disabled={isSubmitting}
                    className="p-3 hover:bg-bg rounded-full transition-all border border-transparent hover:border-line text-ink"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Product Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink transition-all text-ink placeholder:text-muted"
                        placeholder="e.g. Hand-woven Silk Saree"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value, subcategory: ''})}
                        className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink transition-all text-ink grow"
                      >
                        <option value="clothing">Clothing</option>
                        <option value="fabric">Fabric</option>
                        <option value="accessories">Accessories</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Subcategory</label>
                      <select 
                        required
                        value={formData.subcategory}
                        onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                        className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink transition-all text-ink grow"
                      >
                        <option value="" disabled>Select Subcategory</option>
                        {formData.category === 'clothing' ? (
                          <>
                            <option value="T-Shirts">T-Shirts</option>
                            <option value="Denim">Denim</option>
                            <option value="Dresses">Dresses</option>
                            <option value="Sarees">Sarees</option>
                            <option value="Suits">Suits</option>
                            <option value="Outerwear">Outerwear</option>
                          </>
                        ) : formData.category === 'fabric' ? (
                          <>
                            <option value="Silk">Silk</option>
                            <option value="Cotton">Cotton</option>
                            <option value="Linen">Linen</option>
                            <option value="Wool">Wool</option>
                            <option value="Synthetic">Synthetic</option>
                          </>
                        ) : (
                          <option value="General">General</option>
                        )}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Price (INR - ₹)</label>
                      <input 
                        required
                        type="number" 
                        value={formData.priceINR}
                        onChange={(e) => setFormData({...formData, priceINR: e.target.value})}
                        className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink transition-all text-ink placeholder:text-muted"
                        placeholder="₹ 0"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Price (USD - $)</label>
                      <input 
                        required
                        type="number" 
                        value={formData.priceUSD}
                        onChange={(e) => setFormData({...formData, priceUSD: e.target.value})}
                        className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink transition-all text-ink placeholder:text-muted"
                        placeholder="$ 0.00"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Gender / Target</label>
                      <select 
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink transition-all text-ink"
                      >
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="kids">Kids</option>
                        <option value="unisex">Unisex</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Stock Quantity</label>
                      <input 
                        required
                        type="number" 
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink transition-all text-ink placeholder:text-muted"
                        placeholder="10"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Primary Color</label>
                      <input 
                        type="text" 
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink transition-all text-ink placeholder:text-muted"
                        placeholder="e.g. Royal Blue"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Season</label>
                      <select 
                        value={formData.season}
                        onChange={(e) => setFormData({...formData, season: e.target.value})}
                        className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink transition-all text-ink"
                      >
                        <option value="all">All Seasons</option>
                        <option value="summer">Summer</option>
                        <option value="winter">Winter</option>
                      </select>
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Seller Name (Display)</label>
                      <input 
                        type="text" 
                        value={formData.sellerName}
                        onChange={(e) => setFormData({...formData, sellerName: e.target.value})}
                        className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink transition-all text-ink placeholder:text-muted"
                        placeholder="Admin"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mt-4 mb-4">
                    <input 
                      type="checkbox" 
                      id="isAdminTrending"
                      checked={formData.isTrending}
                      onChange={(e) => setFormData({...formData, isTrending: e.target.checked})}
                      className="w-5 h-5 accent-ink cursor-pointer"
                    />
                    <label htmlFor="isAdminTrending" className="text-sm font-bold text-ink cursor-pointer">Mark as Trending</label>
                  </div>

                  {formData.category === 'fabric' && (
                    <div className="p-8 bg-surface rounded-3xl border border-line space-y-6">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-ink border-b border-line pb-4">Fabric Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-muted">GSM (Weight)</label>
                          <input 
                            type="number" 
                            value={formData.fabricInfo.gsm}
                            onChange={(e) => setFormData({...formData, fabricInfo: {...formData.fabricInfo, gsm: e.target.value}})}
                            className="w-full px-4 py-3 bg-bg border border-line rounded-xl focus:ring-1 focus:ring-ink text-ink"
                            placeholder="e.g. 200"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-muted">Material Map</label>
                          <input 
                            type="text" 
                            value={formData.fabricInfo.material}
                            onChange={(e) => setFormData({...formData, fabricInfo: {...formData.fabricInfo, material: e.target.value}})}
                            className="w-full px-4 py-3 bg-bg border border-line rounded-xl focus:ring-1 focus:ring-ink text-ink"
                            placeholder="e.g. 100% Organic Silk"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-muted">Min Order (Meters)</label>
                          <input 
                            type="number" 
                            value={formData.fabricInfo.minOrder}
                            onChange={(e) => setFormData({...formData, fabricInfo: {...formData.fabricInfo, minOrder: e.target.value}})}
                            className="w-full px-4 py-3 bg-bg border border-line rounded-xl focus:ring-1 focus:ring-ink text-ink"
                            placeholder="e.g. 5"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Description</label>
                    <textarea 
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink h-40 resize-none transition-all text-ink placeholder:text-muted"
                      placeholder="Describe the material, fit, and unique features..."
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input 
                        required
                        type="url" 
                        value={formData.images[0]}
                        onChange={(e) => setFormData({...formData, images: [e.target.value]})}
                        className="w-full pl-14 pr-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink transition-all text-ink placeholder:text-muted"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-ink text-bg py-5 rounded-[24px] font-bold hover:opacity-90 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-bg/20 border-t-bg rounded-full animate-spin" />
                      ) : (
                        editingProduct ? 'Update Product' : 'Create Product'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ConfirmationModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Product"
          message="Are you sure you want to delete this product? This action is permanent and cannot be undone."
          confirmText="Yes, Delete"
          cancelText="Keep Product"
          isDanger={true}
        />

        <ConfirmationModal 
          isOpen={isHeroDeleteModalOpen}
          onClose={() => setIsHeroDeleteModalOpen(false)}
          onConfirm={confirmHeroDelete}
          title="Delete Hero Slide"
          message="Are you sure you want to delete this hero slide?"
          confirmText="Yes, Delete"
          cancelText="Keep Slide"
          isDanger={true}
        />

        <ConfirmationModal 
          isOpen={isSpotlightDeleteModalOpen}
          onClose={() => setIsSpotlightDeleteModalOpen(false)}
          onConfirm={confirmSpotlightDelete}
          title="Delete Spotlight Item"
          message="Are you sure you want to delete this budget spotlight item?"
          confirmText="Yes, Delete"
          cancelText="Keep Item"
          isDanger={true}
        />

        {/* Hero Modal */}
        <AnimatePresence>
          {isHeroModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSubmitting && setIsHeroModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="relative bg-bg w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden border border-line"
              >
                <div className="p-8 border-b border-line flex justify-between items-center bg-ink/5">
                  <div>
                    <h2 className="text-2xl font-bold text-ink">{editingHeroSlide ? 'Edit Hero Slide' : 'New Hero Slide'}</h2>
                    <p className="text-sm text-muted">Update your homepage hero section dynamically.</p>
                  </div>
                  <button 
                    onClick={() => setIsHeroModalOpen(false)} 
                    disabled={isSubmitting}
                    className="p-3 hover:bg-bg rounded-full transition-all border border-transparent hover:border-line text-ink"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleHeroSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Image URL</label>
                    <input required type="url" value={heroFormData.image} onChange={e => setHeroFormData({...heroFormData, image: e.target.value})} className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink" placeholder="https://..." />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Tagline</label>
                    <input required type="text" value={heroFormData.tag} onChange={e => setHeroFormData({...heroFormData, tag: e.target.value})} className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink" placeholder="e.g. New Collection 2026" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Title</label>
                    <input required type="text" value={heroFormData.title} onChange={e => setHeroFormData({...heroFormData, title: e.target.value})} className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink" placeholder="e.g. ELEVATE YOUR STYLE" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Description</label>
                    <textarea required value={heroFormData.description} onChange={e => setHeroFormData({...heroFormData, description: e.target.value})} className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink h-24 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Primary Button Text</label>
                      <input required type="text" value={heroFormData.primaryBtnText} onChange={e => setHeroFormData({...heroFormData, primaryBtnText: e.target.value})} className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Primary Button Link</label>
                      <input required type="text" value={heroFormData.primaryBtnLink} onChange={e => setHeroFormData({...heroFormData, primaryBtnLink: e.target.value})} className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Secondary Button Text</label>
                      <input required type="text" value={heroFormData.secondaryBtnText} onChange={e => setHeroFormData({...heroFormData, secondaryBtnText: e.target.value})} className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Secondary Button Link</label>
                      <input required type="text" value={heroFormData.secondaryBtnLink} onChange={e => setHeroFormData({...heroFormData, secondaryBtnLink: e.target.value})} className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink" />
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-ink text-bg py-5 rounded-[24px] font-bold">
                    {isSubmitting ? 'Saving...' : 'Save Hero Slide'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Spotlight Modal */}
        <AnimatePresence>
          {isSpotlightModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSubmitting && setIsSpotlightModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="relative bg-bg w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-line"
              >
                <div className="p-8 border-b border-line flex justify-between items-center bg-ink/5">
                  <div>
                    <h2 className="text-2xl font-bold text-ink">{editingSpotlight ? 'Edit Spotlight Item' : 'New Spotlight Item'}</h2>
                    <p className="text-sm text-muted">Update budget spotlight display.</p>
                  </div>
                  <button 
                    onClick={() => setIsSpotlightModalOpen(false)} 
                    disabled={isSubmitting}
                    className="p-3 hover:bg-bg rounded-full transition-all border border-transparent hover:border-line text-ink"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleSpotlightSubmit} className="p-8 space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Brand Name</label>
                    <input required type="text" value={spotlightFormData.brand} onChange={e => setSpotlightFormData({...spotlightFormData, brand: e.target.value})} className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink" placeholder="e.g. MAX" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Deal Details</label>
                    <input required type="text" value={spotlightFormData.deal} onChange={e => setSpotlightFormData({...spotlightFormData, deal: e.target.value})} className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink" placeholder="e.g. UNDER ₹499" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Image URL</label>
                    <input required type="url" value={spotlightFormData.img} onChange={e => setSpotlightFormData({...spotlightFormData, img: e.target.value})} className="w-full px-6 py-4 bg-ink/5 border-none rounded-2xl focus:ring-2 focus:ring-ink" placeholder="https://..." />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-ink text-bg py-5 rounded-[24px] font-bold mt-4">
                    {isSubmitting ? 'Saving...' : 'Save Spotlight Item'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
