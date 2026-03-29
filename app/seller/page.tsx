"use client";
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Edit2, 
  Trash2, 
  Eye,
  X,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  BarChart3,
  ArrowUpRight,
  Search,
  Filter,
  ShoppingBag
} from 'lucide-react';
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import { Image } from "@/src/components/common/Image";
import { productService } from "@/src/services/productService";
import { userService } from "@/src/services/userService";
import { orderService } from "@/src/services/orderService";
import { formatCurrency, getProductPrice, formatDate } from "@/src/utils";
import { ConfirmationModal } from "@/src/components/common/ConfirmationModal";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import toast from 'react-hot-toast';

export default function SellerDashboard() {
  const { user, profile } = useAuth();
  const [products, setProducts] = React.useState<any[]>([]);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<any>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'inventory' | 'orders'>('inventory');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<string | null>(null);

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
    fabricInfo: {
      gsm: '',
      material: '',
      minOrder: ''
    }
  });

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [productsData, allOrders] = await Promise.all([
        productService.getProductsBySeller(user.uid),
        orderService.getAllOrders()
      ]);
      setProducts(productsData);
      
      // Filter orders that contain this seller's products
      const sellerOrders = allOrders.filter((order: any) => 
        order.items.some((item: any) => productsData.some(p => p.id === item.productId))
      );
      setOrders(sellerOrders);
    } catch (error) {
      console.error('Error fetching seller data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [user]);

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
      sellerName: user.displayName || profile?.displayName || 'Seller',
      rating: editingProduct?.rating || 0,
      reviewsCount: editingProduct?.reviewsCount || 0,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      // Ensure fabricInfo numbers are parsed
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
        toast.success('Product listed successfully');
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

  const handleDelete = async (id: string) => {
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
      fabricInfo: {
        gsm: product.fabricInfo?.gsm?.toString() || '',
        material: product.fabricInfo?.material || '',
        minOrder: product.fabricInfo?.minOrder?.toString() || ''
      }
    });
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sellerRevenue = orders.reduce((acc, order) => {
    const sellerItems = order.items.filter((item: any) => products.some(p => p.id === item.productId));
    const sellerAmount = sellerItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    return acc + sellerAmount;
  }, 0);

  const getSalesChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const m = (currentMonth - i + 12) % 12;
      last6Months.push({
        name: months[m],
        monthIndex: m,
        sales: 0
      });
    }

    orders.forEach(order => {
      const d = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const m = d.getMonth();
      const chartPoint = last6Months.find(p => p.monthIndex === m);
      if (chartPoint) {
        const sellerItems = order.items.filter((item: any) => products.some(p => p.id === item.productId));
        chartPoint.sales += sellerItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
      }
    });

    // Mock data if no sales
    if (sellerRevenue === 0) {
      return [
        { name: 'Jan', sales: 400 },
        { name: 'Feb', sales: 300 },
        { name: 'Mar', sales: 600 },
        { name: 'Apr', sales: 800 },
        { name: 'May', sales: 500 },
        { name: 'Jun', sales: 900 },
      ];
    }

    return last6Months;
  };

  const handleApplyToSell = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await userService.updateUserRole(user.uid, 'seller');
      toast.success('Congratulations! You are now a seller.');
      fetchData();
    } catch (error) {
      console.error('Error applying to sell:', error);
      toast.error('Failed to apply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profile?.role === 'seller' && (profile?.role as string) !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center max-w-md p-8 bg-bg rounded-3xl shadow-sm border border-line">
          <div className="bg-ink/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-muted" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-ink">Seller Access Required</h1>
          <p className="text-muted mb-8">Join our community of premium sellers and start reaching thousands of customers today.</p>
          <button 
            onClick={handleApplyToSell}
            disabled={isSubmitting}
            className="w-full bg-ink text-bg py-4 rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-bg/20 border-t-bg rounded-full animate-spin" />
            ) : (
              'Apply to Sell'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-ink">Seller Hub</h1>
            <p className="text-muted">Welcome back, <span className="text-ink font-bold">{profile?.displayName || 'Partner'}</span>. Here's your performance.</p>
          </div>
          <button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="bg-ink text-bg px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Product
          </button>
        </header>

        {/* Stats & Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Stats Column */}
          <div className="space-y-6">
            {[
              { label: 'Total Products', value: products.length, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12%' },
              { label: 'Total Sales', value: orders.length, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: '+8%' },
              { label: 'Total Revenue', value: formatCurrency(sellerRevenue || 1240), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '+15%' },
            ].map((stat, i) => (
              <div key={i} className="bg-bg p-6 rounded-3xl border border-line shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{stat.trend}</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-ink">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-bg p-8 rounded-3xl border border-line shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-ink">Sales Performance</h2>
                <p className="text-sm text-muted">Last 6 months overview</p>
              </div>
              <div className="bg-ink/5 p-3 rounded-2xl">
                <BarChart3 className="w-5 h-5 text-muted" />
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getSalesChartData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'var(--muted)' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'var(--muted)' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'var(--line)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--bg)',
                      borderRadius: '16px', 
                      border: '1px solid var(--line)', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      color: 'var(--ink)'
                    }}
                    itemStyle={{ color: 'var(--ink)' }}
                  />
                  <Bar dataKey="sales" radius={[8, 8, 0, 0]}>
                    {getSalesChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === getSalesChartData().length - 1 ? 'var(--secondary)' : 'var(--line)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="bg-bg rounded-3xl border border-line shadow-sm overflow-hidden mb-12">
          <div className="p-6 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setActiveTab('inventory')}
                className={`text-sm font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'inventory' ? 'border-ink text-ink' : 'border-transparent text-muted'}`}
              >
                Inventory
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`text-sm font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'orders' ? 'border-ink text-ink' : 'border-transparent text-muted'}`}
              >
                Orders
              </button>
            </div>
            <div className="flex items-center space-x-4">
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
                        {activeTab === 'inventory' && (
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

          <div className="p-6">
            {activeTab === 'inventory' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="bg-ink/5 h-[400px] rounded-3xl animate-pulse" />
                  ))
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <Package className="w-12 h-12 text-muted mx-auto mb-4" />
                    <p className="text-muted">No products found</p>
                  </div>
                ) : filteredProducts.map((product) => (
                  <motion.div 
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-bg rounded-[32px] border border-line shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <Image 
                        src={product.images?.[0]} 
                        alt={product.name} 
                        className="w-full h-full group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="absolute top-4 left-4">
                        <span className="bg-bg/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm text-ink">
                          {product.category}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex-1 flex space-x-2">
                          <button 
                            onClick={() => openEditModal(product)}
                            className="flex-1 bg-bg text-ink py-3 rounded-xl font-bold text-xs hover:bg-ink hover:text-bg transition-all flex items-center justify-center"
                          >
                            <Edit2 className="w-3 h-3 mr-2" />
                            Edit
                          </button>
                          <Link href={`/product/${product.id}`}
                            className="flex-1 bg-white/20 backdrop-blur-md text-white py-3 rounded-xl font-bold text-xs hover:bg-white hover:text-black transition-all flex items-center justify-center border border-white/30"
                          >
                            <Eye className="w-3 h-3 mr-2" />
                            View
                          </Link>
                        </div>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="ml-2 p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-xl mb-1 group-hover:text-secondary transition-colors truncate max-w-[180px] text-ink">{product.name}</h3>
                          <p className="text-xs text-muted uppercase tracking-widest">{product.gender}</p>
                        </div>
                        <p className="font-bold text-xl text-ink">{formatCurrency(getProductPrice(product))}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-line mt-6">
                        <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 mr-1.5" />
                          Active
                        </div>
                        <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-muted">
                          <Clock className="w-3 h-3 mr-1.5" />
                          Stock: {product.stock}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-ink/5">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Order ID</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Items</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Revenue</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted italic">No orders found for your products</td>
                      </tr>
                    ) : filteredOrders.map((order) => {
                      const sellerItems = order.items.filter((item: any) => products.some(p => p.id === item.productId));
                      const sellerAmount = sellerItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
                      
                      return (
                        <tr key={order.id} className="hover:bg-ink/5 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-muted">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              {sellerItems.map((item: any, idx: number) => (
                                <span key={idx} className="text-sm font-medium text-ink">{item.name} x{item.quantity}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-sm text-ink">
                            {formatCurrency(sellerAmount)}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
                    <h2 className="text-2xl font-bold text-ink">{editingProduct ? 'Edit Product' : 'New Listing'}</h2>
                    <p className="text-sm text-muted">Fill in the details for your premium product.</p>
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
                    <div className="flex items-center space-x-3 pt-8">
                      <input 
                        type="checkbox" 
                        id="isTrending"
                        checked={formData.isTrending}
                        onChange={(e) => setFormData({...formData, isTrending: e.target.checked})}
                        className="w-5 h-5 accent-ink cursor-pointer"
                      />
                      <label htmlFor="isTrending" className="text-sm font-bold text-ink cursor-pointer">Mark as Trending</label>
                    </div>
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
                        editingProduct ? 'Update Listing' : 'Publish Listing'
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
      </div>
    </div>
  );
};
