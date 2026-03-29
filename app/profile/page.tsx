"use client";
import React from 'react';
import { useAuth } from "@/src/context/AuthContext";
import { motion } from 'motion/react';
import { Image } from "@/src/components/common/Image";
import SEO from "@/src/components/SEO";
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Calendar, 
  LogOut, 
  ArrowLeft,
  ShoppingBag,
  Settings,
  Bell
} from 'lucide-react';
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/src/services/authService";
import { formatCurrency } from "@/src/utils";

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const navigate = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    navigate.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-gray-50 p-12 rounded-3xl text-center max-w-md w-full border border-black/5">
          <UserIcon className="w-16 h-16 mx-auto mb-6 text-gray-300" />
          <h1 className="text-2xl font-bold mb-2">Please Login</h1>
          <p className="text-gray-500 mb-8">You need to be logged in to view your profile.</p>
          <button 
            onClick={() => navigate.push('/')}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-black/90 transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4">
      <SEO 
        title="My Profile"
        description="Manage your Premiura account, view your orders, and update your personal information."
        keywords="user profile, account settings, order history, Premiura account"
      />
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate.back()}
          className="flex items-center text-sm text-gray-500 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 text-center"
            >
              <div className="relative inline-block mb-6">
                <Image 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`} 
                  alt={user.displayName || 'User'} 
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg mx-auto"
                />
                <div className="absolute bottom-1 right-1 bg-black text-white p-2 rounded-full border-2 border-white">
                  <Settings className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{user.displayName}</h2>
              <p className="text-gray-500 text-sm mt-1">{user.email}</p>
              
              <div className="mt-6 inline-flex items-center px-3 py-1 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                <Shield className="w-3 h-3 mr-1.5" />
                {profile?.role || 'User'}
              </div>

              <div className="mt-8 pt-8 border-t border-black/5">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 text-red-500 font-bold hover:bg-red-50 py-3 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Orders</p>
                  <p className="text-xl font-bold">0</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Reviews</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Activity */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-black/5"
            >
              <h3 className="text-xl font-bold mb-8 flex items-center">
                <UserIcon className="w-5 h-5 mr-3" />
                Account Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Full Name</p>
                  <p className="font-medium">{user.displayName || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Email Address</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Member Since</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">User ID</p>
                  <p className="font-mono text-[10px] text-gray-400 break-all">{user.uid}</p>
                </div>
              </div>
            </motion.div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-3" />
                  Recent Orders
                </h3>
                <button className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">
                  View All
                </button>
              </div>
              
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No orders found yet.</p>
                <button 
                  onClick={() => navigate.push('/products')}
                  className="mt-4 text-black font-bold text-sm underline underline-offset-4"
                >
                  Start Shopping
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button className="flex items-center p-6 bg-white rounded-3xl border border-black/5 hover:bg-gray-50 transition-colors text-left group">
                <div className="p-3 bg-blue-50 rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                  <Bell className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-bold">Notifications</p>
                  <p className="text-xs text-gray-400">Manage your alerts</p>
                </div>
              </button>
              <button className="flex items-center p-6 bg-white rounded-3xl border border-black/5 hover:bg-gray-50 transition-colors text-left group">
                <div className="p-3 bg-purple-50 rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="font-bold">Preferences</p>
                  <p className="text-xs text-gray-400">App & Display settings</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
