import React from 'react';
import { X, ShoppingBag, Trash2, CreditCard, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Image } from './common/Image';
import { OrderItem } from '../types';
import { formatCurrency, cn } from '../utils';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onCheckout: () => void;
}

export function Cart({ isOpen, onClose, items, onRemove, onUpdateQuantity, onCheckout }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const fabricItems = items.filter(item => item.isFabric);
  const advanceRequired = fabricItems.reduce((sum, item) => sum + (item.price * item.quantity * 0.5), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-bg shadow-2xl z-[70] flex flex-col"
          >
            <div className="p-6 border-b border-line flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-ink" />
                <h2 className="text-xl font-serif font-bold tracking-tight text-ink">Your Cart</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-line rounded-full transition-colors text-ink">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="text-sm font-medium">Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.productId} className="flex space-x-4 group">
                    <div className="w-20 h-24 bg-line rounded-xl overflow-hidden flex-shrink-0">
                      <Image 
                        src={`https://picsum.photos/seed/${item.productId}/200/300`} 
                        alt={item.name} 
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-ink truncate">{item.name}</h4>
                        <button 
                          onClick={() => onRemove(item.productId)}
                          className="text-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-line rounded-lg overflow-hidden">
                          <button 
                            onClick={() => onUpdateQuantity(item.productId, -1)}
                            className="p-1 hover:bg-line transition-colors text-ink"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-bold text-ink">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.productId, 1)}
                            className="p-1 hover:bg-line transition-colors text-ink"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-secondary">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                      {item.isFabric && (
                        <p className="text-[10px] text-secondary font-bold mt-1 uppercase tracking-wider">
                          50% Advance Required
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 bg-line/30 border-t border-line space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-bold text-secondary">{formatCurrency(total)}</span>
                  </div>
                  {advanceRequired > 0 && (
                    <div className="flex justify-between text-sm text-secondary">
                      <span>Fabric Advance (50%)</span>
                      <span className="font-bold">{formatCurrency(advanceRequired)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-serif font-bold border-t border-line pt-2 text-secondary">
                    <span>Total Due Now</span>
                    <span>{formatCurrency(total - (fabricItems.length > 0 ? advanceRequired : 0) + advanceRequired)}</span>
                  </div>
                </div>

                <button 
                  onClick={onCheckout}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 hover:opacity-90 transition-all active:scale-95 shadow-lg"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Checkout Now</span>
                </button>
                <p className="text-[10px] text-center text-muted uppercase tracking-widest">
                  Secure Payment Powered by Stripe
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
