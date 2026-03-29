"use client";
import React from 'react';
import { motion } from 'motion/react';
import SEO from "@/src/components/SEO";
import { LogIn, Shield, ShoppingBag, ArrowRight } from 'lucide-react';
import { useRouter, usePathname } from "next/navigation";
// removed bad import
import { useAuth } from "@/src/context/AuthContext";
import { authService } from "@/src/services/authService";

import { Image } from "@/src/components/common/Image";

export default function Login() {
  const navigate = useRouter();
  const location = usePathname();
  const { user } = useAuth();
  const from = "/";

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate.replace(from);
    }
  }, [user, navigate, from]);

  const handleGoogleLogin = async () => {
    try {
      await authService.loginWithGoogle();
      navigate.replace(from);
    } catch (error: any) {
      console.error('Login failed', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <SEO 
        title="Login"
        description="Sign in to your Premiura account to access your orders, favorites, and personalized fashion recommendations."
        keywords="login, sign in, Premiura account access"
      />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-sm border border-black/5"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-black rounded-2xl flex items-center justify-center mb-6">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tighter text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-500">Please sign in to your account to continue</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="group relative w-full flex justify-center py-4 px-4 border border-black/10 text-sm font-bold rounded-2xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all items-center space-x-3"
          >
            <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" alt="Google" className="w-5 h-5" />
            <span>Continue with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Secure access provided by Firebase</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="p-4 bg-gray-50 rounded-2xl border border-black/5">
            <Shield className="w-5 h-5 text-black mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Security</p>
            <p className="text-xs font-medium text-gray-600">End-to-end encrypted</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-black/5">
            <ArrowRight className="w-5 h-5 text-black mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fast</p>
            <p className="text-xs font-medium text-gray-600">One-click login</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};
