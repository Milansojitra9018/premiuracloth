"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import { formatCurrency, cn } from "@/src/utils";
import { 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck,
  Building2,
  Wallet,
  Lock,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from "@/src/components/SEO";
import { orderService } from "@/src/services/orderService";
import toast from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

export default function Checkout() {
  const { cartItems, cartCount, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useRouter();
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const fabricItems = cartItems.filter(item => item.isFabric);
  const advanceRequired = fabricItems.reduce((sum, item) => sum + (item.price * item.quantity * 0.5), 0);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ')[1] || '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  useEffect(() => {
    if (!authLoading && !user && step !== 'confirmation') {
      // We'll show a login required overlay instead of immediate redirect
    }
  }, [user, authLoading, step]);

  const validateShipping = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors: Record<string, string> = {};
    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber || formData.cardNumber.length < 16) newErrors.cardNumber = 'Valid card number is required';
      if (!formData.expiry) newErrors.expiry = 'Expiry date is required';
      if (!formData.cvc || formData.cvc.length < 3) newErrors.cvc = 'CVC is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const handleNext = async () => {
    if (step === 'shipping') {
      if (validateShipping()) setStep('payment');
    } else if (step === 'payment') {
      if (validatePayment()) {
        if (!user) return;
        setLoading(true);
        try {
          const orderData = {
            userId: user.uid,
            items: cartItems.map(item => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              isFabric: !!item.isFabric
            })),
            totalAmount: total,
            advancePaid: advanceRequired ? (total * 0.1) : 0,
            status: 'pending',
            paymentMethod: formData.paymentMethod,
            shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
            customerName: `${formData.firstName} ${formData.lastName}`,
          };

          await orderService.createOrder(orderData);
          setStep('confirmation');
          clearCart();
          toast.success('Order placed successfully!');
        } catch (error) {
          console.error('Error creating order:', error);
          toast.error('Failed to place order. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleBack = () => {
    if (step === 'payment') setStep('shipping');
    else if (step === 'confirmation') navigate.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user && step !== 'confirmation') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 bg-black/5 text-black rounded-full flex items-center justify-center mb-8">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-4xl font-bold tracking-tighter mb-4">Login Required</h2>
        <p className="text-gray-500 max-w-md mb-12">
          Please log in to your account to proceed with the checkout. This ensures your order details are securely saved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <button 
            onClick={() => navigate.push('/login')}
            className="flex-1 bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-black/90 transition-all"
          >
            Login / Sign Up
          </button>
          <button 
            onClick={() => navigate.push('/')}
            className="flex-1 bg-gray-100 text-black px-8 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && step !== 'confirmation') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <button 
          onClick={() => navigate.push('/')}
          className="bg-black text-white px-8 py-3 rounded-full font-bold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <SEO 
        title="Checkout"
        description="Securely complete your purchase of premium clothing and fabrics at Premiura. Fast and safe checkout process."
        keywords="checkout, secure payment, buy clothing online, Premiura checkout"
      />
      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto mb-16">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 -z-10" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-black transition-all duration-500 -z-10" 
            style={{ width: step === 'shipping' ? '0%' : step === 'payment' ? '50%' : '100%' }}
          />
          
          {[
            { id: 'shipping', icon: Truck, label: 'Shipping' },
            { id: 'payment', icon: CreditCard, label: 'Payment' },
            { id: 'confirmation', icon: CheckCircle2, label: 'Done' }
          ].map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = 
              (step === 'payment' && idx === 0) || 
              (step === 'confirmation' && (idx === 0 || idx === 1));

            return (
              <div key={s.id} className="flex flex-col items-center space-y-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isActive ? "bg-black text-white scale-110 shadow-lg" : 
                  isCompleted ? "bg-black text-white" : "bg-white border-2 border-gray-100 text-gray-300"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-colors",
                  isActive ? "text-black" : "text-gray-400"
                )}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {step === 'shipping' && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <section>
                  <h3 className="text-2xl font-bold tracking-tighter mb-6">Contact Information</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 transition-all",
                        errors.email ? "ring-2 ring-red-500" : "focus:ring-black/5"
                      )}
                    />
                    {errors.email && <p className="text-xs text-red-500 ml-2">{errors.email}</p>}
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold tracking-tighter mb-6">Shipping Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 transition-all",
                          errors.firstName ? "ring-2 ring-red-500" : "focus:ring-black/5"
                        )}
                      />
                      {errors.firstName && <p className="text-xs text-red-500 ml-2">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 transition-all",
                          errors.lastName ? "ring-2 ring-red-500" : "focus:ring-black/5"
                        )}
                      />
                      {errors.lastName && <p className="text-xs text-red-500 ml-2">{errors.lastName}</p>}
                    </div>
                    <div className="col-span-2 space-y-2">
                      <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 transition-all",
                          errors.address ? "ring-2 ring-red-500" : "focus:ring-black/5"
                        )}
                      />
                      {errors.address && <p className="text-xs text-red-500 ml-2">{errors.address}</p>}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 transition-all",
                          errors.city ? "ring-2 ring-red-500" : "focus:ring-black/5"
                        )}
                      />
                      {errors.city && <p className="text-xs text-red-500 ml-2">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="zipCode"
                        placeholder="ZIP / Postal Code"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 transition-all",
                          errors.zipCode ? "ring-2 ring-red-500" : "focus:ring-black/5"
                        )}
                      />
                      {errors.zipCode && <p className="text-xs text-red-500 ml-2">{errors.zipCode}</p>}
                    </div>
                  </div>
                </section>

                <button 
                  onClick={handleNext}
                  className="w-full bg-black text-white py-5 rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-black/90 transition-all active:scale-95"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <section>
                  <h3 className="text-2xl font-bold tracking-tighter mb-6">Payment Method</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Secure payment via Stripe' },
                      { id: 'upi', label: 'UPI / GPay / PhonePe', icon: Wallet, desc: 'Instant mobile payment' },
                      { id: 'bank', label: 'Net Banking', icon: Building2, desc: 'All major banks supported' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                        className={cn(
                          "flex items-center p-6 rounded-2xl border-2 transition-all text-left",
                          formData.paymentMethod === method.id ? "border-black bg-black/5" : "border-gray-100 hover:border-gray-200"
                        )}
                      >
                        <div className={cn(
                          "p-3 rounded-xl mr-4",
                          formData.paymentMethod === method.id ? "bg-black text-white" : "bg-gray-100 text-gray-400"
                        )}>
                          <method.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">{method.label}</p>
                          <p className="text-xs text-gray-500">{method.desc}</p>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                          formData.paymentMethod === method.id ? "border-black" : "border-gray-200"
                        )}>
                          {formData.paymentMethod === method.id && <div className="w-3 h-3 bg-black rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {formData.paymentMethod === 'card' && (
                  <section className="p-8 bg-gray-50 rounded-3xl space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="cardNumber"
                          placeholder="Card Number"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className={cn(
                            "w-full px-6 py-4 bg-white border-none rounded-2xl focus:ring-2 transition-all",
                            errors.cardNumber ? "ring-2 ring-red-500" : "focus:ring-black/5"
                          )}
                        />
                        {errors.cardNumber && <p className="text-xs text-red-500 ml-2">{errors.cardNumber}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <input
                            type="text"
                            name="expiry"
                            placeholder="MM / YY"
                            value={formData.expiry}
                            onChange={handleInputChange}
                            className={cn(
                              "w-full px-6 py-4 bg-white border-none rounded-2xl focus:ring-2 transition-all",
                              errors.expiry ? "ring-2 ring-red-500" : "focus:ring-black/5"
                            )}
                          />
                          {errors.expiry && <p className="text-xs text-red-500 ml-2">{errors.expiry}</p>}
                        </div>
                        <div className="space-y-2">
                          <input
                            type="text"
                            name="cvc"
                            placeholder="CVC"
                            value={formData.cvc}
                            onChange={handleInputChange}
                            className={cn(
                              "w-full px-6 py-4 bg-white border-none rounded-2xl focus:ring-2 transition-all",
                              errors.cvc ? "ring-2 ring-red-500" : "focus:ring-black/5"
                            )}
                          />
                          {errors.cvc && <p className="text-xs text-red-500 ml-2">{errors.cvc}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Encrypted & Secure</span>
                    </div>
                  </section>
                )}

                <div className="flex space-x-4">
                  <button 
                    onClick={handleBack}
                    className="flex-1 bg-gray-100 text-black py-5 rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-gray-200 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={loading}
                    className="flex-[2] bg-black text-white py-5 rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-black/90 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Complete Order</span>
                        <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'confirmation' && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-bold tracking-tighter">Order Confirmed!</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  Thank you for your purchase, {formData.firstName}. We've sent a confirmation email to {formData.email}.
                </p>
                <div className="pt-8">
                  <button 
                    onClick={() => navigate.push('/')}
                    className="bg-black text-white px-12 py-5 rounded-2xl font-bold hover:bg-black/90 transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Summary */}
        {step !== 'confirmation' && (
          <div className="lg:col-span-4">
            <div className="bg-gray-50 rounded-3xl p-8 sticky top-24 space-y-6">
              <h4 className="font-bold text-lg">Order Summary</h4>
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <div className="flex-1 pr-4">
                      <p className="font-bold truncate">{item.name}</p>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-secondary">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-black/5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold text-secondary">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest">Free</span>
                </div>
                {advanceRequired > 0 && (
                  <div className="flex justify-between text-sm text-amber-600">
                    <span>Fabric Advance (50%)</span>
                    <span className="font-bold">{formatCurrency(advanceRequired)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-3 border-t border-black/5 text-secondary">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {advanceRequired > 0 && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider leading-relaxed">
                    Note: For fabric items, {formatCurrency(advanceRequired)} is required as advance. The remaining balance will be collected upon delivery.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
